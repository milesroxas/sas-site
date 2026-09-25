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

  // Past work for a client the question names: the site's to answer, never a
  // card. Jev read these as no request at all (confidence 0.15 to 0.22) until
  // the `information` criterion named past work (judge.ts, 2026-09-21).
  {
    id: 'past-work-named',
    turns: ['What did you do for Arturo?'],
    expect: { handoff: null, text: true, sources: ['/works/arturo'] },
  },
  {
    id: 'past-work-project',
    turns: ['Tell me about the GentleBeast project.'],
    expect: { handoff: null, text: true, sources: ['/works/gentlebeast'] },
  },
]

/**
 * The journey fixture (`scripts/ask-judge-eval.ts --journey`): a question, the
 * page it was asked on, and whether it leaves its subject to that page, so the
 * search must also run under the page's title (`open_reference`, judge.ts).
 * Titles are the index's own. `paths` names a page the pooled search must
 * find (`--journey --passages`).
 */
export type AskJourneyCase = {
  id: string
  question: string
  page: string
  leans: boolean
  sources?: string[]
}

const INTERCHECKS = 'Interchecks'
const WEBSITES = 'Website Strategy, UX & Development'
const HEALTHTECH = 'Healthtech & Life Sciences'
const WEBFLOW_AUDIT = 'Unlocking Webflow Website Potential: A Comprehensive Audit Framework'

export const ASK_JOURNEY_CASES: AskJourneyCase[] = [
  // The question leaves its subject to the page.
  {
    id: 'work-it',
    question: 'What results did it get?',
    page: INTERCHECKS,
    leans: true,
    sources: ['/works/interchecks'],
  },
  { id: 'work-this', question: 'How long did this project take?', page: INTERCHECKS, leans: true },
  {
    id: 'work-them',
    question: 'What did you do for them?',
    page: INTERCHECKS,
    leans: true,
    sources: ['/works/interchecks'],
  },
  { id: 'service-this', question: 'Who have you done this for?', page: WEBSITES, leans: true },
  {
    id: 'audience-this',
    question: 'Do you have examples of this kind of work?',
    page: HEALTHTECH,
    leans: true,
    sources: ['/who-we-help/healthtech-life-sciences-branding'],
  },
  { id: 'post-this', question: 'Can you do this audit for us?', page: WEBFLOW_AUDIT, leans: true },

  // The question names its own subject, whatever page it was asked on.
  { id: 'work-process', question: 'What is your process like?', page: INTERCHECKS, leans: false },
  { id: 'work-clients', question: 'Who have you worked with?', page: INTERCHECKS, leans: false },
  {
    id: 'work-other-client',
    question: 'Tell me about your work with Arturo.',
    page: INTERCHECKS,
    leans: false,
  },
  {
    id: 'post-startups',
    question: 'Do you work with startups?',
    page: WEBFLOW_AUDIT,
    leans: false,
  },
  { id: 'service-start', question: 'How do we start?', page: WEBSITES, leans: false },
  {
    id: 'audience-own-cost',
    question: 'How much would a new website for my startup cost?',
    page: HEALTHTECH,
    leans: false,
  },

  // The idiom: "it" is nobody. Jev reads it as a reference (0.96), which is
  // why the page search rides beside the plain one: the plain search must
  // still find the pricing answer.
  {
    id: 'idiom-cost',
    question: 'What does it cost?',
    page: INTERCHECKS,
    leans: true,
    sources: ['/expertise/embedded-creative-digital-services'],
  },
]

/**
 * A turn that asks for the visitor's question to reach the team, in words or
 * with a yes to the offer on screen (judge.ts, `wantsTheTeam`). `offer` is
 * the offer under the reply the visitor answers, and `reply` that reply's
 * words; a first turn has neither. `sends` is whether the turn must open the
 * form. `scripts/ask-judge-eval.ts --send` reads these.
 */
