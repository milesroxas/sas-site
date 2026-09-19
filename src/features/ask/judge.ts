import { choice, noul, TypeSafeClient } from '@typesafe-ai/sdk'
import type { AskHandoffReason, AskHandoffState } from './handoff'
import { redactFreeText } from './redact'

/**
 * The judge: Jev (TypeSafe's System One model) answers the turn's decisions
 * so the writing model only writes. Jev returns typed answers with
 * probabilities in a few hundred milliseconds and cannot write text. Server only.
 *
 * Three rules hold the design together:
 * - Code owns the workflow. Jev returns probabilities; every threshold is in
 *   `ASK_JUDGE_THRESHOLDS` and every branch is a plain `if` in `routeTurn`
 *   and `routePassage`. Changing policy is a number edit, never a reworded
 *   question.
 * - Fail open. A missing key, a timeout, a 429, or an unsure answer all mean
 *   today's path: nothing here throws, and a visitor never sees a Jev error.
 * - Jev reads literally, so the criteria carry the boundary cases, in the
 *   wording already proven in `handoffTool.ts` and `prompts.ts`.
 *
 * Tune with `scripts/ask-judge-eval.ts`; see docs/ask-jev-roadmap.md.
 */

export const ASK_JUDGE_KEY_VAR = 'TYPESAFE_API_KEY'

/**
 * Pinned, not `jev-latest`: the thresholds below were tuned against this
 * version. Re-run `scripts/ask-judge-eval.ts` before bumping it.
 */
export const ASK_JUDGE_MODEL = 'jev-1.13.0'

/**
 * Per request, no retries: the SDK's defaults (10 s per attempt, retries on
 * 408/429/5xx) suit a batch job, not a visitor waiting on a reply. Measured in
 * shadow mode 2026-09-19 (68 turns, a laptop, cold connections as production
 * traffic has them): a turn judgment took 130 to 400 ms and a 12-passage
 * batch finished when its slowest request did, so at 400 ms one judgment in
 * six timed out and most batches lost a passage. 800 ms clears both, and a
 * timeout still only costs the judge-off path, where the model takes seconds.
 */
export const ASK_JUDGE_TIMEOUT_MS = 800

/** `off` is today's code path, `shadow` observes and decides nothing, `on` decides. */
export const ASK_JUDGE_MODES = ['off', 'shadow', 'on'] as const

export type AskJudgeMode = (typeof ASK_JUDGE_MODES)[number]

/** The mode from `ASK_JEV`; always `off` without a key, and for any value it does not know. */
export function askJudgeMode(env: Record<string, string | undefined> = process.env): AskJudgeMode {
  if (!env[ASK_JUDGE_KEY_VAR]?.trim()) return 'off'
  const mode = env.ASK_JEV?.trim().toLowerCase()
  return ASK_JUDGE_MODES.find((known) => known === mode) ?? 'off'
}

/**
 * Every number the routing reads. Do not carry a threshold tuned on a Noul
 * to a Choice or the reverse, and do not expect `P(x)` and `1 - P(not x)`
 * to agree (TypeSafe's jev-1.13 jaggedness notes).
 */
export const ASK_JUDGE_THRESHOLDS = {
  /** `request` confidence at or above which a `person` pick shows the card with no model call. */
  act: 0.6,
  /** `request` confidence below which the judgment is set aside for today's path. */
  low: 0.35,
  /** `own_project` at or above which an estimate turn may be the card alone. */
  ownProject: 0.7,
  /** `general_question` at or above which part of the turn is the site's to answer, so never the card alone. */
  generalQuestion: 0.5,
  /** `names_work` at or above which a project turn names work the site may have something to say about. */
  namesWork: 0.5,
  /**
   * `depends_on_previous` at or above which a follow-up searches with the previous turn attached.
   * Leans toward attaching: a wrong yes is today's behavior, a wrong no embeds "what about that?" alone.
   */
  dependsOnPrevious: 0.7,
  /** `is_relevant` below which a passage is dropped. */
  relevant: 0.45,
  /** `has_evidence` above which a relevant passage is kept. */
  evidence: 0.55,
} as const

