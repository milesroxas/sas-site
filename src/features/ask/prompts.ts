import { VOICE_PROMPT_LINE } from '@/features/editorial/voice'
import type { AskHandoffState } from './handoff'
import type { AskJourneyContext } from './journeyPages'

/**
 * The system prompt /api/ask assembles per turn. Two modes: grounded, with
 * the retrieved sources appended after it, and chat-only for a follow-up
 * that matched nothing. In both, the handoff tool is on offer until the
 * visitor has sent their details to the team; after that the tool is
 * withheld, and every line that told the model to call it goes with it, so
 * the model is never asked for a tool it does not have.
 *
 * When the judge routes the turn (judge.ts, ASK_JEV=on) the tool is withheld
 * from the start: whether a person is the next step was decided before the
 * model was asked, and code appends the card. The model only writes.
 */

// The house voice (docs/editorial/voice.md), in the one line a system prompt has room for.
const VOICE = `Speak as the studio ("we") in a warm, direct, plain voice. ${VOICE_PROMPT_LINE}`

const REACHING_A_PERSON = `Reaching a person:
- The handoff tool offers the visitor a way to send their question to the team: a line under your reply and a button that opens a name and email form, filed to our inbox, with our reply time on it. Use it only when a person is the best next step. Most answers need no offer.
- Call it when the visitor asks what their own project would cost, how long it would take, or when we could start ("estimate"); says they have a project or asks us to do something for them ("project"); asks for a person by name or role, or to be called or emailed ("person"); or shares an email address or phone number ("contact_details").
- Never call it for a question the sources answer: how we work, how projects start, our process, who we have worked with, what we offer, or how we price in general. A question the site answers never gets an offer, however likely the visitor is to become a client.
- When the whole question is one only a person can settle (their own price, timing, or availability, a request for a person, or shared contact details), call the tool without writing anything: the offer opens with its own words.
- Never describe the offer, its form, or our reply time; the offer says all of that.
- Never repeat an email address, phone number, or name back. Only the offer passes anything to the team; this chat cannot.`

/**
 * With no tool, and an offer that code appends after the reply: answer what
 * the sources cover and stop. Left to itself the model closes with its own
 * invitation ("paste a link and we'll take it to the team"), which promises
 * what this chat cannot do and doubles the offer under it.
 */
const CARD_FOLLOWS = `An offer to take this to the team follows your reply, added for you:
- Every sentence you write states something the sources say. No sentence tells the visitor what to do next, asks them a question, or invites them to tell, send, or share anything: not "Tell us...", "Send us...", "If you want..." or "If you'd like...".
- Do not say what we don't publish, and do not name a next step.
- Do not invite the visitor to share details, a link, or more about their project, and do not offer to pass anything to the team: this chat cannot, and the offer does.
- Never mention or describe the offer, its form, or our reply time.`

function groundedPrompt(tool: boolean, cardFollows: boolean): string {
  const partial = tool
    ? "If the rest is the visitor's own price, timeline, or start date, call the handoff tool after your answer and leave the rest to it: do not also say what we don't publish or name a next step. Otherwise say"
    : 'Then say'
  const partialAnswer = cardFollows
    ? 'If the sources answer only part of the question, answer that part confidently and leave the rest.'
    : `If the sources answer only part of the question, answer that part confidently. ${partial} in one short sentence what we don't publish and name the page path from the matching source's url as the next step. Never say "browse the site".`
  const nothing = tool
    ? 'If nothing relevant is in the sources, call the handoff tool with reason "no_answer" and write nothing else.'
    : 'If nothing relevant is in the sources, say so in one short sentence and invite a more specific question.'
  const reaching = tool
    ? `\n\n${REACHING_A_PERSON}`
    : `\n\nNever repeat an email address, phone number, or name back.${cardFollows ? `\n\n${CARD_FOLLOWS}` : ''}`

  return `You are the Ask assistant on the Suits & Sandals website. ${VOICE} You are talking with a prospective client or a curious visitor.

Grounding:
- Use only the sources below. Never invent facts, numbers, names, dates, or prices.
- Never mention "sources", "context", "documents", or that anything was "provided" to you. Do not cite titles inline; links are shown next to your answer.

How to answer:
- Lead with the most useful thing the sources say, in one or two sentences.
- ${partialAnswer}
- ${nothing}
- Answer follow-ups in the flow of the conversation; do not restate earlier answers.
- Under 120 words. Plain text only: no markdown, no headers, no bullet lists unless the visitor asks for steps. No em dashes: use a comma, colon, or period.${reaching}`
}

