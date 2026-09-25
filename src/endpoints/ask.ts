import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  streamText,
  toUIMessageStream,
  type UIMessage,
  type UIMessageStreamWriter,
} from 'ai'
import type { Endpoint, PayloadRequest } from 'payload'
import { backfillAskIndex, isBackfillRunning, readLastIndexRebuild } from '@/features/ask/backfill'
import {
  ASK_HANDOFF_STATES,
  ASK_HANDOFFS,
  type AskHandoff,
  type AskHandoffReason,
  type AskHandoffState,
  type AskNextPage,
  type AskUIMessage,
  handoffOf,
} from '@/features/ask/handoff'
import { askHandoffTool, resolveAskHandoff } from '@/features/ask/handoffTool'
import { askHistory } from '@/features/ask/history'
import { journeyFrom } from '@/features/ask/journey'
import { EMPTY_JOURNEY, resolveJourney } from '@/features/ask/journeyPages'
import {
  type AskNextPageJudgment,
  type AskOfferOnScreen,
  type AskPageCandidate,
  type AskPassage,
  type AskPassageJudgment,
  type AskTurnJudgment,
  type AskTurnRoute,
  askJudgeMode,
  dependsOnPrevious,
  isAside,
  judgeNextPage,
  judgePassages,
  judgeTurn,
  leansOnPage,
  offTopic,
  pickNextPage,
  routeCardReason,
  routePassage,
  routeTurn,
  wantsTheTeam,
} from '@/features/ask/judge'
import { messageText } from '@/features/ask/messageText'
import { ASK_MODEL_API_KEY_VAR, askModel } from '@/features/ask/model'
import { askSystemPrompt, offersAskHandoff } from '@/features/ask/prompts'
import {
  type AskTurnRecord,
  askIdFrom,
  markAskTurn,
  pagePathFrom,
  recordAskQuestion,
} from '@/features/ask/questions'
import { hasIdentifyingNumber } from '@/features/ask/redact'
import {
  type PassageCheck,
  pageRetrievalQuery,
  prepareRetrieval,
  type RetrievedSource,
  retrievalQueries,
} from '@/features/ask/retrieve'
import { namesStory, resolveStoryBrief, withStoryBrief } from '@/features/ask/storyBrief'
import {
  isUsageConfigured,
  OPENAI_ADMIN_KEY_VAR,
  OpenAIAdminError,
  readUsageReport,
  refreshUsageReport,
} from '@/features/ask/usage'
import {
  ASK_MAX_MESSAGES,
  ASK_QUESTION_LENGTH,
  ASK_RATING_REASONS,
  ASK_RATINGS,
  ASK_SCOPE_REPLY,
  type AskOutcome,
  type AskRetrievalPath,
  askOutcome,
} from '@/features/ask/vocabulary'
import { isOption } from '@/shared/content/options'
import { surfaceForPath } from '@/shared/content/surfaces'
import { afterResponse } from '@/utilities/afterResponse'
import { findEmailAddress } from '@/utilities/emailAddress'
import { captureServerEvent } from '@/utilities/posthog'

/**
 * Public RAG endpoint (mounted under /api by the Payload root config).
 *
 * Speaks the AI SDK UI-message-stream protocol so the widget drives it with
 * `useChat`: embedding retrieval over the content corpus → matched documents
 * streamed back as source-url parts, followed by a grounded answer from the
 * model with those documents as the only allowed context. The model answers
 * in the studio's voice, gives partial answers when the sources only half
 * cover a question, and never invents facts. When a person is the better next
 * step it calls the `handoff` tool, and the card it shows is worded in code
 * and filled from Site Info (src/features/ask/handoffTool.ts). Token
 * discipline: a first-turn question with no matching sources gets that card
 * (`no_answer`) with no model call; only follow-up turns reach the model
 * source-less (so "thanks" or "say that again" stay conversational) and those
 * run under a tight output cap.
 *
 * The judge (src/features/ask/judge.ts, `ASK_JEV`): `off` is the path above,
 * unchanged. `shadow` runs Jev beside it and measures, deciding nothing.
 * `on` moves the decisions out of the writing model: contact details are
 * found by a regex, Jev classifies the turn while the query is embedded, a
 * card-only turn is answered with no retrieval and no model, retrieved
 * passages are vetted before they become sources, and the model writes with
 * no tool while code appends the card. A failed or unsure judgment is the
 * path above, so a visitor never sees a Jev error.
 *
 * A thin case study (src/features/ask/storyBrief.ts, mode `on`): a question
 * about the work page it was asked on, where the case study's story is not
 * written yet, is answered from the record's brief (the client, the kinds of
 * work, the summary) and closes with the `case_study` card, which says the
 * story is on its way and offers a partner to walk through it.
 */