export type AskSendCase = {
  id: string
  question: string
  offer?: string
  reply?: string
  sends: boolean
}

const QUIET_OFFER = 'Want a person to reply?'
const AUDIT_REPLY =
  'We start with a performance audit: image weight, heavy scripts and third-party tools, then fix what slows the pages down.'

export const ASK_SEND_CASES: AskSendCase[] = [
  // Asked in words, on any turn.
  { id: 'send-this', question: 'Can you send this to the team?', sends: true },
  { id: 'pass-on', question: 'Please pass my question on to someone.', sends: true },
  { id: 'get-back', question: 'Have someone get back to me about this.', sends: true },
  // A yes to the offer on screen, the case that reached production as "Done, we've sent it".
  { id: 'yes', question: 'yes', offer: QUIET_OFFER, reply: AUDIT_REPLY, sends: true },
  { id: 'yes-please', question: 'Yes please', offer: QUIET_OFFER, reply: AUDIT_REPLY, sends: true },
  {
    id: 'yes-partner',
    question: 'sure, go ahead',
    offer: 'Want to talk it through with a partner?',
    reply: AUDIT_REPLY,
    sends: true,
  },
  // A yes that answers what the reply asked: a conversation, never the form.
  {
    id: 'yes-to-reply',
    question: 'yes',
    offer: QUIET_OFFER,
    reply: `${AUDIT_REPLY} Want to hear how the audit works?`,
    sends: false,
  },
  // Not a request to reach anyone.
  { id: 'no-thanks', question: 'No thanks', offer: QUIET_OFFER, reply: AUDIT_REPLY, sends: false },
  {
    id: 'thanks',
    question: 'Thanks, that helps!',
    offer: QUIET_OFFER,
    reply: AUDIT_REPLY,
    sends: false,
  },
  { id: 'ok', question: 'ok', offer: QUIET_OFFER, reply: AUDIT_REPLY, sends: true },
  { id: 'email-me', question: 'Can someone email me about this?', sends: true },
  {
    id: 'sure-more',
    question: 'Sure, tell me more',
    offer: QUIET_OFFER,
    reply: `${AUDIT_REPLY} Want to hear how the audit works?`,
    sends: false,
  },
  { id: 'question', question: 'What is your process like?', sends: false },
  { id: 'team-size', question: 'How big is your team?', sends: false },
  // About the team, not a request to reach it.
  { id: 'reply-speed', question: 'How quickly does the team usually reply?', sends: false },
  { id: 'who-works', question: 'Who on the team would I work with?', sends: false },
]

/**
 * A grounded reply's page card (judge.ts, `judgeNextPage` then
 * `pickNextPage`). `pages` are the reply's sources in retrieval's order, so a
 * case whose best page is not first shows whether Jev beats retrieval.
 * `accept` names every page a good card may open; empty means no card is
 * right. `scripts/ask-judge-eval.ts --next-page` reads these.
 */
export type AskNextPageCase = {
  id: string
  question: string
  pages: { url: string; title: string }[]
  accept: string[]
}

