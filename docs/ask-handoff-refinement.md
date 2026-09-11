# Ask handoff refinement

Status: **implemented and reviewed 2026-09-11**, shipped to `dev` and `main`. Companion to the [feature README](../src/features/ask/README.md) and [ask-insights-roadmap.md](ask-insights-roadmap.md). Audits the handoff card and tool shipped in `984364c`, `a5821f5`, `d3c698a`, and records the refinement that replaced them.

Scope: the two live surfaces, the takeover menu (`MenuAsk`) and the footer's closing band (`ClosingAsk`). The `/ask` page shares the transcript code but is not a promoted surface; it is mentioned only where it differs.

The audit below is kept as written, because it is the reasoning behind the change. **[What shipped](#what-shipped)** at the end of this document is the current state: read that first if you are picking this up.

## Summary

Three things make the handoff feel abrupt, and they compound.

1. **The card is doing the reply's job.** The prompt tells the model to call the tool "without writing anything" when the card is the whole reply, and gpt-5-mini will not write text and call a tool in one turn anyway. So the visitor asks a question and gets a form with a heading. A heading is not a reply.
2. **Nothing remembers that a card was offered.** The transcript sent to the model drops tool parts and drops any turn left with no text, so a card-only reply vanishes from the model's history. The model sees an unanswered question and offers again. The client renders one card per assistant message with a tool part, so it draws it again.
3. **The reasons are worded so the studio's own suggestions trigger the card.** "How do we start?" is a suggestion chip in the closing band. Today it produced the `project` card three times with four sources retrieved (PostHog, `ask_questioned`, `handoff_reason`). "Who have you worked with?" as a follow-up produced `project` again. That is the exact sequence reported.

Two layout facts make it worse in the closing band: the composer and its reserve take half the panel, and the card alone is taller than what is left, so on a phone the card's title scrolls out of view and the visitor sees Name and Email with no "why".

## What was checked

- Code: `src/endpoints/ask.ts` (prompts, `sanitizeMessages`, `handoffResponse`), `src/features/ask/{handoff,handoffTool,messages,HandoffCard,TalkToTeam,useAskChat}.tsx`, `src/Footer/Closing/ClosingAsk.tsx`, `src/features/ask/MenuAsk.tsx`, and the `card`, `field`, `input`, `button` primitives.
- Storybook captures (reduced motion, 2x) of `Features/ClosingAsk` Handoff, Open, and Sources, and `Features/MenuAsk` MobileHandoff, Mobile, and Answered, at 1280 and 390 wide, with measured boxes. The handoff form and receipt states were checked on the shared `AskWidget` stories because that is where they are scripted; the component is identical on both live surfaces.
- PostHog `ask_questioned` events for the last three days, with `handoff_reason`, `is_follow_up`, `source_count`, and `question_length`.

### Measurements (CSS px)

| Surface | Panel | Header | Transcript viewport | Handoff card (form) | Composer + reserve |
| --- | --- | --- | --- | --- | --- |
| Closing band, 1280 | 480 | 51 | 254 | 249 | 56 + 144 (`md:pb-36`), inside the card |
| Closing band, 390 | 480 | 51 | 238 | 331 | 56 + 160 (`pb-40`), inside the card |
| Menu, 1280 | 504 | 77 | 428 | 249 | 46 pill, outside the panel |
| Menu, 390 | 504 | 107 | 398 | 331 | 46 pill, outside the panel |

The sent receipt is 147px. The quiet "Talk to the team" row is about 36px.

The menu is the healthy reference. Its composer is a one-line pill that sits outside the panel, so the transcript gets 428px on desktop and the whole card shows with the question above it. The closing band keeps its composer inside the card and reserves space for it under the transcript, which is where the height goes. On a phone the menu's header is three lines (title, a two-line description, the actions), which is what pushes the question bubble half out of view above the card there.

### Today's handoff events (America/New_York)

| Time | Turn | Question length | Sources | Reason |
| --- | --- | --- | --- | --- |
| 16:08:08 | first | 16 ("How do we start?") | 4 | project |
| 16:57:05 | first | 16 ("How do we start?") | 4 | project |
| 16:57:37 | follow-up | 25 ("Who have you worked with?") | 4 | project |
| 15:07:03 | follow-up | 21 | 4 | estimate |

Lengths match the closing band's suggestion chips exactly. The question text is not in PostHog by design; the `ask-questions` inbox has it.

## Findings, ranked by how much they hurt

### 1. The card lands with no words

`SYSTEM_PROMPT` says: "When there is nothing else to answer... the card is the whole reply: call the tool without writing anything." The titles in `ASK_HANDOFFS` were written to "read as a complete answer", but "Tell us about your project" and "Priced and scheduled per project" read as form headings, because they sit on a form. In a chat, a reply is words from the other side. A form arriving unannounced breaks that contract (Apple's familiarity principle: things that look like a conversation should behave like one).

The earlier attempt at a second model step was dropped for the right reason (it restated the card and invented reply times). The fix is to make the words code-owned, not model-owned.

### 2. The same card appears twice

Two independent causes, both structural:

- **Server.** `sanitizeMessages` keeps text parts only and drops a message with no text left. A card-only reply is therefore removed from the history the model sees. After "How do we start?" (card) and "Who have you worked with?", the model receives two consecutive user turns with no assistant turn between them. From its point of view the visitor was never answered, and the prompt's four triggers are still live.
- **Client.** `TranscriptItems` calls `handoffOf(message)` per assistant message and mounts a `HandoffCard` for each. There is no conversation-level notion of "a handoff is already on screen" or "the visitor already sent". Two forms can be live at once, each with its own name and email state, and after a sent receipt a later tool call would mount a fresh form.

### 3. The reasons catch questions the site can answer

Tool description for `project`: "they want to start or discuss a project with us." "How do we start?" matches that literally. `person`: "asks for a person, or for something only a person can answer." `contact_details` fires on "a name" alone. The system prompt also says a partial answer should hand the rest to the card, which invites the model to treat any open-ended question as partial.

The result is that the three questions the studio itself suggests in the closing band (`suggestions` in `ClosingAsk.tsx`) can each end in a form. A question the studio suggests must never produce a form.

### 4. The card is a form dropped into a chat

Expanded, the card carries a title, a promise line, two fields, a primary button, a lock caption, and a footer quoting the question. Five lines of text around two inputs. In the closing band the card (249 / 331px) is as tall as, or taller than, the transcript viewport (254 / 238px). The scroller pins to the end, so on a phone the title and promise are already above the fold when the card settles: the visitor sees Name, Email, and "Send to the team" with no context at all. The footer line truncates to "Sends your question: “What does a website …" on a phone, which says nothing. In the menu the card fits, but on a phone the three-line header leaves the question it answers half clipped above it.

### 5. The closing band composer takes half the panel

`ClosingAsk` uses a two-row textarea with `min-h-14` (56px) and the panel reserves `pb-40 md:pb-36` (160 / 144px) under the transcript for it. The panel is 480px; the header is 83px. What is left for the conversation is 254px on desktop and 238px on a phone. The desktop capture shows a 64px dead band between the last item and the composer. The menu's composer is already a one-line pill, so the three surfaces disagree about what the composer is.

### 6. Smaller edge cases

- **A first-turn miss gets a form.** Retrieval finding nothing on turn one streams the `no_answer` card with no model call. "Hi" or a typo gets Name and Email. The chat-only prompt exists but only serves follow-ups.
- **`contact_details` on a bare name.** "I'm Jordan" is not a request to be contacted.
- **After sent, still offering.** Nothing suppresses a later `handoff` call once the receipt exists.
- **Disabled primary.** "Send to the team" is washed out until both fields are filled. On a card that already lacks context, a disabled primary reads as broken rather than waiting. Optional: enable it and let the existing inline error do the work.
- **`estimate` after a partial answer duplicates the promise.** The model's text says "we send a scoped estimate", then the card says "Priced and scheduled per project". Fine once the card has a lead line and no title.

## Principles to refine against

- **Words are the reply. The card is an action.** The assistant always says something a person would say; the action sits under it, at the weight of an action.
- **Common path first, detail one level down.** Offer in one line. Expand into fields on a tap. (Apple: simplicity is hierarchy, not fewer things; show the common path first, advanced options one level deeper.)
- **One handoff per conversation.** Offered once, sent once, never re-asked. Both the transcript and the model know the state.
- **Never leave the conversation to reach a person.** The inline intake exists now; the contact page is a fallback, not a path.
- **Measure, do not guess.** A reserve for a control is the control's measured height, not a padding utility picked by eye.

## Proposal

### P1. Lead line from code, rendered as the assistant's words

Add `lead` to `ASK_HANDOFFS` and render it as a normal assistant bubble before the action, from `TranscriptItems`, whenever the reply has no text of its own. The model never writes it, so it can never invent a promise. Draft copy:

| Reason | Lead |
| --- | --- |
| estimate | Pricing and timing depend on the project, so that one is for a partner. |
| project | That sounds like a project worth a real conversation. |
| person | A partner can take it from here. |
| contact_details | Thanks. This chat can't pass details on, but this can. |
| no_answer | There's nothing on the site about that yet. |
| none (the quiet row today) | Want a person to reply? |

The card drops its title. The promise line ("A partner will reply by email within 3 business days.") moves to the form state's caption and the receipt, where it is actionable.

### P2. One handoff component, three states

Replace `HandoffCard` plus `TalkToTeam` with one `Handoff` component:

1. **Offer.** One line (the lead) and one `size="chat"` button, "Send to the team". Same footprint as today's quiet row (about 36px). This is what lands after the reply settles, for every reason.
2. **Form.** Tapping the button expands the same element in place (the existing `useRevealSwap` with `morphHeight`) into the inset field group, the send row with the lock caption, and nothing else. No title, no quoted-question footer. When the visitor already typed an email (`contact_details`), the form can land open with the address filled and marked "From your message", since the next step is obvious.
3. **Receipt.** Unchanged from today.

The quiet row becomes the offer state with reason `none`. The contact-page carry (`saveAskHandoff`, `HandoffLink`) stays as a small "or use the contact form" link inside the form state, and can be retired once inquiries from the card are flowing.

### P3. Conversation-level handoff state

Client: `TranscriptItems` renders the handoff once, after the last message, from conversation state derived in `useAskChat`:

- `none`: no valid handoff part anywhere, or the reply is still streaming.
- `offered`: the latest reason from the latest assistant message with a valid handoff part; a later tool call updates the lead, never adds a second element.
- `sent`: the receipt stays pinned at the message where it was sent; later tool calls render nothing. If the model calls again, the transcript shows one line ("Already on its way to the team.") at most.

Server: two changes in `src/endpoints/ask.ts`.

- `useAskChat` sends `handoff: 'none' | 'offered' | 'sent'` in the request body (it already sends `pagePath`). The endpoint appends one line to the system prompt: "A card that sends the visitor's question to the team is already on screen; do not call the handoff tool again." or "The visitor has already sent their details to the team; do not call the handoff tool."
- `sanitizeMessages` keeps card-only turns in history: when an assistant message has a `tool-handoff` part whose reason validates and no text, substitute one server-authored text part such as "(Offered to send this to the team.)". Server-authored, so it is safe; short, so it costs a few tokens. The model then never sees an unanswered turn.

### P4. Trigger precision

Rewrite the reason descriptions in `askHandoffTool` and the matching prompt lines:

- `project`: the visitor says they have a project, or asks us to do something for them. Not for questions about how we work, our process, or who we have worked with: those are answered from the sources.
- `estimate`: what their own project would cost, how long it would take, or when we could start. Not for how we price in general when the sources cover it.
- `person`: they ask for a person by name or role, or to be called or emailed.
- `contact_details`: they shared an email address or phone number. A name alone is not a request.
- Add to `SYSTEM_PROMPT`: "A question the site answers never gets a card, however likely the visitor is to become a client. The card is for what only a person can settle."
- Soften the partial-answer rule: after a grounded answer, call the tool only when the visitor asked for their own price, timeline, or start date.

Eval fixtures (roadmap phase 4, but cheap to start now): the three suggestion chips and their obvious variants must each produce a grounded answer and no card. Run them after every prompt edit.

First-turn miss: land the `no_answer` reply as the offer state (lead plus button), not the form. Consider routing greetings and very short first turns through `CHAT_ONLY_PROMPT` instead of the card.

### P5. One-line composer that grows

`Textarea` already sets `field-sizing-content`, so `rows={1}` grows with the draft. In `ClosingAsk`: `rows={1}`, drop `min-h-14`, and size the panel's bottom reserve from the composer's measured height (a `ResizeObserver` on the form writing `--composer-h`, the panel using `pb-(--composer-h)`) instead of `pb-40 md:pb-36`. Quick version: `pb-20` (80px) for a one-line composer.

Effect: transcript viewport goes from 254 to about 318px on desktop and from 238 to about 318px on a phone, and the closing band's composer reads like the menu's pill instead of a message box. The menu needs no composer change.

### P6. Layout trims if the expanded form is kept anywhere

- Remove the "Sends your question: “…”" footer. The lock caption already says where it goes.
- Merge the caption into one line under the button: "Sends your question to our inbox, never the chat log."
- Mark the handoff item `scrollAnchor` so the scroller aligns its top, not its bottom, when it lands, so the lead is the first thing seen on a phone.
- Menu, phone only: once a transcript exists, drop the header's description line ("Answers about our work, services, and insights"). The component's own comment calls the chrome the least important thing on the surface; a one-line header returns about 30px to the conversation and keeps the question bubble in view above the card.

## Sequencing

| Step | Scope | Files |
| --- | --- | --- |
| 1 | P5, P6. Pure layout, no API change. | `ClosingAsk.tsx`, `MenuAsk.tsx`, the handoff component, stories |
| 2 | P1, P2, P3 client. One handoff component, three states, rendered once per conversation. Stories per state on both live surfaces. | `handoff.ts`, `HandoffPanel.tsx` (new), `messages.tsx`, `useAskChat.ts`, `fixtures.ts`, stories |
| 3 | P3 server, P4. Prompt and tool rewrite, `handoff` body flag, history stub, chip eval cases. | `endpoints/ask.ts`, `handoffTool.ts`, `history.ts`, `scripts/ask-eval.ts` |

No schema changes. No migration. `pnpm migrate:create` is not needed and no create-or-rename prompts are expected.

## Open decisions

- Should `estimate` land with the form open, like `contact_details`, or always as an offer first? Recommendation: offer first everywhere except `contact_details`; measure the tap-through in PostHog before opening more.
- Keep the contact-page carry as a link inside the form state, or retire it in step 2? Recommendation: keep for one release, then delete `HandoffLink`, `saveAskHandoff`, and the sessionStorage read if inquiries from the card are flowing.
- Roadmap phase 2 puts a rating control between sources and the handoff. With P2 the offer row is a single line; the rating control should sit on the same line, right-aligned, so a settled reply ends in one quiet row, not two.

## What shipped

Implemented 2026-09-11 on branch `dev`, uncommitted. `tsc --noEmit` clean, `biome check` clean, `vitest run src/features/ask` green (51 tests across 5 files), captures taken on both live surfaces at 1280 and 390.

All six proposals landed, with three changes to the plan, each noted below.

### The component

`HandoffCard.tsx` and `TalkToTeam.tsx` are gone. `HandoffPanel.tsx` replaces both with one `Handoff` component holding three states on one surface: **offer** (a line and a "Talk to the team" chip), **form**, **receipt**. Each transition rides `useRevealSwap` with `morphHeight`, and the card's ground fades in on `SCROLL_REVEAL_SWAP.textDuration` so a bare offer row reads as becoming the muted form rather than being swapped for it.

**Plan change:** the file is `HandoffPanel.tsx`, not `Handoff.tsx`. On a case-insensitive filesystem that collides with `handoff.ts` and TypeScript refuses to compile either (`TS1149`). The exported component is still `Handoff`.

### The words

`ASK_HANDOFFS` is now keyed by `AskHandoffKind` (the five reasons plus `none`), each entry carrying `form`, `lead`, and `offer`. When a reply is only a handoff, `TranscriptItems` renders that reason's `lead` as an ordinary assistant bubble, and the offer follows a beat later (a 150ms animation delay, so the two read as "here is why" then "here is the way"). The model never writes either.

### The state

`askHandoffState(messages, sent)` collapses the transcript and the surface's sent flag into `none` / `offered` / `sent`. `useAskChat` owns `sent`, `markSent` and `reset`, renders one handoff for the whole conversation, and sends the state in every request body beside `pagePath`. The endpoint appends one line to the system prompt from it and withholds the tool entirely at `sent`.

`askHistory()` in `history.ts` replaces the endpoint's `sanitizeMessages`. Same guarantees, plus: a handoff-only reply is kept in the model's history as the lead line the visitor actually read. That is the fix for the repeat offer.

### The triggers

The tool description, every reason's wording, and both prompts now exclude questions the sources answer. `scripts/ask-eval.ts` asks a running site the three closing-band chips plus three person-only questions and reports sources and reason per case.

**Run 2026-09-11** against the local dev server (`pnpm exec tsx scripts/ask-eval.ts http://localhost:3001`), all six cases as expected:

| Question | Sources | Offer |
| --- | --- | --- |
| How do we start? | 4 | none |
| Who have you worked with? | 4 | none |
| What is your process like? | 4 | none |
| What does it cost? | 0 | `no_answer` (first-turn miss, no model call) |
| How much would a new website for my startup cost? | 4 | `estimate` |
| Can I talk to someone on the team? | 4 | `person` |

The three chips that produced the `project` card in the audit now come back grounded with no offer.

### The layout

Measured in Storybook, reduced motion, CSS px:

| | Transcript viewport | Offer | Form | Receipt |
| --- | --- | --- | --- | --- |
| Closing band, 1280 | 312 (was 254) | 36 | 235 | 167 |
| Closing band, 390 | 300 (was 238) | 75 | 317 | — |
| Menu, 390 | 427 (was 398) | 75 | 317 | — |

- The closing composer is one line with the send button beside it, as the menu's pill (`rows={1}`, `min-h-0`, the textarea sizes to content, `InputGroupAddon align="inline-end"`), 46px on desktop and 58px on a phone, and the panel's bottom reserve is measured by a `ResizeObserver` into `--composer-reserve` (70px desktop, 82px phone) instead of `pb-40 md:pb-36`.
- The menu's header description is `sr-only` below `md`, which returned 29px to the conversation and put the question back in view above its reply.
- The form scrolls to its own top as it opens (`scrollToMessage` with `align: 'start'`). `nearest` left the promise line above the fold on a short panel, which was the original complaint in a new place.
- The quoted-question footer is gone, the lock caption is one line, and the contact page is a link inside the form rather than a separate row.

The first pass kept the submit button on its own row under the textarea and left the boxed textarea's `min-h-16` in place, so the composer block measured 126px and the transcript gained nothing (232px on a phone against a 317px form, the send button 85px below the fold). The review pass moved the button inline and lifted the minimum; the form now fits the phone viewport with the send button in view.

### Tests and stories

- `history.test.ts` is new: the lead-line substitution, dropped empty turns, text-parts-only, a forged system message, the character budget.
- `handoff.test.ts` gained the copy table (every reason has a lead and an offer, `none` has no lead), `askHandoffState`, and `resolveAskHandoffTerms`.
- `storyPlays.ts` holds the shared play steps. Stories added: `HandoffForm` on the widget and the closing band, `HandoffSent` on the closing band, `MobileHandoffForm` on the menu.

**Gotcha worth keeping:** never assert `toBeVisible()` on anything inside the transcript. Every `MessageScrollerItem` carries `content-visibility: auto`, and the browser reports `checkVisibility()` false for its subtree however plainly the element is on screen, so the matcher fails on a field the visitor can read and type into. This silently aborted two story plays before it was found. `storyPlays.ts` asserts presence instead.

### Review fixes, same day

Three things found on review before the commit, each with a test or a story:

- **A reply that settled with nothing to read lost its way forward.** The transcript hid an assistant message with no text and no valid handoff (a tool call the schema refused, an answer cut to nothing), and the one-handoff rule keyed on the last *visible* message, so no offer rendered at all. The old quiet row had always stood in there. `TranscriptItems` now keeps such a reply once the status is `ready` (it is still held back while streaming), so the quiet offer closes it. Story: `Features/AskWidget` › `EmptyReply`.
- **The prompt still ordered the model to call a tool it no longer had.** At `sent` the endpoint withheld the tool but the system prompt kept "call the handoff tool with reason no_answer and write nothing else". The prompts moved to `prompts.ts` (`askSystemPrompt`, `offersAskHandoff`): one builder for the grounded and chat-only modes, and once the visitor has sent, every line that names the tool goes with it. `prompts.test.ts` asserts no variant at `sent` mentions the handoff at all, and that every variant keeps the grounding and length rules.
- **`useAskChat` wrote a ref during render** to feed the transport's body function. The state now goes as a per-request body on `sendMessage` (`{ body: { handoff } }`), which the SDK merges over the transport's `pagePath`; nothing is written during render.
- **The closing composer was still 126px tall.** `rows={1}` alone did nothing: the boxed textarea's `min-h-16` still applied, and the submit button had its own row. The button now sits inline (`askComposerButton` / `askComposerIcon`, shared with the menu from `SubmitButton.tsx`) and `min-h-0` lets one row be one row. Transcript viewport on a phone: 232px to 300px; the form's send button is in view.
- **The `no_answer` lead implied missing content.** "There's nothing on the site about that yet" is what the closing band's own "What does it cost?" chip produced (retrieval finds nothing for it, so the first-turn miss fires). Now "The site doesn't cover that, but the team can.", which is true of prices and of anything else the site leaves to a person.

### Docs updated

The feature README (flow, file table, the whole "Reaching a person" section, the API contract's request body), and the panel-swap line in [animations.md](animations.md).

## Next steps

1. Review the copy in `ASK_HANDOFFS`. The lead and offer lines are drafts in the studio's voice, not approved.
2. Watch `ask_questioned` for `handoff_reason` on the chip questions over the next week; the eval covers six phrasings, production covers more.
3. Optional, from the audit's open decisions: retire the contact-page carry once inquiries from the form are flowing, and decide where the roadmap's rating control sits now that the offer is a single row.
4. Known limit: the offer follows the latest reply, so a form opened and then abandoned for a new question closes with its draft. A send already in flight still lands: `markSent` lives in the surface's hook, so the receipt pins to the reply it was sent from and the state goes to `sent` even though the form itself has left.