/** Output budget per answer; includes gpt-5 reasoning tokens, so leave headroom over the ~120-word answer. */
const MAX_ANSWER_TOKENS = 1_200
/**
 * Output budget for a turn the judge routed: no tool and minimal reasoning, so
 * the budget is the words alone. Measured 2026-09-19 over 43 such answers: 180
 * tokens at most, 115 at the median.
 */
const MAX_WRITING_TOKENS = 400
/** Source-less follow-up turns are conversational only (a thanks, a rephrase), so cap them hard. */
const MAX_CHAT_ONLY_TOKENS = 400

/**
 * Reasoning effort for the writing model. With the tool on offer it also
 * judges (is a person the next step, do the sources answer this), which is
 * what `low` was tuned for. A routed turn has had those decisions made and
 * its passages vetted, so the model only writes: `minimal` spends no
 * reasoning tokens and took the median time to first word from 4.7 s to
 * 1.5 s with cards and sources unchanged (docs/perf/ask-jev/report.md).
 * Rollback is this one value.
 */
const REASONING_EFFORT = { deciding: 'low', writing: 'minimal' } as const

const json = (body: unknown, status = 200) => Response.json(body, { status })

/**
 * Fixed-window in-memory limiter, one budget per public route so feedback
 * taps never spend the question allowance. On serverless this is per warm
 * instance, so it's a cost fuse against naive abuse, not a hard guarantee;
 * acceptable for an MVP; move to a shared store if the endpoint ever draws
 * real traffic.
 */
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60_000
const hits = new Map<string, { count: number; windowStart: number }>()

function isRateLimited(req: PayloadRequest, route: string): boolean {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const key = `${route}:${ip}`
  const now = Date.now()
  const entry = hits.get(key)
  if (!entry || now - entry.windowStart >= RATE_WINDOW_MS) {
    hits.set(key, { count: 1, windowStart: now })
    return false
  }
  entry.count += 1
  return entry.count > RATE_LIMIT
}

const RATE_LIMITED = 'Too many questions, try again in a minute.'

/** The user turn before the current one, or null on a first turn. */
function previousUserQuestion(messages: UIMessage[]): string | null {
  const previousUser = messages
    .slice(0, -1)
    .filter((message) => message.role === 'user')
    .at(-1)
  return previousUser ? messageText(previousUser).trim() || null : null
}

/**
 * The offer under the reply the visitor is answering, so Jev can tell a "yes"
 * to it (judge.ts, `accepts_offer`). Every settled reply closes with one until
 * the visitor has sent: its reason's line, or the quiet one. Read from the
 * transcript as sent, since `askHistory` keeps text parts only.
 */
function offerOnScreen(
  messages: UIMessage[],
  handoffState: AskHandoffState,
): AskOfferOnScreen | null {
  const reply = messages.at(-2)
  if (handoffState === 'sent' || reply?.role !== 'assistant') return null
  try {
    const handoff = handoffOf(reply as AskUIMessage)
    const copy = ASK_HANDOFFS[handoff?.reason ?? 'none']
    return { offer: copy.offer, reply: messageText(reply).trim() || (copy.lead ?? '') }
  } catch {
    // A part the client sent malformed: no offer check, the turn routes as before.
    return null
  }
}

/** Escapes the attribute values interpolated into the source tags. */
function attr(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')
}

/**
 * Streams a handoff card as the whole reply, without a model call: the same
 * `tool-handoff` part the model's own tool call produces, so the client has
 * one way to render it.
 */
function handoffResponse(handoff: AskHandoff, aside: boolean): Response {
  const stream = createUIMessageStream<AskUIMessage>({
    execute: ({ writer }) => {
      writer.write({ type: 'start' })
      writeTurnNote(writer, aside)
      writeHandoff(writer, handoff)
      writer.write({ type: 'finish' })
    },
  })
  return createUIMessageStreamResponse({ stream })
}

/** A reply that is code's own words and nothing else: no model call, no sources, no card. */
function textResponse(text: string, aside: boolean): Response {
  const stream = createUIMessageStream<AskUIMessage>({
    execute: ({ writer }) => {
      const id = generateId()
      writer.write({ type: 'start' })
      writeTurnNote(writer, aside)
      writer.write({ type: 'text-start', id })
      writer.write({ type: 'text-delta', id, delta: text })
      writer.write({ type: 'text-end', id })
      writer.write({ type: 'finish' })
    },
  })
  return createUIMessageStreamResponse({ stream })
}