const REQUEST_CRITERIA = {
  information:
    'A question about the studio: how it works, how projects start, its process, who it has worked with, what it offers, what kinds of clients or platforms it works with, or how it prices in general.',
  estimate:
    "A question about the visitor's own project: what it would cost, how long it would take, or when the studio could start.",
  project:
    'The visitor says they have a project, or asks the studio to do something for them. Not a question about how projects start.',
  person: 'The visitor asks for a person by name or role, or asks to be called or emailed.',
  conversation:
    'A thanks, a greeting, an acknowledgment, or a request to repeat or rephrase an earlier reply.',
  other: 'None of the above.',
} as const

export type AskRequestKind = keyof typeof REQUEST_CRITERIA

const TURN_QUESTIONS = {
  request: choice('What is the visitor asking for in `question`?', REQUEST_CRITERIA),
  // "Is every part of it only a person's to settle?" asked as one Noul read
  // low on plainly own-project questions (0.35 to 0.56): Jev reads literally
  // and a universal is a hop too many. So it is three literal questions,
  // combined in `routeTurn` (jev-1.13 jaggedness: literal reading).
  own_project: noul("Is `question` about the visitor's own project?", {
    true: 'It asks what their own project would cost, how long it would take, when the studio could start, or whether the studio would take it on, or it says they have a project for the studio.',
    false: 'It asks about the studio in general, asks for a person, or is about something else.',
  }),
  general_question: noul(
    'Does any part of `question` ask about the studio in general: how it works, its process, who it has worked with, what it offers, which platforms or kinds of clients it works with, or how it prices in general?',
    {
      true: 'At least part of it could be answered from what the studio publishes about itself.',
      false:
        "It is only about the visitor's own project, a request for a person, or not about the studio at all.",
    },
  ),
  names_work: noul('Does `question` name the kind of work the visitor wants done?', {
    true: 'It names a service, a platform, or a deliverable, such as a website, a rebrand, an app, or Webflow.',
    false:
      'It names no kind of work: it only says they have a project, or asks about price, timing, or a person.',
  }),
}

const FOLLOW_UP_QUESTIONS = {
  ...TURN_QUESTIONS,
  depends_on_previous: noul(
    'Does `question` contain a pronoun or leave out its subject, so that it refers back to `previous_question`?',
    {
      true: 'Words such as "it", "that", "they", "those", "them", or an opening such as "what about" or "and", point back to `previous_question`.',
      false:
        '`question` names its own subject and reads as a complete question with `previous_question` removed.',
    },
  ),
}

const PASSAGE_QUESTIONS = {
  is_relevant: noul('Does this passage address the subject of the query?'),
  has_evidence: noul('Does this passage state information usable in a direct answer to the query?'),
}

export type AskTurnJudgment = {
  request: AskRequestKind
  /** The `request` Choice's confidence: how concentrated its distribution is. */
  confidence: number
  probabilities: Record<AskRequestKind, number>
  /** The turn is about the visitor's own project (price, timing, start, taking it on). */
  ownProject: number
  /** Part of the turn is a general question the site may answer. */
  generalQuestion: number
  /** The turn names the kind of work wanted, which the site may have something to say about. */
  namesWork: number
  /** Null on a first turn, where there is no previous question to depend on. */
  dependsOnPrevious: number | null
  /** The versioned model that answered. */
  model: string
  ms: number
}

export type AskPassageAnswers = { isRelevant: number; hasEvidence: number }

/** What the judge needs from a retrieved chunk. */
export type AskPassage = { title: string; headingPath: string | null; text: string }

export type AskPassageJudgment = {
  /** One entry per chunk, in order; null where the check failed (that chunk is kept). */
  answers: (AskPassageAnswers | null)[]
  ms: number
}

type JudgeLogger = { warn: (message: unknown) => void }

