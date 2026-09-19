import type { AskHandoffReason } from '@/features/ask/handoff'

/**
 * The shared Ask fixture: what a visitor asks and what the turn must end in.
 * `scripts/ask-eval.ts` (pass or fail on the card), `scripts/ask-bench.ts`
 * (latency and accuracy captures) and `scripts/ask-judge-eval.ts` (Jev's
 * probabilities beside the expectation) all read it, so every tool argues
 * about the same questions. It is also the retrieval-eval set stage 5 of the
 * RAG roadmap asked for: `sources` names the pages a good retrieval must find.
 *
 * Expectations describe the last turn only. Keep the first six cases
 * verbatim: they are the original eval, and old and new runs line up on them.
 */

export type AskCase = {
  id: string
  /** One entry per user turn; a multi-turn case replays the earlier replies. */
  turns: string[]
  expect: {
    /** The card the last turn must end in, or null for none (the quiet offer is not a card). */
    handoff: AskHandoffReason | null
    /** true: the reply must contain words. false: card only. Omitted: either is right. */
    text?: boolean
    /** Page paths that must appear in the sources. Filled from the real corpus. */
    sources?: string[]
  }
}

export const ASK_CASES: AskCase[] = [
  // The original eval: three answered from the site, three that reach a person.
  { id: 'start', turns: ['How do we start?'], expect: { handoff: null, text: true } },
  { id: 'clients', turns: ['Who have you worked with?'], expect: { handoff: null, text: true } },
  { id: 'process', turns: ['What is your process like?'], expect: { handoff: null, text: true } },
  // General pricing: a card either way; words only if the site publishes something.
  { id: 'cost-general', turns: ['What does it cost?'], expect: { handoff: 'estimate' } },
  {
    id: 'cost-own',
    turns: ['How much would a new website for my startup cost?'],
    expect: { handoff: 'estimate', text: false },
  },
  {
    id: 'person',
    turns: ['Can I talk to someone on the team?'],
    expect: { handoff: 'person', text: false },
  },

  // The closing band's live chips (ClosingAsk.tsx).
  {
    id: 'startups',
    turns: ['Do you work with startups?'],
    expect: { handoff: null, text: true },
  },
  {
    id: 'webflow',
    turns: ['Can you fix my Webflow site?'],
    expect: { handoff: 'project', text: true },
  },

  // The visitor's own timeline and start date: only a person can settle these.
  {
    id: 'timeline-own',
    turns: ['How long would it take you to rebrand our company?'],
    expect: { handoff: 'estimate', text: false },
  },
  {
    id: 'start-date',
    turns: ['When could you start on our project?'],
    expect: { handoff: 'estimate', text: false },
  },

  // They have a project, or ask the studio to do something for them.
  {
    id: 'have-project',
    turns: ["I have a project I'd like to talk to you about."],
    expect: { handoff: 'project', text: false },
  },
  { id: 'build-x', turns: ['Can you build a mobile app for us?'], expect: { handoff: 'project' } },

  // A person by role, or to be called.
  {
    id: 'person-call',
    turns: ['Can someone call me about this?'],
    expect: { handoff: 'person', text: false },
  },

  // Contact details typed into the chat.
  {
    id: 'contact-details',
    turns: ['My email is jane@example.com, can you send me more information?'],
    expect: { handoff: 'contact_details', text: false },
  },

  // Nothing on the site answers it.
  {
    id: 'no-answer',
    turns: ['What is the capital of Mongolia?'],
    expect: { handoff: 'no_answer', text: false },
  },

  // Mixed: a general question and the visitor's own price in one turn.
  {
    id: 'mixed',
    turns: ['How do you work, and what would my project cost?'],
    expect: { handoff: 'estimate', text: true },
  },

  // A follow-up that only makes sense with the first turn.
  {
    id: 'followup-dependent',
    turns: ['Tell me about your work with Interchecks.', 'What results did it get?'],
    expect: { handoff: null, text: true, sources: ['/works/interchecks'] },
  },
  // A follow-up that switches topic: the old subject must not drag retrieval along.
  {
    id: 'followup-switch',
    turns: ['Tell me about your work with Interchecks.', 'What is your process like?'],
    expect: { handoff: null, text: true },
  },
  // Conversation only: no retrieval needed, never a card.
  {
    id: 'thanks',
    turns: ['What is your process like?', 'Thanks, that helps!'],
    expect: { handoff: null, text: true },
  },
]