/** Marks the question a reply answers as an aside (`data-turn`), which the handoff form leaves out. */
function writeTurnNote(writer: UIMessageStreamWriter<AskUIMessage>, aside: boolean): void {
  if (aside) writer.write({ type: 'data-turn', id: generateId(), data: { aside: true } })
}

/** The `tool-handoff` part as the model's own tool call would stream it, written by code. */
function writeHandoff(writer: UIMessageStreamWriter<AskUIMessage>, handoff: AskHandoff): void {
  const toolCallId = generateId()
  writer.write({
    type: 'tool-input-available',
    toolCallId,
    toolName: 'handoff',
    input: { reason: handoff.reason },
  })
  writer.write({ type: 'tool-output-available', toolCallId, output: handoff })
}

/**
 * The card a route would have ended in, for shadow mode's agreement rate: its
 * own reason, or for an evidence route left with nothing to ground on (the
 * passage check kept nothing, or nothing was retrieved to check) the card
 * that stands in for the answer.
 */
function shadowCard(route: AskTurnRoute, grounded: boolean): AskHandoffReason | null {
  if (route.kind === 'evidence' && !grounded) return route.reason ?? 'no_answer'
  return routeCardReason(route)
}

/**
 * The card a grounded, routed reply closes with. The turn's own reason comes
 * first: a visitor pricing their project on a thin case study is still an
 * estimate. A turn with none, answered from a thin story's brief, closes with
 * the offer to be walked through it.
 */
function closingCardReason(
  route: AskTurnRoute,
  { thinStory, mayOffer }: { thinStory: boolean; mayOffer: boolean },
): AskHandoffReason | null {
  return routeCardReason(route) ?? (thinStory && mayOffer ? 'case_study' : null)
}