type JudgeCall = {
  signal?: AbortSignal
  logger?: JudgeLogger
  /** The eval script waits longer than a visitor would, so the network never colors a tuning run. */
  timeoutMs?: number
}

let client: TypeSafeClient | null = null

function judgeClient(): TypeSafeClient | null {
  if (!process.env[ASK_JUDGE_KEY_VAR]?.trim()) return null
  client ??= new TypeSafeClient({
    defaultModel: ASK_JUDGE_MODEL,
    timeout: ASK_JUDGE_TIMEOUT_MS,
    retry: { maxRetries: 0 },
    logLevel: 'error',
  })
  return client
}

const requestOptions = ({ signal, timeoutMs }: JudgeCall) => ({
  signal,
  ...(timeoutMs ? { timeout: timeoutMs } : {}),
})

const errorName = (err: unknown) => (err instanceof Error ? err.name : 'unknown')

const askFirstTurn = (jev: TypeSafeClient, state: { question: string }, call: JudgeCall) =>
  jev.systemOne({ state, questions: TURN_QUESTIONS }, requestOptions(call))

/**
 * One Jev request for the turn: what the visitor is asking for, the three
 * signals that tell whether only a person could settle it, and on a follow-up
 * whether it leans on the previous question. Independent questions over one state, asked together.
 * The question is redacted first; contact details were already found in code.
 * Null on any failure.
 */
export async function judgeTurn({
  question,
  previousQuestion,
  ...call
}: JudgeCall & {
  question: string
  previousQuestion: string | null
}): Promise<AskTurnJudgment | null> {
  const jev = judgeClient()
  if (!jev) return null

  const startedAt = performance.now()
  try {
    const state = { question: redactFreeText(question) }
    let dependsOn: number | null = null
    let result: Awaited<ReturnType<typeof askFirstTurn>>
    if (previousQuestion) {
      const followUp = await jev.systemOne(
        {
          state: { ...state, previous_question: redactFreeText(previousQuestion) },
          questions: FOLLOW_UP_QUESTIONS,
        },
        requestOptions(call),
      )
      dependsOn = followUp.answers.depends_on_previous.noul
      result = followUp
    } else {
      result = await askFirstTurn(jev, state, call)
    }

    const { answers, model } = result
    return {
      request: answers.request.choice,
      confidence: answers.request.confidence,
      probabilities: answers.request.probabilities,
      ownProject: answers.own_project.noul,
      generalQuestion: answers.general_question.noul,
      namesWork: answers.names_work.noul,
      dependsOnPrevious: dependsOn,
      model,
      ms: Math.round(performance.now() - startedAt),
    }
  } catch (err) {
    if (!call.signal?.aborted) {
      call.logger?.warn({ msg: 'ask judge: turn check failed', error: errorName(err) })
    }
    return null
  }
}

/**
 * One Jev request per retrieved chunk, all in parallel: a large state full
 * of unrelated text costs Jev accuracy, so each passage is judged alone
 * against the query. A chunk whose check failed comes back null and is kept.
 */
export async function judgePassages({
  query,
  chunks,
  ...call
}: JudgeCall & {
  query: string
  chunks: AskPassage[]
}): Promise<AskPassageJudgment | null> {
  const jev = judgeClient()
  if (!jev || chunks.length === 0) return null

  const startedAt = performance.now()
  const redactedQuery = redactFreeText(query)
  let failures = 0

  const answers = await Promise.all(
    chunks.map(async (chunk): Promise<AskPassageAnswers | null> => {
      try {
        const { answers: passage } = await jev.systemOne(
          {
            state: {
              query: redactedQuery,
              passage: { title: chunk.title, heading: chunk.headingPath, text: chunk.text },
            },
            questions: PASSAGE_QUESTIONS,
          },
          requestOptions(call),
        )
        return { isRelevant: passage.is_relevant.noul, hasEvidence: passage.has_evidence.noul }
      } catch {
        failures += 1
        return null
      }
    }),
  )

  if (failures > 0 && !call.signal?.aborted) {
    call.logger?.warn({ msg: 'ask judge: passage checks failed', failures, of: chunks.length })
  }
  return { answers, ms: Math.round(performance.now() - startedAt) }
}

