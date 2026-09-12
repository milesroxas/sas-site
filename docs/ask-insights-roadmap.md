# Ask insights roadmap

Status: proposed 2026-09-11; Phases 1 to 3 built 2026-09-12 (code on `dev`; the one migration, `ask-turn-capture`, is generated on approval and carries the old `answered` flag into `outcome`), Phase 4 partly. Companion to [ask-rag-roadmap.md](ask-rag-roadmap.md) (retrieval quality) and the [feature README](../src/features/ask/README.md), which is now the reference for what ships; the phases below are kept as the record of what was decided and why.

## What shipped (2026-09-12)

| Phase | Delivered | Left out, and why |
|---|---|---|
| 1 Capture | `answer`, `sources[{title,url,similarity}]`, `retrieval`, `outcome`, `handoffReason`, `latencyMs`, `inputTokens`, `outputTokens`, `turn`; triage `status`, `topic`, `note`, `plannedContent`; `answered` and `sourceCount` dropped (`outcome` and the sources array replace them; the migration must carry the old flag into `outcome` before the drop) | `partial` by phrase match: `askOutcome()` is structural instead (a handoff reason other than `no_answer` after words); `stopped` added for a reply the visitor cut off (the request's abort signal reaches the model call) |
| 2 Feedback | Thumbs on every settled reply, one-tap reason, `POST /api/ask/feedback` (its own limiter budget; a caller may only file `clicked`, the intake files `inquiry_sent`), `askConversation` on inquiries with the conversation shown on the inquiry and `from_ask` derived from it, `ask_rated` and `ask_handoff_clicked` in PostHog | Rated rows expire with the rest (the export decision: nothing is kept past the notice's 90 days); the eval export is the open Phase 4 item |
| 3 Readable | `AskConversation` on the row and on the inquiry, `AskDashboard` (7-day counts, newest untriaged gaps), `AskFilters` presets; `page_path` on `ask_questioned` so PostHog breaks questions down by page | Content-gap grouping by embedding (needs schema; only if the flat list proves noisy) |
| 4 Eval | `outcome` on `ask_questioned` for a post-deploy regression check | Replay of rated rows (`scripts/ask-eval.ts` still runs the fixed cases); needs rated data first |

The turn's `turn` field is the user message's id from the AI SDK, so feedback needs no row id and no index arithmetic (a rejected question leaves no row and no reply, so counting turns would drift). The mobile closing band was reworked in the same change: below `md` the conversation opens as a full-screen sheet (`ClosingAsk.tsx`).

## Where we were (2026-09-11)

`ask-questions` (Admin > Inbox > Ask questions, migration `20260911_151603_ask_questions`) stores one row per accepted question, written after the response by `recordAskQuestion()` in `src/features/ask/questions.ts`:

| Field | Source | Meaning |
|---|---|---|
| `question` | visitor, redacted | The text typed |
| `answered` | `sources.length > 0` | Retrieval found at least one chunk. Not a quality signal |
| `sourceCount` | retrieval | How many document sources were grouped |
| `pagePath` | client | Page the composer sat on |
| `followUp` | `messages.length > 1` | Not the first turn in this chat |
| `conversation` | AI SDK chat id | Groups turns from one open Ask box |

Everything is read-only, team-only, deleted after `ASK_QUESTION_RETENTION_DAYS` (90) by the `askQuestionRetention` job. Read-only over MCP when a key is granted.

Since 2026-09-11 a reply can end in a **handoff card**: the model calls the `handoff` tool with a reason from `ASK_HANDOFF_REASONS` (`src/features/ask/handoff.ts`), and the no-match first turn is that card with `no_answer`. The reason is not stored on the row yet; it reaches PostHog as `handoff_reason` on `ask_questioned` (null when no card was shown). No schema changed for it.

### What that gives each team, and what it does not

| Team | Can answer today | Cannot answer today |
|---|---|---|
| Content | Which questions had no matching content (filter Answered = No) | Which gaps matter most, which are already handled, what was published in response |
| AI | Whether the fallback keyword path is ever used (no), retrieval hit rate | Which pages were retrieved, similarity scores, what the model actually said, whether the visitor found it useful |
| Product / design | Which pages generate questions | Whether Ask converts (handoff click, inquiry sent), where conversations stall |
| Sales | Inquiries carry `fromAsk` | What the visitor asked before they reached out |

`answered` is a retrieval flag. A hit can still be a weak match, a partial answer, or a bad reply. The inbox is a content-gap log, not an evaluation or research tool.

## Principles

- **Capture what the endpoint already computes before adding model calls.** Answer text, sources, similarity, usage and latency are all in `src/endpoints/ask.ts` and thrown away.
- **Visitor-sourced fields stay read-only.** Team triage fields are the only writable ones, enforced at field level.
- **The notice stays true.** `ASK_NOTICE` promises anonymous chats kept 90 days. Answers, sources and ratings are still "the chat". The one link to a person (an inquiry) lives on the inquiry, never on the question row, and retention never touches inquiries.
- **Redact and expire everything new.** `redactFreeText` runs on `answer` too (the model may echo a detail). The retention job deletes new fields with the row.
- **Additive schema only.** Each phase that touches schema is one `pnpm migrate:create` with no create-vs-rename prompts.

## Phase 1: capture the whole turn

Goal: the AI team can read a question, see what was retrieved and what the model said, and know what it cost. Content gets a triage workflow.

### New fields on `ask-questions`

Visitor / system fields (readOnly, `access.update: () => false`):

| Field | Type | Source |
|---|---|---|
| `answer` | textarea | Streamed reply text from `onFinish` (`text`), passed through `redactFreeText` |
| `sources` | array of `{ title, url, similarity }` | `RetrievedSource` plus best chunk similarity. `chunksToSources()` in `retrieve.ts` must carry `similarity` through from `NearestChunk` (keyword fallback stores `null`) |
| `retrieval` | select `embedding` / `keyword` / `none` | Which path in `retrieveSources()` produced the sources. Requires the function to return the path alongside the sources |
| `outcome` | select `answered` / `partial` / `no_sources` / `chat_only` / `error` | Replaces the binary `answered`. `no_sources` = first-turn `no_answer` card; `chat_only` = source-less follow-up under `CHAT_ONLY_PROMPT`; `error` = `onError` fired; `partial` = see below |
| `handoffReason` | select, options from `ASK_HANDOFF_REASONS`, sidebar | The card the reply ended in, from `staticToolCalls` in `onFinish` (already read there for PostHog). Empty when no card was shown |
| `latencyMs` | number, sidebar | Time from request to `onFinish` |
| `inputTokens`, `outputTokens` | number, sidebar | From `usage` in `onFinish` |

`partial` detection, cheapest first: a reply with text *and* a handoff card is a partial answer by construction (the prompt sends the unpublishable rest of a question to the card), so `text !== '' && handoffReason` is the v1, with no phrase match. The prompt still asks for a "we don't publish" sentence when the rest is a page-path next step rather than a person; match that phrase for the remainder. If evals show either is unreliable, switch to a one-field `generateObject` classification on the finished answer (one extra small call, off by default).

Keep `answered` for one release as a derived value (`outcome === 'answered' || outcome === 'partial'`), then drop it in a later migration once the dashboard reads `outcome`.

Team triage fields (writable by `authenticated` users only):

| Field | Type | Purpose |
|---|---|---|
| `status` | select `new` / `reviewed` / `content_planned` / `ignored`, default `new`, sidebar | Work state |
| `topic` | relationship to `categories`, sidebar | Reuse the existing taxonomy; do not add a tags field |
| `note` | textarea | Why it was triaged the way it was |
| `plannedContent` | relationship to `posts`, `pages` | The draft that closes the gap |

Access: collection `update: authenticated`; every non-triage field gets `access: { update: () => false }`. `create` stays `nobody`. Add `status` to `defaultColumns` and a `status` filter preset if Payload's list presets are in use by then.

### Endpoint changes (`src/endpoints/ask.ts`)

- Move `recordAskQuestion()` from before the model call to `onFinish` / `onError` so it has the answer, usage and outcome. Keep the write inside `afterResponse()` so latency is unchanged. The `no_sources` first-turn path records immediately as today.
- Record a start timestamp before `retrieveSources()` for `latencyMs`.

### Deliverables

- Fields above, `pnpm generate:types`, one migration (`pnpm migrate:create ask-turn-capture`, additive, no prompts expected).
- `recordAskQuestion()` signature grows; `questions.ts` tests cover redaction of `answer`.
- README section "Questions, for the team" updated; `docs/cms-naming.md` unchanged (same group).
- MCP description string in `src/plugins/mcp.ts` updated to mention answers and outcomes.

## Phase 2: visitor signal and conversion

Goal: labelled data for the AI team, and a funnel for product and sales: asked, grounded, useful, converted.

### Rating

- Thumbs up / down under a settled assistant message in `TranscriptItems` (`src/features/ask/messages.tsx`), after `AssistantSources`, on the same row as the handoff offer (`Handoff` in `src/features/ask/HandoffPanel.tsx`), right-aligned, so a settled reply ends in one quiet row. Optional one-tap reason on thumbs down: `wrong`, `incomplete`, `off_topic`.
- New endpoint `POST /api/ask/feedback` with `{ conversation, turn, rating, reason? }`. `turn` is the zero-based index of the user message in the transcript so the client needs no row id. Server finds the row by `conversation` + `createdAt` order, sets `rating` and `ratingReason` only if unset. Same rate limiter as `/ask`. No auth.
- Fields: `rating` (select `up` / `down`, sidebar), `ratingReason` (select, sidebar). Read-only in admin.
- PostHog: `ask_rated` server event with `rating`, `outcome`, `source_count`.

### Handoff outcome

- Two ways out, two signals. The contact-page fallback's click (`HandoffLink` in `src/features/ask/HandoffPanel.tsx`) calls `/api/ask/feedback` with `{ conversation, turn, handoff: 'clicked' }`. The handoff form sends the inquiry itself (`postInquiry` from `Handoff`), so it can pass the `conversation` id with `fromAsk` and the intake marks the turn `inquiry_sent` directly, no click event needed. "Book a call" leaves the site and is not a handoff. Field `handoff` (select `clicked` / `inquiry_sent`, sidebar).
- `saveAskHandoff()` in `handoff.ts` stores the `conversation` id with the questions. The contact form (`ContactTemplate.client.tsx`, `submit.ts`) forwards it with `fromAsk`. `/api/inquiries` sets `askConversation` (text, indexed) on the inquiry and calls the same feedback path to mark the latest turn `inquiry_sent`.
- Inquiry document view gets a "From Ask" sidebar link: `Inbox > Ask questions?where[conversation][equals]=...`. The question rows never point at the inquiry.

### Deliverables

- Fields `rating`, `ratingReason`, `handoff` on `ask-questions`; `askConversation` on `inquiries`. One migration (`pnpm migrate:create ask-feedback`, additive, no prompts expected).
- The rating control sits after `AskSources` and before the handoff card or the quiet row, whichever closes the reply (not after a sent receipt: the visitor has already said what they needed).
- Storybook: rating control state in `AskWidget.stories.tsx` and `MenuAsk.stories.tsx`.
- Tests: feedback endpoint rejects a second rating, ignores malformed ids, respects the rate limit.
- Docs: `docs/inquiries.md` gains the Ask link; feature README funnel section.

## Phase 3: make it readable

Goal: the team opens one place and knows what to do. No schema.

### Conversation view

Custom document view tab on `ask-questions` (pattern: `src/collections/Inquiries/components/InquiriesDashboard.tsx`, client component, `useConfig()`, REST fetch with `credentials: 'include'`). Fetches every row with the same `conversation`, sorted by `createdAt`, renders question, answer, sources with similarity, outcome, rating and handoff per turn. Register through the import map (`pnpm generate:importmap`).

### Dashboard card

Second card beside the Inquiries card on the admin dashboard, last 7 days, all from `count` and `find`:

- Questions asked, grounded rate (`outcome in answered, partial`), thumbs-down rate, handoff click rate, inquiries from Ask
- Top 5 `status = new` and `outcome = no_sources` questions, linking to the row
- Top 5 `pagePath` by volume

Quiet single line when there is nothing new, matching the Inquiries card.

### Content-gap grouping

Reuse the embedding layer (`src/features/ask/embeddings.ts`): embed each stored question once (new column `embedding` on `ask_questions` via the same `beforeSchemaInit` route as `ask_embeddings`, or a sibling table `ask_question_embeddings` keyed by row id). Group `no_sources` and thumbs-down rows by cosine similarity above 0.8 and show "12 questions about pricing" on the dashboard with a link to the filtered list. This is the one item in Phase 3 that needs schema; do it last and only if the flat list is too noisy.

Stretch: a weekly job that writes a summary per cluster (count, three example questions, suggested topic) so content planning starts from a list, not a query.

### Deliverables

- Components under `src/collections/AskQuestions/components/`, import map regenerated.
- No migration unless the grouping column lands.

## Phase 4: eval loop

Goal: prompt, chunking and `MIN_SIMILARITY` changes are checked against real questions before they ship. No schema.

- `scripts/ask-eval.ts`: export rows with a `rating`, replay each through `retrieveSources()` and the model, print source diff (urls gained or lost, similarity deltas) and an answer diff. Runs with `pnpm payload run`, same as the backfill script.
- Retention: rated rows are the training set and the 90-day delete will erase them. Either export them to an anonymised JSON fixture before the cutoff (a step in the eval script), or extend retention for rated rows only and update `ASK_NOTICE` to say so. Decide before Phase 2 ships; the default is export.
- Track `ask_rated` and `ask_questioned` in PostHog by `outcome` so a regression after a deploy is visible without opening the admin.

## Sequencing and cost

| Phase | Schema | Effort | Unlocks |
|---|---|---|---|
| 1 | one migration, additive | ~1 day | Answer quality visible, cost per question, triage workflow |
| 2 | one migration, additive | ~1 day | Labelled data, conversion funnel, sales attribution |
| 3 | none (optional grouping column) | 1 to 2 days | Team actually uses it |
| 4 | none | half a day | Safe iteration on prompt and retrieval |

Phases 1 and 2 can ship together in one migration if built in one branch. Phase 3 depends on `outcome` and `rating` existing. Phase 4 depends on Phase 2.

## Open questions

- `partial` detection: phrase match or one classification call? Start with phrase match, revisit after 200 answers.
- Rated-row retention: export or extend? Affects `ASK_NOTICE` copy.
- Grouping storage: column on `ask_questions` or a sibling table? Sibling keeps the collection's own schema Payload-managed.
- Do we want the rating UI on all three surfaces (page, menu, footer closing band) or the page only for v1?

## Checklist before starting any phase

- Read `AGENTS.md` and `.cursor/rules/database-migrations.mdc`.
- Confirm the newest migration snapshot matches `main` (`pnpm check:migrations:drift`) before `migrate:create`.
- `overrideAccess: false` wherever a `user` is passed; `authenticated` from `src/access/authenticated.ts` for team-only rules.
- Every new visual piece gets a Storybook story.
- No em dashes in copy, comments, or docs.