const ask: Endpoint = {
  path: '/ask',
  method: 'post',
  handler: async (req) => {
    // Site Info › Ask › Hide Ask removes every surface, this one included:
    // a hidden feature must not keep answering (and billing) for stale
    // clients or direct callers.
    const siteInfo = await req.payload.findGlobal({ slug: 'site-info', depth: 0 })
    if (siteInfo.ask?.hidden) {
      return json({ error: 'Ask is turned off on this site.' }, 404)
    }

    if (!process.env[ASK_MODEL_API_KEY_VAR]) {
      req.payload.logger.error(`Ask endpoint disabled: ${ASK_MODEL_API_KEY_VAR} is not set.`)
      return json({ error: 'Ask is not configured on this site yet.' }, 503)
    }

    if (isRateLimited(req, 'ask')) return json({ error: RATE_LIMITED }, 429)

    // `id` is the AI SDK chat id and `pagePath` the page the composer sits on
    // (see useAskChat); both are kept only if well formed. `handoff` is where
    // the conversation stands with the team; an unknown value reads as none,
    // the state that changes nothing.
    const body = (await req.json?.().catch(() => null)) as {
      messages?: unknown
      id?: unknown
      pagePath?: unknown
      handoff?: unknown
      journey?: unknown
    } | null
    const rawMessages = Array.isArray(body?.messages) ? (body.messages as UIMessage[]) : []
    const messages = rawMessages.length <= ASK_MAX_MESSAGES ? askHistory(rawMessages) : null
    const lastMessage = messages?.at(-1)
    const handoffState: AskHandoffState = ASK_HANDOFF_STATES.includes(
      body?.handoff as AskHandoffState,
    )
      ? (body?.handoff as AskHandoffState)
      : 'none'

    if (!messages || lastMessage?.role !== 'user') {
      return json({ error: 'Send a conversation ending in a user question.' }, 400)
    }

    const question = messageText(lastMessage).trim()
    if (question.length < ASK_QUESTION_LENGTH.min || question.length > ASK_QUESTION_LENGTH.max) {
      return json(
        {
          error: `Question must be between ${ASK_QUESTION_LENGTH.min} and ${ASK_QUESTION_LENGTH.max} characters.`,
        },
        400,
      )
    }

    const startedAt = Date.now()
    const conversation = askIdFrom(body?.id)
    const pagePath = pagePathFrom(body?.pagePath)
    const isFollowUp = messages.length > 1
    const previousQuestion = previousUserQuestion(messages)
    const mode = askJudgeMode()
    // Where the visitor is and what they have read (journey.ts), in the
    // index's own words. Off reads none of it: off is the path as it was.
    const journey =
      mode === 'off'
        ? EMPTY_JOURNEY
        : await resolveJourney(req.payload, journeyFrom(body?.journey), pagePath)
    // The page the question was asked on, when it is about one thing a question can lean on.
    const subjectPage = journey.current?.subject ? journey.current : null
    // What the record behind that page can say when its story is thin, read
    // while Jev and the embedding are in flight. Null for any page but a work page.
    const storyBrief =
      mode === 'on' && subjectPage ? resolveStoryBrief(req.payload, subjectPage.path) : null

    // What the judge saw and did this turn, for the log line and PostHog:
    // metadata only, never the question and never a probability beside it.
    const judged: {
      turn: Promise<AskTurnJudgment | null> | null
      judgment: AskTurnJudgment | null
      route: AskTurnRoute | null
      /** One check per query form searched: two when the page form rides beside the plain one. */
      passages: Promise<AskPassageJudgment | null>[]
      chunksKept: number | null
      firstOutputMs: number | null
      modelSkipped: boolean
      pageAttached: boolean
      /** The turn was answered from a thin case study's brief. */
      thinStory: boolean
      /** Jev's page pick, for a grounded reply; null when it was not asked or failed. */
      nextPage: Promise<AskNextPageJudgment | null> | null
      /** The pages the reply's page card could open; empty when it gets none. */
      pageCandidates: AskPageCandidate[]
      /** The turn was about something else, and code said what Ask covers. */
      offTopic: boolean
    } = {
      turn: null,
      judgment: null,
      route: null,
      passages: [],
      chunksKept: null,
      firstOutputMs: null,
      modelSkipped: false,
      pageAttached: false,
      thinStory: false,
      nextPage: null,
      pageCandidates: [],
      offTopic: false,
    }
    const markFirstOutput = () => {
      judged.firstOutputMs ??= Date.now() - startedAt
    }
    const hasContactDetails =
      offersAskHandoff(handoffState) &&
      (findEmailAddress(question) !== null || hasIdentifyingNumber(question))

    let sources: RetrievedSource[] = []
    let retrieval: AskRetrievalPath = 'none'
    let chunkCandidates = 0

    // One row and one event per turn, whichever callback closes it (a model
    // stream can end in a finish, an error, or the visitor's Stop).
    let recorded = false
    const record = (
      turn: Pick<
        AskTurnRecord,
        'answer' | 'outcome' | 'handoffReason' | 'inputTokens' | 'outputTokens'
      >,
    ) => {
      if (recorded) return
      recorded = true
      const latencyMs = Date.now() - startedAt
      recordAskQuestion(req, {
        question,
        turn: lastMessage.id,
        conversation,
        pagePath,
        followUp: isFollowUp,
        retrieval,
        sources,
        latencyMs,
        ...turn,
      })

      const report = async () => {
        // Shadow mode never waits on Jev in the response path, so its answers
        // are collected here; each is bounded by the judge's own timeout.
        const judgment = judged.turn ? await judged.turn : judged.judgment
        const nextPageJudgment = judged.nextPage ? await judged.nextPage : null
        const checks = (await Promise.all(judged.passages)).filter((check) => check !== null)
        const passages =
          checks.length > 0
            ? {
                answers: checks.flatMap((check) => check.answers),
                // The checks ran side by side: the wait was the slower one's.
                ms: Math.max(...checks.map((check) => check.ms)),
              }
            : null
        // Shadow's route is what `on` would have decided for this turn.
        const route =
          judged.route ??
          (mode === 'shadow' ? routeTurn(judgment, { isFollowUp, handoffState }) : null)
        const chunksKept =
          judged.chunksKept ??
          (passages
            ? passages.answers.filter((answers) => routePassage(answers) === 'keep').length
            : chunkCandidates)
        const settled = turn.outcome !== 'stopped' && turn.outcome !== 'error'
        // The stream writes the card after this turn is recorded, so its
        // choice is made again here, from the same candidates and judgment.
        const pageShown = settled && pickNextPage(judged.pageCandidates, nextPageJudgment) !== null
        const facts = {
          judge_mode: mode,
          judge_ms: judgment?.ms ?? null,
          judge_failed: mode !== 'off' && judged.turn !== null && judgment === null,
          judge_request: judgment?.request ?? null,
          judge_confidence: judgment?.confidence ?? null,
          judge_sends: judgment ? wantsTheTeam(judgment) : null,
          judge_aside: judgment ? isAside(judgment) : null,
          off_topic: judged.offTopic,
          judge_agrees:
            mode === 'shadow' && settled && route && route.kind !== 'fallback'
              ? (hasContactDetails
                  ? 'contact_details'
                  : shadowCard(route, passages ? chunksKept > 0 : sources.length > 0)) ===
                turn.handoffReason
              : null,
          chunks_candidates: chunkCandidates,
          chunks_kept: chunksKept,
          passages_ms: passages?.ms ?? null,
          first_output_ms: judged.firstOutputMs,
          model_skipped: judged.modelSkipped,
          fell_back: mode === 'on' && route?.kind === 'fallback',
          journey_pages: journey.read.length + (journey.current ? 1 : 0),
          page_leaned: subjectPage ? leansOnPage(judgment) : null,
          page_attached: judged.pageAttached,
          story_thin: judged.thinStory,
          next_page_ms: nextPageJudgment?.ms ?? null,
          next_page_shown: pageShown,
          answer_model: judged.modelSkipped ? null : askModel.modelId,
        }
        req.payload.logger.info({
          msg: 'ask answered',
          questionLength: question.length,
          sourceCount: sources.length,
          outcome: turn.outcome,
          handoffReason: turn.handoffReason,
          latencyMs,
          ...facts,
          judge_model: judgment?.model ?? null,
        })
        captureServerEvent({
          headers: req.headers,
          fallbackDistinctId: `ask:${crypto.randomUUID()}`,
          event: 'ask_questioned',
          properties: {
            is_follow_up: isFollowUp,
            source_count: sources.length,
            question_length: question.length,
            handoff_reason: turn.handoffReason,
            outcome: turn.outcome,
            retrieval,
            latency_ms: latencyMs,
            page_path: pagePath,
            ...facts,
          },
        })
      }
      // Only shadow mode can still be waiting on Jev here; it must not hold the reply.
      if (mode === 'shadow') afterResponse(report)
      else void report()
    }

    /** The card as the whole reply: no retrieval behind it, no model call. */
    const cardOnly = (reason: AskHandoffReason): Response => {
      judged.modelSkipped = true
      markFirstOutput()
      record({
        answer: '',
        outcome: askOutcome({ grounded: false, handoffReason: reason }),
        handoffReason: reason,
      })
      return handoffResponse(resolveAskHandoff(siteInfo, reason), isAside(judged.judgment))
    }

    /** What Ask covers, in code's words, for a question about something else. */
    const scopeOnly = (): Response => {
      judged.modelSkipped = true
      judged.offTopic = true
      markFirstOutput()
      record({ answer: ASK_SCOPE_REPLY, outcome: 'no_sources', handoffReason: null })
      return textResponse(ASK_SCOPE_REPLY, false)
    }

    // Contact details are a known rule, so code finds them (the same patterns
    // that redact them) before Jev or the model is asked anything.
    if (mode === 'on' && hasContactDetails) return cardOnly('contact_details')

    // The query is embedded while Jev reads the turn: the embedding call is
    // the slower of the two, so the turn's decision adds no wait. Only `on`
    // embeds both query forms, to pick once `depends_on_previous` is known.
    // A third form waits beside them when the question was asked on a page
    // about one thing: the question under that page's title, searched only
    // if `open_reference` says the question leaves its subject to the page.
    const queries = retrievalQueries(question, previousQuestion)
    const defaultQuery = queries.length - 1
    let pageQuery: number | null = null
    if (mode === 'on' && subjectPage) {
      pageQuery = queries.length
      queries.push(pageRetrievalQuery(question, subjectPage.title))
    }
    const prepared = prepareRetrieval(req.payload, mode === 'on' ? queries : queries.slice(-1))
    if (mode !== 'off') {
      judged.turn = judgeTurn({
        question,
        previousQuestion,
        onKnownPage: subjectPage !== null,
        offerOnScreen: offerOnScreen(rawMessages, handoffState),
        signal: req.signal,
        logger: req.payload.logger,
      })
    }

    let route: AskTurnRoute = { kind: 'fallback' }
    if (mode === 'on') {
      judged.judgment = await judged.turn
      route = routeTurn(judged.judgment, { isFollowUp, handoffState })
      judged.route = route
    }
    if (route.kind === 'card') return cardOnly(route.reason)

    // Jev's passage check. `on` hands it to the retrieval seam as a veto and
    // drops what it drops; `shadow` only watches the same candidates, and
    // reads the answer when the turn is recorded.
    const checkPassages = (query: string, chunks: AskPassage[]) => {
      const passages = judgePassages({
        query,
        chunks,
        signal: req.signal,
        logger: req.payload.logger,
      })
      judged.passages.push(passages)
      return passages
    }
    const check: PassageCheck = async (query, chunks) => {
      const passages = await checkPassages(query, chunks)
      return (
        passages?.answers.map((answers) => routePassage(answers) === 'keep') ??
        chunks.map(() => true)
      )
    }

    if (route.kind !== 'conversation') {
      // A follow-up that leans on the previous turn searches with it, as
      // before, and any other routed turn searches alone. A turn that points
      // at something it does not name searches under its page's title as
      // well: beside, never instead, so a wrong yes loses nothing ("them" in
      // a follow-up may be the last answer's subject or the page's, and the
      // pool holds both).
      let query = mode === 'on' ? defaultQuery : undefined
      let also: number | undefined
      if (route.kind === 'evidence') {
        if (!(isFollowUp && dependsOnPrevious(judged.judgment))) query = 0
        if (pageQuery !== null && leansOnPage(judged.judgment)) {
          also = pageQuery
          judged.pageAttached = true
        }
      }
      const found = await prepared.search({
        query,
        also,
        check: route.kind === 'evidence' ? check : undefined,
        observe: mode === 'shadow' ? checkPassages : undefined,
      })
      sources = found.sources
      retrieval = found.path
      chunkCandidates = found.chunks.candidates
      if (mode === 'on') judged.chunksKept = found.chunks.kept
    }

    // A question about the page's own case study, where that story is still
    // thin: the record's brief leads the sources, so the answer can always
    // name the kinds of work, and a passage check that kept nothing no longer
    // means "the site doesn't cover that". The page is the subject when the
    // question leaves its subject to it (Jev's `open_reference`) or names it
    // (code's lookup); a follow-up that leans on the turn before it is about
    // that turn's subject, which may be another client.
    const brief = route.kind === 'evidence' ? await storyBrief : null
    const thinStory =
      brief?.thin &&
      (namesStory(question, brief) ||
        (leansOnPage(judged.judgment) && !(isFollowUp && dependsOnPrevious(judged.judgment))))
        ? brief
        : null
    if (thinStory) {
      sources = withStoryBrief(sources, thinStory)
      judged.thinStory = true
    }

    // Nothing to ground on. Today's path: the card on a first turn, no tokens
    // spent, while follow-ups still reach the model source-less so the
    // conversation can carry ("thanks", "can you say that more simply?").
    // A routed turn: the card on any turn, since Jev already told a thanks
    // from a question; it carries the turn's own reason when it has one.
    // A question about something else entirely is not the team's either: the
    // reply says what Ask covers (judge.ts, `offTopic`).
    if (sources.length === 0 && route.kind === 'evidence' && offTopic(judged.judgment)) {
      return scopeOnly()
    }
    if (sources.length === 0 && offersAskHandoff(handoffState)) {
      if (route.kind === 'evidence') return cardOnly(route.reason ?? 'no_answer')
      if (route.kind === 'fallback' && !isFollowUp) return cardOnly('no_answer')
    }

    const sourcesBlock = sources
      .map(
        (source, i) =>
          `<source index="${i + 1}" title="${attr(source.title)}" url="${attr(source.url)}">\n${source.text}\n</source>`,
      )
      .join('\n\n')

    // The prompt and the tool list agree: once the visitor has sent, the
    // tool is withheld and the prompt stops asking for it. A routed turn
    // never has the tool: the decision is made, and code appends the card.
    const grounded = sources.length > 0
    const routed = route.kind !== 'fallback'
    const offersTool = !routed && offersAskHandoff(handoffState)
    const closingCard =
      routed && grounded
        ? closingCardReason(route, {
            thinStory: thinStory !== null,
            mayOffer: offersAskHandoff(handoffState),
          })
        : null
    const system = [
      askSystemPrompt({
        grounded,
        handoff: handoffState,
        tool: offersTool,
        cardFollows: closingCard !== null,
        journey: routed ? journey : null,
        thinStory: thinStory?.title ?? null,
      }),
      grounded ? `<sources>\n${sourcesBlock}\n</sources>` : null,
    ]
      .filter(Boolean)
      .join('\n\n')

    // The page card: one of the reply's sources, never the page the visitor
    // is already on. Jev picks it while the model writes (`on`); without the
    // judge it is retrieval's top page. A thin story's reply has none: its
    // one page is the page they are on.
    const pageCandidates =
      grounded && !thinStory
        ? sources
            .filter((source) => source.url !== pagePath)
            .map((source) => ({
              url: source.url,
              title: source.title,
              section: surfaceForPath(source.url)?.title ?? null,
            }))
        : []
    judged.pageCandidates = pageCandidates
    if (mode === 'on' && pageCandidates.length > 0) {
      judged.nextPage = judgeNextPage({
        question,
        pages: pageCandidates,
        signal: req.signal,
        logger: req.payload.logger,
      })
    }
    const nextPage = async (): Promise<AskNextPage | null> => {
      const page = pickNextPage(pageCandidates, judged.nextPage ? await judged.nextPage : null)
      return page ? { url: page.url, title: page.title } : null
    }

    const tools = offersTool ? { handoff: askHandoffTool(siteInfo) } : undefined
    const result = streamText({
      model: askModel,
      system,
      messages: await convertToModelMessages(messages),
      tools,
      maxOutputTokens: !grounded
        ? MAX_CHAT_ONLY_TOKENS
        : routed
          ? MAX_WRITING_TOKENS
          : MAX_ANSWER_TOKENS,
      // The visitor's Stop (and a dropped connection) aborts the model call,
      // so tokens stop with the reader and the turn is recorded as stopped.
      abortSignal: req.signal,
      // Extractive answers over provided sources don't need deep reasoning;
      // the default (medium) burns hidden reasoning tokens on every question.
      // `store: false`: OpenAI's Responses API otherwise keeps every exchange
      // for 30 days in the dashboard logs. Nothing here needs that: the client
      // resends the transcript each turn, and for reasoning models the SDK asks
      // for encrypted reasoning instead of server-side item references.
      providerOptions: {
        openai: {
          reasoningEffort: routed ? REASONING_EFFORT.writing : REASONING_EFFORT.deciding,
          store: false,
        },
      },
      onChunk: ({ chunk }) => {
        if (chunk.type === 'text-delta' || chunk.type === 'tool-result') markFirstOutput()
      },
      onFinish: ({ text, totalUsage, staticToolCalls }) => {
        const handoffReason =
          closingCard ??
          staticToolCalls.find((call) => call.toolName === 'handoff')?.input.reason ??
          null
        record({
          answer: text,
          outcome: askOutcome({ grounded, handoffReason }),
          handoffReason,
          inputTokens: totalUsage.inputTokens ?? null,
          outputTokens: totalUsage.outputTokens ?? null,
        })
      },
      onAbort: ({ steps }) => {
        record({
          answer: steps.map((step) => step.text).join(''),
          outcome: 'stopped',
          handoffReason: null,
        })
      },
      // Logged once, by the UI stream's onError below, which every error reaches.
      onError: () => record({ answer: '', outcome: 'error', handoffReason: null }),
    })

    const stream = createUIMessageStream<AskUIMessage>({
      execute: async ({ writer }) => {
        writer.write({ type: 'start' })
        writeTurnNote(writer, isAside(judged.judgment))
        for (const source of sources) {
          writer.write({
            type: 'source-url',
            sourceId: source.url,
            url: source.url,
            title: source.title,
          })
        }
        // The Ask UI renders text, sources, the page card, and the handoff
        // card. Reasoning parts would carry the encrypted reasoning blob to
        // the browser and back on every turn.
        //
        // The cards after the words: the model's stream is forwarded without
        // its finish, then code writes the page card and, when the route
        // carries one, the same handoff part the tool call would have, so a
        // partial answer reliably ends in its offer. A reply that was stopped
        // or failed gets neither.
        const reader = toUIMessageStream<NonNullable<typeof tools>, AskUIMessage>({
          stream: result.fullStream,
          sendStart: false,
          sendFinish: false,
          sendReasoning: false,
        }).getReader()
        let settled = true
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          if (value.type === 'abort' || value.type === 'error') settled = false
          writer.write(value)
        }
        if (settled) {
          const page = await nextPage()
          if (page) writer.write({ type: 'data-nextPage', id: generateId(), data: page })
          if (closingCard) writeHandoff(writer, resolveAskHandoff(siteInfo, closingCard))
        }
        writer.write({ type: 'finish' })
      },
      onError: (err) => {
        req.payload.logger.error({ msg: 'ask reply failed', err })
        return 'Something went wrong answering that. Try again shortly.'
      },
    })

    return createUIMessageStreamResponse({ stream })
  },
}