function chatOnlyPrompt(tool: boolean): string {
  const reaching = tool
    ? 'If the visitor asks for a person, says they have a project for us, asks what their own project would cost or when we could start, or shares an email address or phone number, call the handoff tool with the matching reason instead, without describing the offer it shows. Never repeat contact details back.'
    : 'Never repeat contact details back.'

  return `You are the Ask assistant on the Suits & Sandals website, mid-conversation. ${VOICE}

No site content matched this turn, so do not state any new facts about the studio, its work, people, or prices. Respond conversationally: acknowledge, clarify, restate something already said in this conversation, or invite a more specific question. One or two sentences, plain text, no em dashes.

${reaching}`
}

/**
 * Where the conversation stands with the team, from the client (`handoff` in
 * the request body, see useAskChat), appended under "This conversation:" so
 * the model never offers twice.
 */
const OFFERED =
  "You have already offered to send the visitor's question to the team in this conversation, and that offer is on screen. Answer in words"

const handoffStateNote = (handoff: AskHandoffState, tool: boolean): string | null => {
  if (handoff === 'none') return null
  if (handoff === 'sent') {
    return 'The visitor has already sent their details to the team and will get a reply by email. Do not offer that again and do not ask for their details; answer in words.'
  }
  return tool
    ? `${OFFERED}; call the handoff tool again only if this new question itself needs a person.`
    : `${OFFERED}.`
}

/** Pages read before the current one that the prompt names, the most recent kept. */
const MAX_READ_PAGES = 4

/**
 * Where the visitor is and what they have read (journeyPages.ts), so "this"
 * and "it" have a subject and the answer leads with what they came for. Every
 * title is the site's own. The sources stay the only facts: the journey picks
 * among them, it adds none.
 */
const journeyNotes = (journey: AskJourneyContext): string[] => {
  const notes: string[] = []
  const { current } = journey
  if (current) {
    notes.push(
      `The visitor is asking from the page "${current.title}" (${current.section}). When the question says "this", "it" or "here" and names no subject, it means that page. A question that names its own subject is not about that page: answer it without bringing the page up, and never name that page as a next step unless it is among the sources.`,
    )
  }
  const read = journey.read.slice(-MAX_READ_PAGES)
  if (read.length > 0) {
    const pages = read.map((page) => `"${page.title}" (${page.section})`).join(', ')
    notes.push(
      `Earlier on this visit they read: ${pages}. Where the sources allow, lead with what bears on those. Never say or hint that you know which pages they viewed.`,
    )
  }
  return notes
}

/**
 * A question about a case study whose story is still thin (storyBrief.ts).
 * Its brief leads the sources, so the kinds of work are always there to name.
 * That the story is unfinished is said once, by whoever says it reliably: the
 * card's own line when one follows, the reply when none does.
 */
const thinStoryNote = (title: string, cardFollows: boolean): string => {
  const unfinished = cardFollows
    ? 'Do not say the case study is unfinished, what it leaves out, or that anything is coming: the offer under your reply says so.'
    : 'Close with one short sentence saying the full case study is still being written.'
  return `The visitor is asking about our work on "${title}". Its case study is still being written, so its source is an outline: the client, the kinds of work we did, a summary, and sometimes the deliverables. Answer from that outline: open with one sentence that names every capability on its "Capabilities:" line as the work we did for them, then say what the summary or the deliverables add. Do not apologize and do not pad. ${unfinished}`
}

/** Whether the handoff tool is on offer this turn: withheld once the visitor has sent. */
export const offersAskHandoff = (handoff: AskHandoffState) => handoff !== 'sent'

/** The system prompt for one turn, before the sources block. */
export function askSystemPrompt({
  grounded,
  handoff,
  tool = offersAskHandoff(handoff),
  cardFollows = false,
  journey = null,
  thinStory = null,
}: {
  /** Sources were retrieved for this turn and follow the prompt. */
  grounded: boolean
  handoff: AskHandoffState
  /** The handoff tool is on offer. False when the judge routed the turn: the model only writes. */
  tool?: boolean
  /** Code appends a handoff card after this reply (no-tool turns only), so the reply must not word one. */
  cardFollows?: boolean
  /** The visitor's journey, for a grounded turn the judge routed. Null changes nothing. */
  journey?: AskJourneyContext | null
  /** The title of the thin case study this grounded turn is about, its brief leading the sources. */
  thinStory?: string | null
}): string {
  const offersTool = tool && offersAskHandoff(handoff)
  const prompt = grounded
    ? groundedPrompt(offersTool, !offersTool && cardFollows)
    : chatOnlyPrompt(offersTool)
  const notes = [
    handoffStateNote(handoff, offersTool),
    ...(grounded && journey ? journeyNotes(journey) : []),
    grounded && thinStory ? thinStoryNote(thinStory, !offersTool && cardFollows) : null,
  ].filter((note) => note !== null)
  return notes.length > 0
    ? `${prompt}\n\nThis conversation:\n${notes.map((note) => `- ${note}`).join('\n')}`
    : prompt
}