/**
 * Where a turn goes. `fallback` is today's path, the writing model with the
 * `handoff` tool; `card` is a handoff card with no retrieval and no model;
 * `conversation` is the chat-only prompt with no retrieval and no tool;
 * `evidence` retrieves and checks passages, then answers, and closes with a
 * card when `reason` is set.
 */
export type AskTurnRoute =
  | { kind: 'fallback' }
  | { kind: 'card'; reason: AskHandoffReason }
  | { kind: 'conversation' }
  | { kind: 'evidence'; reason: AskHandoffReason | null }

/** The turn's decision table (docs/ask-jev-roadmap.md). */
export function routeTurn(
  judgment: AskTurnJudgment | null,
  { isFollowUp, handoffState }: { isFollowUp: boolean; handoffState: AskHandoffState },
): AskTurnRoute {
  if (!judgment || judgment.confidence < ASK_JUDGE_THRESHOLDS.low) return { kind: 'fallback' }

  // Once the visitor has sent their details there is never a card, and a turn
  // that would have been one is today's path: the model, told not to offer.
  const mayOffer = handoffState !== 'sent'

  switch (judgment.request) {
    case 'person':
      return mayOffer && judgment.confidence >= ASK_JUDGE_THRESHOLDS.act
        ? { kind: 'card', reason: 'person' }
        : { kind: 'fallback' }
    case 'estimate':
    case 'project': {
      if (!mayOffer) return { kind: 'evidence', reason: null }
      return onlyAPerson(judgment)
        ? { kind: 'card', reason: judgment.request }
        : { kind: 'evidence', reason: judgment.request }
    }
    case 'conversation':
      return isFollowUp ? { kind: 'conversation' } : { kind: 'evidence', reason: null }
    default:
      return { kind: 'evidence', reason: null }
  }
}

/**
 * Whether nothing in an estimate or project turn is the site's to answer, so
 * the card is the whole reply. No general question in it, and then: an
 * estimate is plainly about their own project; a project names no kind of
 * work ("I have a project"), where "can you fix my Webflow site?" names work
 * the site may speak to. A miss here is cheap: the turn retrieves, and with
 * no passage kept it still ends in the card alone.
 */
function onlyAPerson(judgment: AskTurnJudgment): boolean {
  if (judgment.generalQuestion >= ASK_JUDGE_THRESHOLDS.generalQuestion) return false
  return judgment.request === 'estimate'
    ? judgment.ownProject >= ASK_JUDGE_THRESHOLDS.ownProject
    : judgment.namesWork < ASK_JUDGE_THRESHOLDS.namesWork
}

/** Whether a follow-up searches with the previous turn attached. Unknown means yes, as today. */
export function dependsOnPrevious(judgment: AskTurnJudgment | null): boolean {
  if (judgment?.dependsOnPrevious == null) return true
  return judgment.dependsOnPrevious >= ASK_JUDGE_THRESHOLDS.dependsOnPrevious
}

/** A passage's route, first match wins. A failed check keeps the passage: fail open. */
export function routePassage(answers: AskPassageAnswers | null): 'keep' | 'drop' {
  if (!answers) return 'keep'
  if (answers.isRelevant < ASK_JUDGE_THRESHOLDS.relevant) return 'drop'
  return answers.hasEvidence > ASK_JUDGE_THRESHOLDS.evidence ? 'keep' : 'drop'
}

/**
 * The card Jev's judgment alone would show, for shadow mode's agreement
 * rate: a card-only route's reason, a partial answer's reason, or none. An
 * `evidence` route can still end in `no_answer` once passages are checked,
 * which the turn judgment cannot know, so callers compare that case apart.
 */
export function routeCardReason(route: AskTurnRoute): AskHandoffReason | null {
  return route.kind === 'card' || route.kind === 'evidence' ? route.reason : null
}