/**
 * Public: the visitor's word on a turn. A thumbs up or down (with a one-tap
 * reason), or the contact-page click; `inquiry_sent` is the intake's to
 * write, never a caller's. The row is found by the chat and message ids the
 * client already holds, so no row id ever reaches the browser; an unknown
 * pair is a quiet no-op. Its own limiter budget, so taps never cost questions.
 */
const feedback: Endpoint = {
  path: '/ask/feedback',
  method: 'post',
  handler: async (req) => {
    if (isRateLimited(req, 'feedback')) return json({ error: RATE_LIMITED }, 429)

    const body = (await req.json?.().catch(() => null)) as Record<string, unknown> | null
    const rating = isOption(ASK_RATINGS, body?.rating) ? body.rating : undefined
    const ratingReason =
      rating === 'down' && isOption(ASK_RATING_REASONS, body?.reason) ? body.reason : undefined
    const handoff = body?.handoff === 'clicked' ? 'clicked' : undefined
    if (!rating && !handoff) return json({ error: 'Nothing to record.' }, 400)

    const turn = await markAskTurn(
      req.payload,
      { conversation: body?.id, turn: body?.turn },
      { rating, ratingReason, handoff },
    )
    if (turn) captureAskFeedback(req, { rating, ratingReason, handoff, ...turn })
    return json({ ok: true })
  },
}