const PAGE = {
  about: { url: '/about-us', title: 'About Us' },
  adacore: { url: '/works/adacore', title: 'AdaCore' },
  arturo: { url: '/works/arturo', title: 'Arturo' },
  battleCards: {
    url: '/posts/sales-battle-cards-for-messaging-strategies',
    title:
      'Jumpstart Your Messaging Strategy with This Tool: Sales Battle Cards for Better Messaging Strategies',
  },
  clutch: {
    url: '/posts/suits-sandals-gain-game-changer-rank-on-clutch',
    title: 'Suits & Sandals Gain Game-Changer Rank on Clutch',
  },
  eclinical: { url: '/works/eclinical-solutions', title: 'eClinical Solutions' },
  embedded: {
    url: '/expertise/embedded-creative-digital-services',
    title: 'Embedded Creative & Digital Services',
  },
  healthcarePost: {
    url: '/posts/healthcare-website-design-trends-2024',
    title: 'Designing Healthcare Websites That Convert',
  },
  healthtech: {
    url: '/who-we-help/healthtech-life-sciences-branding',
    title: HEALTHTECH,
  },
  holidayPost: {
    url: '/posts/ecommerce-web-design-tips-holiday-season',
    title: 'eCommerce UX Design Tips for the Holiday Season',
  },
  investor: {
    url: '/expertise/sales-marketing-investor-communications',
    title: 'Sales, Marketing & Investor Communications',
  },
  messaging: {
    url: '/expertise/brand-positioning-messaging',
    title: 'Clarifying Complex Stories',
  },
  personas: {
    url: '/posts/how-to-create-audience-personas',
    title: 'How to Create Audience Personas',
  },
  platforms: { url: '/who-we-help/saas-digital-products', title: 'Platforms & Digital Products' },
  productUx: {
    url: '/expertise/product-ux-ui-design-systems',
    title: 'Product UX/UI & Design Systems',
  },
  remotePost: {
    url: '/posts/we-went-remote-before-the-novel-coronavirus-heres-what-we-learned',
    title: "We Went Remote Right Before COVID. Here's What We Learned.",
  },
  toolkit: {
    url: '/posts/download-the-communication-strategy-toolkit',
    title: 'Download the Communication Strategy Toolkit',
  },
  top30: {
    url: '/posts/suits-sandals-named-in-list-of-top-30-ux-design-agencies',
    title: 'Top 30 UX Design Agencies List Names Suits & Sandals',
  },
  webflowAudit: {
    url: '/posts/unlocking-webflow-website-potential-a-comprehensive-audit-framework',
    title: WEBFLOW_AUDIT,
  },
  webflowLab: { url: '/lab/from-webflow-to-payload', title: 'From Webflow to Payload' },
  websites: { url: '/expertise/website-strategy-ux-development', title: WEBSITES },
}

export const ASK_NEXT_PAGE_CASES: AskNextPageCase[] = [
  // The best page is retrieval's first.
  {
    id: 'arturo',
    question: 'What did you do for Arturo?',
    pages: [PAGE.arturo, PAGE.platforms],
    accept: [PAGE.arturo.url],
  },
  {
    id: 'founded',
    question: 'When was the studio founded?',
    pages: [PAGE.about, PAGE.remotePost],
    accept: [PAGE.about.url],
  },
  // The best page is further down.
  {
    id: 'healthtech',
    question: 'Do you work with healthtech companies?',
    pages: [PAGE.healthcarePost, PAGE.eclinical, PAGE.healthtech],
    accept: [PAGE.healthtech.url, PAGE.eclinical.url],
  },
  {
    id: 'webflow',
    question: 'Can you fix my Webflow site?',
    pages: [PAGE.webflowLab, PAGE.webflowAudit, PAGE.websites],
    accept: [PAGE.websites.url, PAGE.webflowAudit.url],
  },
  {
    id: 'messaging',
    question: 'How do you approach messaging?',
    pages: [PAGE.battleCards, PAGE.personas, PAGE.messaging],
    accept: [PAGE.messaging.url],
  },
  {
    id: 'design-systems',
    question: 'Do you build design systems?',
    pages: [PAGE.adacore, PAGE.productUx],
    accept: [PAGE.productUx.url],
  },
  {
    id: 'investor',
    question: 'Can you help with an investor deck?',
    pages: [PAGE.embedded, PAGE.investor],
    accept: [PAGE.investor.url],
  },
  // Nothing among the sources takes the visitor further: no card.
  {
    id: 'team-size',
    question: 'How big is your team?',
    pages: [PAGE.clutch, PAGE.top30],
    accept: [],
  },
  {
    id: 'newsletter',
    question: 'Do you have a newsletter?',
    pages: [PAGE.toolkit, PAGE.holidayPost],
    accept: [],
  },
]