/** `ask_rated` for a rating, `ask_handoff_clicked` for the contact-page fallback; an inquiry is its own event. */
function captureAskFeedback(
  req: PayloadRequest,
  signal: {
    rating?: string
    ratingReason?: string
    handoff?: string
    outcome: AskOutcome | null
    sourceCount: number
  },
): void {
  const event = signal.rating
    ? 'ask_rated'
    : signal.handoff === 'clicked'
      ? 'ask_handoff_clicked'
      : null
  if (!event) return
  captureServerEvent({
    headers: req.headers,
    fallbackDistinctId: `ask:${crypto.randomUUID()}`,
    event,
    properties: {
      rating: signal.rating ?? null,
      reason: signal.ratingReason ?? null,
      outcome: signal.outcome,
      source_count: signal.sourceCount,
    },
  })
}

/**
 * Team-only: rebuilds the embedding index from every published document and
 * global, the same pass as `scripts/backfill-ask-index.ts`. Wired to the
 * "Rebuild index" panel in Site Info › Ask. Runs inline (the jobs cron fires
 * once a day, too slow for a button); unchanged chunks reuse their vectors so
 * a rebuild over a corpus that has not changed costs no embedding tokens.
 */
const reindex: Endpoint = {
  path: '/ask/reindex',
  method: 'post',
  handler: async (req) => {
    // `req.user` is also set for MCP API keys; only team members may rebuild.
    if (req.user?.collection !== 'users') return json({ error: 'Unauthorized' }, 401)

    if (!process.env[ASK_MODEL_API_KEY_VAR]) {
      return json(
        { error: `${ASK_MODEL_API_KEY_VAR} is not set, so nothing can be embedded.` },
        503,
      )
    }
    if (isBackfillRunning()) {
      return json({ error: 'A rebuild is already running. Try again in a minute.' }, 409)
    }

    const summary = await backfillAskIndex(req.payload)
    req.payload.logger.info({ msg: 'ask index rebuilt from admin', user: req.user.id, ...summary })
    return json(summary)
  },
}

/**
 * Team-only: when the Ask index was last rebuilt, for the "Rebuild index"
 * panel. Reads the summary the last pass stored; nothing is recomputed.
 */
const indexStatus: Endpoint = {
  path: '/ask/reindex',
  method: 'get',
  handler: async (req) => {
    if (req.user?.collection !== 'users') return json({ error: 'Unauthorized' }, 401)
    return json({ lastRebuild: await readLastIndexRebuild(req.payload) })
  },
}

/**
 * Team-only: the last OpenAI usage report someone refreshed, for the "Usage"
 * panel in Site Info › Ask. Served from KV, so opening the panel never calls
 * OpenAI; `report` is null until the first refresh.
 */
const usage: Endpoint = {
  path: '/ask/usage',
  method: 'get',
  handler: async (req) => {
    if (req.user?.collection !== 'users') return json({ error: 'Unauthorized' }, 401)
    return json({ configured: isUsageConfigured(), report: await readUsageReport(req.payload) })
  },
}

/**
 * Team-only: fetch a fresh usage report from OpenAI and store it. Only the
 * panel's Refresh button calls this; the Admin API allows 30 requests a
 * minute and each refresh spends three of them.
 */
const usageRefresh: Endpoint = {
  path: '/ask/usage',
  method: 'post',
  handler: async (req) => {
    if (req.user?.collection !== 'users') return json({ error: 'Unauthorized' }, 401)

    if (!isUsageConfigured()) {
      return json({ error: `${OPENAI_ADMIN_KEY_VAR} is not set.`, configured: false }, 503)
    }

    try {
      return json({ configured: true, report: await refreshUsageReport(req.payload) })
    } catch (err) {
      if (err instanceof OpenAIAdminError) {
        req.payload.logger.error({ msg: 'ask usage fetch failed', err })
        const hint =
          err.status === 401
            ? `OpenAI rejected the key. ${OPENAI_ADMIN_KEY_VAR} must be an Admin key (Settings › Organization › Admin keys), not a project key.`
            : err.message
        return json({ error: hint }, 502)
      }
      throw err
    }
  },
}

export const askEndpoints: Endpoint[] = [ask, feedback, reindex, indexStatus, usage, usageRefresh]
