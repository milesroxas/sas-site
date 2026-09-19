# Ask + Jev roadmap

Status: **built 2026-09-19**, Phases 0 to 4, in one session. The code ships dormant: every deployed environment runs mode `off` until `TYPESAFE_API_KEY` and `ASK_JEV` are set in Vercel. What to do now is in [Next steps](#next-steps), how to check it is in the [Testing guide](#testing-guide), and what was measured and what changed from the plan are in the [Build record](#build-record-2026-09-19). Proposed 2026-09-19, scope confirmed the same day (Phases 0 to 4, analytics included). Companion to [ask-rag-roadmap.md](ask-rag-roadmap.md) (stage 5 asks for retrieval evals, which Phase 0 here delivers) and the [feature README](../src/features/ask/README.md), which stays the reference for what ships.

This document is written to be picked up cold by a later session. Read it, the feature README, and `src/endpoints/ask.ts` before touching code. Load the `typesafe:typesafe-ai` skill and read the live TypeSafe docs it points to before writing any Jev call: the docs are the source of truth for the SDK and for question wording, and they move.

## Next steps

Written for Miles. In order: each step unblocks the next, and nothing here needs a code change. The code is on `main`, `preview` and `dev` (`d7d399c`), and the judge is `off` everywhere it is deployed.

| # | Step | How | Done when |
|---|---|---|---|
| 1 | Put the key in Vercel | From the main checkout (`~/SITES/sas-site`): `vercel env add TYPESAFE_API_KEY production`, then again for `preview`. On 2026-09-19 it was on neither the project nor the team's shared variables | `vercel env ls` shows `TYPESAFE_API_KEY` for Production and Preview |
| 2 | Put the key in the Conductor root `.env` | Add the `TYPESAFE_API_KEY=` line to `~/conductor/repos/sas-site/.env`. New workspaces copy that file, and it does not have the key (the building session copied it into its own workspace by hand) | A new workspace's `.env` has the key |
| 3 | Capture a preview baseline **before** turning anything on | `pnpm exec tsx scripts/ask-bench.ts capture preview-off https://preview.suits-sandals.com --mode off` (about 9 minutes). Local numbers are a laptop's; this is the like-for-like baseline for step 5 | `docs/perf/ask-jev/preview-off.json` exists |
| 4 | Turn the judge on for preview | `vercel env add ASK_JEV preview` with the value `on`, then redeploy preview (an env change only reaches new deployments): push to `preview`, or Redeploy in the Vercel dashboard | A preview turn's `ask answered` log line says `judge_mode: "on"` |
| 5 | Measure preview, then click through it | `... capture preview-on https://preview.suits-sandals.com --mode on`, then `... compare preview-off preview-on`. Then the [manual script](#by-hand-the-ten-minute-script) on the preview site. Pass bars are under [On preview](#on-preview) | The bars pass, or each miss has an explanation you accept |
| 6 | Read the answers | The "Answers side by side" half of `docs/perf/ask-jev/report.md`: `after` is `gpt-5-mini` at `low`, `after-model` at `minimal`. The building session found no invented facts, but `minimal` is more formulaic and terser on follow-ups. This is the one judgment call left in Phase 4 | You keep `minimal`, or set `REASONING_EFFORT.writing` back to `'low'` in `src/endpoints/ask.ts` (answered turns then start about 3 s later) |
| 7 | List TypeSafe on the privacy page | The drafted Privacy page (Pages id 8, unpublished): TypeSafe is a processor of the redacted question. It does not train on requests; zero retention is an enterprise plan. Open decision 2 | The page names it. This is the gate on step 8 |
| 8 | Production: `shadow` first | `vercel env add ASK_JEV production` with the value `shadow`, redeploy. Nothing a visitor sees changes. Leave it a week or 30 turns, whichever comes later | Go and no-go under [In production: reading shadow](#in-production-reading-shadow) |
| 9 | Production: `on` | Change `ASK_JEV` to `on` for production, redeploy. Run the manual script once on the live site with `?internal=on` set first, so your turns stay out of analytics | The script passes on production |
| 10 | PostHog: confirm the properties arrive and build the tiles | Start a session with the PostHog MCP connected (`/mcp` to check; its tools only load at session start) and ask it to do the "Owed" half of [Analytics: what is done and what is owed](#analytics-what-is-done-and-what-is-owed). Any time after step 5: preview captures with `environment = preview`, and the bench turns from step 5 have already sent the properties (the bench carries no `sas_internal` cookie; your own browser does if you ever visited `?internal=on`, and `?internal=off` clears it) | `read-data-schema` lists the 13 properties on `ask_questioned`, and the Ask dashboard has the eight tiles |

Rollback at any point is the env value and a redeploy: `ASK_JEV=off` (or remove it) is the old code path exactly. No code revert, no migration.

Later, in no order, none of it blocking: start the passage check as soon as the query is embedded rather than after the route is known (saves up to about 100 ms on first turns); try `gpt-5.4-mini` at `reasoningEffort: 'none'` if `minimal` reads too thin; the four items under [Later](#later-needs-a-migration-ask-first), which need a migration.

## Testing guide

Three layers: a script you run by hand in the browser, the automated checks, and what to read once real traffic flows. Use the first after any change you can see, the second after any change to code, prompts, questions or thresholds, the third before each rollout step.

### Setting the mode locally

In the workspace (or main checkout) `.env`: `TYPESAFE_API_KEY=...` and `ASK_JEV=on` (or `shadow`, or `off`). Saving `.env` reloads the dev server ("Reload env: .env" in its log).

**The trap:** Payload keeps endpoint code across hot reloads, so an edit to `src/endpoints/ask.ts`, `judge.ts`, `prompts.ts` or `retrieve.ts` is **not live** until the server reloads. Touch `.env` (add and remove a blank line), wait a few seconds, and confirm with one question that the new behavior is there before you trust any test. The building session lost a 9 minute capture to this.

The endpoint allows 10 questions a minute per IP. Past that you get "Too many questions, try again in a minute": that is the limiter, not a bug.

### By hand: the ten minute script

Run it on `/ask`, then spot check the takeover menu and the footer's closing band (all three share the transcript, so one full pass plus two spot checks is enough). With the judge `on`:

| # | Type this | Expect |
|---|---|---|
| 1 | Can I talk to someone on the team? | The `person` card alone, at once (well under a second). No words, no sources |
| 2 | How much would a new website for my startup cost? | The `estimate` card alone, at once |
| 3 | I have a project I'd like to talk to you about. | The `project` card alone, at once |
| 4 | My email is jane@example.com, can you send me more information? | The `contact_details` card alone, instantly (no Jev call). Open the form: the address is already in the email field, marked "From your message" |
| 5 | What is the capital of Mongolia? | The `no_answer` card alone |
| 6 | Do you work with startups? | A grounded answer with sources, then the quiet offer ("Want a person to reply?"). No card |
| 7 | Can you fix my Webflow site? | A short answer about Webflow work, **then** the `project` card. The answer must not end in its own invitation ("tell us...", "send us...") and must not mention the offer |
| 8 | How do you work, and what would my project cost? | An answer to the first half, **then** the `estimate` card. Before the judge this got the card and no words, every time |
| 9 | What does it cost? | A short answer from the FAQ (cost depends on capacity, disciplines, seniority...), then the `estimate` card. Before the judge this got `no_answer` |
| 10 | New chat. "Tell me about your work with Interchecks." then "What results did it get?" | The second answer is about Interchecks and its sources include `/works/interchecks` (the follow-up leaned on the first turn) |
| 11 | Same chat: "What is your process like?" | An answer about process, with process sources, not Interchecks ones (the follow-up stood alone) |
| 12 | Same chat: "Thanks, that helps!" | One or two conversational sentences. No sources, no card |
| 13 | Open any card's form and send it (use a real inbox you own). Then ask "Can I talk to someone?" | A reply in words and **no second card**: once the visitor has sent, never a card |
| 14 | Ask a long question (number 6 works) and press Stop mid-answer | The reply stops, no card is appended, and the row in the admin says `stopped` |

Also check on every answer: under 120 words, plain text (no markdown, no bullet lists), no em dashes, never the words "sources" or "documents", every page path it names is a real page, the thumbs still post, and the source rows list only pages that are actually about the question (the judge vets them, so 1 to 4 sources is normal where there used to be 4 every time).

With the judge `off` or `shadow` the same script should behave exactly as the site did before: numbers 1 to 4 take seconds (the writing model decides), and 7 and 8 may come back as a card with no words. That difference is the feature.

**Seeing what the judge did.** Every turn writes one `ask answered` line to the server log (the dev server's terminal locally, the deployment's Logs tab on Vercel):

| Field | Healthy |
|---|---|
| `judge_mode` | The mode you set. If it says `off` with the env set, the key is missing |
| `judge_request`, `judge_confidence` | The pick matches what you asked; confidence mostly above 0.6. Below 0.35 the turn falls back |
| `judge_failed` | `false`. `true` means a timeout or an API error: the turn still answered, on the old path |
| `fell_back` | `false` on nearly every turn. `true` is safe but slow |
| `model_skipped` | `true` on card-only turns (script numbers 1 to 5) |
| `judge_ms`, `passages_ms` | A few hundred ms each. Near 800 means the timeout is biting |
| `chunks_candidates`, `chunks_kept` | Kept is usually well under candidates; 0 kept ends in a card |
| `first_output_ms` | Under 1,000 on card-only turns; about 1,500 on answered turns locally |

The same turn is a row in Admin › Inbox › Ask questions, with the outcome, the card's reason and the sources. A card with no retrieval behind it records `Chat only`; a `no_answer` records `No sources` (a content gap).

**Proving it fails open.** Set `TYPESAFE_API_KEY` to a wrong value with `ASK_JEV=on` and run numbers 1 and 6: both must still answer (slowly, on the old path), with `judge_failed: true` and `fell_back: true` in the log and nothing odd on screen. Remove the key entirely and `judge_mode` reads `off`. Put the real key back afterwards.

### Automated

| When | Run | Passes when |
|---|---|---|
| Any change under `src/features/ask` or the endpoint | `pnpm exec vitest run src/features/ask tests/int/ask.int.spec.ts` | 100 of 100. The unit tests need no network; the integration spec needs the database and pins the judge off except in its own two judge cases. CI does not run vitest, so this is on you |
| A prompt or tool-description edit | `pnpm exec tsx scripts/ask-eval.ts http://localhost:<port>` | "All cases as expected." (6 questions, fits under the rate limit) |
| A change to a Jev question, a threshold, or before bumping `ASK_JUDGE_MODEL` | `pnpm exec tsx --env-file=.env scripts/ask-judge-eval.ts` | "turn routing agrees with the fixture on 19 of 19 cases". No server needed. Read the probabilities it prints: a number that sits close to its threshold is the next bug |
| New or changed site content, or a change to the similarity floor | `... scripts/ask-judge-eval.ts --passages` | No `MISSING` beside a case, and the kept chunks for each question are the ones you would have picked |
| Once production has `ask-questions` rows you may send to TypeSafe (after step 7) | `... scripts/ask-judge-eval.ts --from-db` with `POSTGRES_URL` from `.env.production.pulled` and `PAYLOAD_DB_PUSH=false` | The agreement rate it prints, and a read of every `DIFF` line |
| Before and after anything that could move latency or routing | `pnpm exec tsx --env-file=.env scripts/ask-bench.ts capture <label> <base-url> --mode <off\|shadow\|on>`, then `... compare <label> <label>` | See the bars below. Same machine and same database for every label you compare; about 9 minutes a capture |

When a real question is routed wrongly: add it to `scripts/ask-cases.ts` first, with what it should have ended in. Then run `ask-judge-eval.ts` and look for a number that separates it: changing a value in `ASK_JUDGE_THRESHOLDS` is a policy edit, rewording a question is a last resort (Jev reads literally, and a reworded question moves every other case). Re-run the whole fixture before shipping either, never just the one question.

Bars for a local `compare` against `after-model` (the shipped state): card accuracy 57 of 57, words when expected 57 of 57, the same card on every run for 19 of 19 cases, card-only turns under 1 s median, turns that must have words at or under about 2 s median to first output. The writing model's own speed varies by the hour, so compare captures taken close together and distrust a difference under about 500 ms.

### On preview

After steps 3 to 5 above. `compare preview-off preview-on` should show:

- Card accuracy and words-when-expected at the local numbers (57 of 57). Read every miss in the per-case table: a miss that is also a miss in `preview-off` is the content, not the judge.
- Card-only turns under 1 s median (they were about 2.7 s with the judge off).
- Turns that must have words **faster** to first output than `preview-off`. Locally the judge costs about 450 ms and `minimal` reasoning gives back about 3 s; on Vercel the judge's share should be smaller.
- In the deployment's logs over the capture: `judge_failed` on no more than 1 turn in 20, and `judge_ms` and `passages_ms` p90 comfortably under 800. If they crowd 800, raise `ASK_JUDGE_TIMEOUT_MS` before going further; if they sit near 100 to 200, the timeout can come down.

Bench turns on preview land in the preview database branch and in PostHog as `environment = preview` with `page_path = /bench`, so they are easy to filter. Do not run the bench against production: every turn is a stored row and a production event.

### In production: reading shadow

Shadow changes nothing a visitor sees; it records what Jev would have done beside what the writing model did. After a week or 30 turns (the PostHog tiles from step 10 make this a glance; until then the Vercel logs hold the same fields):

- **`judge_failed`** under about 5 percent of turns. More means the timeout or TypeSafe's availability needs a look before Jev decides anything.
- **`judge_ms` and `passages_ms`** p90 under 800.
- **`judge_agrees`**: expect most turns `true`. For every `false`, find the turn in Admin › Inbox › Ask questions (match the time and the page path; analytics never holds the question) and decide who was right. In the local run all eight disagreements were the writing model giving up with `no_answer` where Jev was right. Go when no disagreement is Jev showing a card for a question the site answers, or Jev refusing one it could have answered. A disagreement of that kind goes into `scripts/ask-cases.ts` and through the tuning loop above first.
- **`chunks_kept` of `chunks_candidates`**: if kept is 0 on questions the site plainly answers, the passage thresholds are too strict for real phrasing; check with `ask-judge-eval.ts --passages`.

After `on`: watch `fell_back` (should be rare), `model_skipped` (the share of turns that cost no model call), thumbs-down on `ask_rated`, and the `No sources` filter in the admin for gaps that are new. Any doubt: `ASK_JEV=shadow` and redeploy puts the writing model back in charge while Jev keeps being measured.

## The idea in one paragraph

Ask spends a full `gpt-5-mini` call (about 6 to 7 seconds) on every turn, including turns where the only output is a decision: offer a person, say the site has nothing, or acknowledge a thanks. Jev (TypeSafe's System One model) cannot write text, but it returns typed judgments with calibrated probabilities in roughly 100 ms for $0.042 per million input tokens. The plan moves the *decisions* out of the writing model and into Jev plus code, and leaves the writing model with one job: write a grounded answer from pre-checked evidence. Turns that need no writing skip the writing model entirely.

## Baseline (measured 2026-09-19)

| Fact | Value | Source |
|---|---|---|
| Latency per answered turn | p50 about 6.3 to 7.0 s, p90 about 7.4 s | PostHog `ask_questioned.latency_ms`, last 30 days. Only 5 turns carry the property (shipped 2026-09-12); noncanonical, no governed metric exists |
| What `latency_ms` measures | Request start to stream finish, not time to first text | `record()` in `src/endpoints/ask.ts` |
| Volume | 79 turns in 30 days | Same query |
| Cost | Cents per month at this volume. Cost is not the lever; latency and decision reliability are | |
| Similarity floor | 0.3 cosine, never measured | `MIN_SIMILARITY` in `src/features/ask/retrieve.ts` |
| Known decision flaw | `gpt-5-mini` will not reliably write text and call the tool in one turn, so the `partial` outcome (answer, then offer) is unreliable | Feature README, `handoffTool.ts` header comment |
| Follow-up retrieval | Previous user turn is always prepended, so a topic switch searches with the old subject attached | `retrievalQuery()` in `src/endpoints/ask.ts` |

## What Jev will and will not do

Will: classify the visitor's request, decide whether a follow-up depends on the previous question, and check each retrieved passage for relevance and usable evidence.

Will not: write answers, count, do arithmetic, or reason over several hops. Jev 1.13 reads instructions literally, loses accuracy on large states full of unrelated text, and does not treat state as hostile. Each of those shapes a rule below. Re-read `https://docs.typesafe.ai/model-jaggedness/jev-1.13.md` at implementation time.

## Principles

- **Code owns the workflow.** Jev returns probabilities; every threshold and every branch lives in one constants block and plain `if` statements. Changing policy is a number edit, never a reworded question.
- **Fail open to today's path.** Missing key, timeout, 429, or a low-confidence answer all fall back to the current behavior (writing model with the `handoff` tool). A visitor never sees a Jev error.
- **Measure before and after with the same tool.** Phase 0 ships first and its baseline run happens before any Ask code changes.
- **No schema change in this roadmap's core phases.** No migration, no `migrate:create` prompts. Everything that needs a column is parked under "Later".
- **Keep known rules in code.** Contact details are found by the existing regexes (`findEmailAddress`, the phone pattern in `redact.ts`), not by a model.
- **Send Jev the redacted question** (`redactFreeText`), since contact-detail detection already happened in code.
- **The words stay code-owned.** Nothing here changes `ASK_HANDOFFS` copy, the card, the form, or the prompts' voice rules.

## Decisions

Decided by Miles, 2026-09-19:

| Decision | Outcome |
|---|---|
| Is the writing-model change (Phase 4) in scope | **Yes.** It stays its own phase with its own benchmark label, so gains are attributed correctly |
| PostHog tracking for this work | **Yes, and the implementing session does all of it** with the `posthog-analytics` skill: the code, the skill's event registry, verification, and the dashboard tiles. Miles does none of it by hand. See [Analytics](#analytics-the-implementing-session-owns-this) |

Still open, settle before the phase that needs them:

| # | Decision | Recommendation | Needed by |
|---|---|---|---|
| 1 | Add `@typesafe-ai/sdk` (v0.6.0 at time of writing, Node 20+). The workspace has a 24 h pnpm release cooldown | **Done 2026-09-19**: 0.6.0 added (released 2026-09-15, past the cooldown; no dependencies) | Phase 1 |
| 2 | TypeSafe becomes a processor of visitor questions. It does not train on requests; zero retention is enterprise only. The drafted Privacy page (Pages id 8, unpublished) should list it | Add before Jev sees production traffic. **Still open**: it is the one thing between the shipped code and `ASK_JEV=shadow` in production | Phase 2 in production |
| 3 | `TYPESAFE_API_KEY` exists only in local `.env`. Production and preview need it in Vercel | Miles adds it. Until then production behaves as mode `off`. **Checked 2026-09-19**: the key is on neither the `sas-site` Vercel project nor the team's shared variables, and `ASK_JEV` is unset, so every deployed environment runs `off` | Phase 2 in production |

## Target flow (mode `on`)

```
POST /api/ask
  ├─ hide / config / rate limit / validation          (unchanged)
  ├─ contact details in the question? (regex, code)   → card `contact_details`, no Jev, no model
  ├─ in parallel:
  │    ├─ judgeTurn()      one Jev request: `request` Choice, the `own_project`,
  │    │                   `general_question` and `names_work` Nouls,
  │    │                   `depends_on_previous` Noul (follow-ups only)
  │    └─ embedMany()      [question] or, on a follow-up, [question, previous + question]
  ├─ route the turn in code (see decision table)
  │    ├─ card only        → handoffResponse(), no retrieval, no model
  │    ├─ conversation     → chat-only prompt, no retrieval, no tool
  │    └─ needs evidence   → pgvector with the vector `depends_on_previous` picked
  ├─ judgePassages()       one Jev request per candidate chunk, all in parallel:
  │                        `is_relevant`, `has_evidence` → keep or drop in code
  │    └─ nothing kept     → card (`no_answer`, or the turn's own reason), no model,
  │                          on first turns and follow-ups alike
  ├─ streamText()          kept chunks only, NO tools, prompt without the tool rules
  └─ card after the text   appended by code when the turn's reason calls for one
```

Jev adds no wait to the turn decision because the embedding call it runs beside is slower. The passage check is serial and adds one parallel Jev round trip (expect 100 to 250 ms; measure it). Measured 2026-09-19 from a laptop: the turn judgment took 290 to 520 ms and often outlasted the embedding call, and the passage check took 340 to 660 ms. See the [Build record](#build-record-2026-09-19).

### Decision table

`T_*` are thresholds in `ASK_JUDGE_THRESHOLDS`. Start conservative, tune with Phase 1's script.

| Signals | Action | Outcome recorded |
|---|---|---|
| Email or phone in the question (code) | Card only, `contact_details` | `partial` rules unchanged: `askOutcome()` decides |
| `request = person`, confidence ≥ `T_act` | Card only, `person` | `chat_only`: `askOutcome()` decides, and no sources were retrieved (it was `partial` when the model decided after retrieval) |
| `request = estimate` or `project`, and only a person could settle it (see [Questions as built](#questions-as-built-2026-09-19-jev-1130)) | Card only, that reason | `chat_only`: no sources stand behind it |
| `request = estimate` or `project`, otherwise | Retrieve and check passages. Evidence kept: answer, then card with that reason. None kept: card only | `partial`, or the card-only outcome |
| `request = conversation`, follow-up turn | Chat-only prompt, no retrieval, no tool | `chat_only` |
| `request = information` or `other` | Retrieve and check. Evidence kept: answer, quiet offer as today. None kept: `no_answer` card, no model | `answered` / `no_sources` |
| Choice confidence < `T_low`, or `judgeTurn()` returned null | Today's path: writing model with the `handoff` tool | as today |
| `handoffState = sent` | Never a card (matches `offersAskHandoff`) | |

Open design point to settle with the fixture, not by argument: "What does it cost?" is expected to reach a person in `scripts/ask-eval.ts`, while the prompt says general pricing questions are answered from the site. In the table above that tension resolves itself: `estimate` with no kept evidence is card only, and with kept evidence is answer plus card. Confirm against the real corpus.

### Questions as built (2026-09-19, `jev-1.13.0`)

Tuned with `scripts/ask-judge-eval.ts` against the 19-case fixture and the local production-content corpus (370 chunks). State for the turn: `{ question, previous_question }`, both redacted. State for a passage: `{ query, passage: { title, heading, text } }`, one chunk per request (large mixed states cost accuracy). The exact wording lives in `src/features/ask/judge.ts`; this table is the summary.

| Id | Type | Asks | Notes |
|---|---|---|---|
| `request` | Choice | What is the visitor asking for in `question`? `information`, `estimate`, `project`, `person`, `conversation`, `other`, with the criteria drafted here (wording from `handoffTool.ts` and `prompts.ts`) | Right on 19 of 19 fixture cases. Lowest confidence 0.45 ("What is the capital of Mongolia?", `other` over `information`) |
| `own_project` | Noul | Is `question` about the visitor's own project? | Replaces the drafted `only_a_person` together with the two below |
| `general_question` | Noul | Does any part of `question` ask about the studio in general? | |
| `names_work` | Noul | Does `question` name the kind of work the visitor wants done? | |
| `depends_on_previous` | Noul | Does `question` contain a pronoun or leave out its subject, so that it refers back to `previous_question`? | Dependent pairs 0.95 to 0.98, standalone pairs 0.09 to 0.56 |
| `is_relevant` | Noul | Does this passage address the subject of the query? | From the TypeSafe RAG cookbook |
| `has_evidence` | Noul | Does this passage state information usable in a direct answer to the query? | Same |

**Why `only_a_person` became three questions.** As drafted ("Is every part of `question` something only the studio's team could settle...") it read 0.35 to 0.56 on plainly own-project questions ("How much would a new website for my startup cost?" 0.45), too low to separate from a mixed question. Jev reads literally and a universal is a hop too many, which is what TypeSafe's jaggedness notes say to split. The three literal Nouls separate cleanly (own-price questions: `own_project` 0.73 to 0.97 with `general_question` 0.04 to 0.24; the mixed question: both above 0.9), and code combines them: an `estimate` is the card alone when `own_project` ≥ 0.6 and `general_question` < 0.5 (0.7 at first; the `after` capture showed "When could you start on our project?", which reads 0.73 to 0.76, slipping under it once in three, and nothing else reads above 0.41); a `project` is the card alone when `names_work` < 0.5 and `general_question` < 0.5 ("I have a project" names no work; "Can you fix my Webflow site?" names work the site may speak to, so it retrieves, answers, then shows the card). A miss is cheap: the turn retrieves, and with no passage kept it still ends in the card alone.

Thresholds (`ASK_JUDGE_THRESHOLDS`): `act` 0.6, `low` 0.35, `ownProject` 0.6, `generalQuestion` 0.5, `namesWork` 0.5, `dependsOnPrevious` 0.7 (leans toward attaching the previous turn: a wrong yes is the old behavior, a wrong no embeds "what about that?" alone), `relevant` 0.45, `evidence` 0.55 (the cookbook's starting values held on this corpus). Passage routing, first match wins: `is_relevant < relevant` → drop; `has_evidence > evidence` → keep; otherwise drop. The cookbook's prompt-injection and contradiction questions are left out: the corpus is the studio's own published CMS content.

**The similarity floor.** The fixture showed the 0.3 floor cutting a chunk Jev keeps: "What does it cost?" found nothing at 0.3, while the FAQ chunk that answers it sat at 0.23 (relevant 0.97, evidence 0.84) among eleven chunks the check dropped. So the floor is 0.2 when the passage check vetoes chunks and stays 0.3 when nothing else filters (`CHECKED_MIN_SIMILARITY` in `retrieve.ts`).

Do not carry a threshold tuned on a Noul to a Choice or the reverse, and do not expect `P(x)` and `1 - P(not x)` to agree. `jev-1.13.0` is pinned (not `jev-latest`), and the `model` field of each response is logged (`judge_model` in the `ask answered` line).

## Phases

Each phase ends with a benchmark run saved under its own label, so the comparison table grows one column per phase.

### Phase 0: the comparison test (ships first, before any Ask change)

Goal: one command captures how Ask behaves, one command compares two captures. This is the test Miles asked for, and it is also the retrieval-eval fixture stage 5 of the RAG roadmap has been missing.

**Files**

- `scripts/ask-cases.ts` (new): the shared fixture. `scripts/ask-eval.ts` keeps working from it.
- `scripts/ask-bench.ts` (new): capture and compare.
- `docs/perf/ask-jev/` (new): `before.json`, later `shadow.json`, `after.json`, `after-model.json`, and `report.md`. Follows the `docs/perf/` capture-folder convention.

**Fixture shape**

```ts
type AskCase = {
  id: string
  /** One entry per user turn; a multi-turn case replays the earlier replies. */
  turns: string[]
  expect: {
    /** The card the last turn must end in, or null for none (the quiet offer is not a card). */
    handoff: AskHandoffReason | null
    /** true: the reply must contain words. false: card only. */
    text: boolean
    /** Page paths that must appear in the sources. Fill from the real corpus. */
    sources?: string[]
  }
}
```

About 16 cases across six groups: the closing band's chips (answer, no card); own-project price, timeline, start date (card); "I have a project" and "can you build X for us" (card); person requests (card); questions the site cannot answer (`no_answer`); mixed questions ("how do you work, and what would mine cost?", answer then card); a follow-up that depends on the first turn ("what about for nonprofits?"); a follow-up that switches topic; a thanks. Keep the existing six cases verbatim so old and new runs line up.

**Capture** (`pnpm exec tsx scripts/ask-bench.ts capture <label> [base-url]`)

- Read the SSE stream incrementally (`res.body.getReader()`), not `await res.text()`, and record per turn: `firstOutputMs` (first `text-delta` or `tool-output-available`), `totalMs`, source URLs, answer text, card reason, HTTP status.
- Run every case 3 times; model output varies. Report medians and an agreement rate, not single runs.
- Pace requests about 7 s apart: the endpoint allows 10 per minute per IP. Send one warm-up request first and discard it (dev compiles on first hit).
- Write `docs/perf/ask-jev/<label>.json` with a header: date, git sha, base URL, `ASK_JEV` mode, answer model id, Jev model id.

**Compare** (`pnpm exec tsx scripts/ask-bench.ts compare before after`)

Prints a table and writes `report.md`:

- Per case: median time to first output, median total time, card correct (n of 3), expected sources present, reply had words when it should.
- Summary row: median time to first output, median total, card accuracy (for example 38 of 48), source accuracy, turns that skipped the writing model.
- A side-by-side of the answer texts per case, for a human read. Answer *quality* is judged by a person here; there is no model judge in this roadmap.

**Exit**: `before.json` captured against the current code on a local dev server with a production-content database, committed with the script. Record the commit sha in this document.

Local-versus-production numbers differ; the comparison is relative, same machine and same database for every label. Optionally repeat `before` and the final label against `preview.suits-sandals.com`.

### Phase 1: the judge seam, offline

Goal: Jev's questions exist, are tested, and can be tuned without a server or a visitor.

**Files**

- `src/features/ask/judge.ts` (new, server only):
  - `askJudgeMode(): 'off' | 'shadow' | 'on'` from `ASK_JEV`; always `off` without `TYPESAFE_API_KEY`.
  - A lazy `TypeSafeClient` singleton: `defaultModel` pinned, `timeout` about 400 ms (800 ms as built, see the [Build record](#build-record-2026-09-19)), `retry: { maxRetries: 0 }` (SDK defaults are 10 s per attempt with retries on 408/429/5xx, wrong for a request path). Pass `req.signal`.
  - `judgeTurn({ question, previousQuestion, signal })` and `judgePassages({ query, chunks, signal })`. Both return null (or per-chunk null) on any failure, log once at warn, never throw. A chunk whose check failed is kept: fail open.
  - `ASK_JUDGE_THRESHOLDS`: every number in one object.
  - Pure functions `routeTurn(judgment, context)` and `routePassage(answers)` that implement the two tables above.
- `src/features/ask/judge.test.ts` (new): the pure routing functions, mode parsing, null handling. No network. Note that CI runs no vitest; run `pnpm exec vitest run src/features/ask` locally.
- `scripts/ask-judge-eval.ts` (new): the tuning tool. For every fixture case, call `judgeTurn()` directly and print the probabilities beside the expectation. With `--passages`, boot Payload the way `scripts/backfill-ask-index.ts` does, retrieve candidates, run `judgePassages()`, and print per-chunk probabilities and whether expected source paths survive. With `--from-db`, replay stored `ask-questions` rows (redacted questions, recorded `handoffReason` as the label) for an agreement rate on real questions.
- `.env.example`: `TYPESAFE_API_KEY` and `ASK_JEV` with a comment.

**Exit**: thresholds chosen from the script's output, written into `ASK_JUDGE_THRESHOLDS` with the date and the model version in a comment. Fixture card accuracy from `routeTurn` alone is at least as good as the `before` capture.

### Phase 2: shadow mode

Goal: Jev runs on real traffic with zero behavior change, so its latency and agreement are known before it decides anything.

- `src/endpoints/ask.ts`: in mode `shadow`, fire `judgeTurn()` beside retrieval and `judgePassages()` after it, await neither on the response path beyond what is already awaited, and use neither result.
- Do the Phase 2 rows of the [Analytics](#analytics-the-implementing-session-owns-this) section, end to end, in this phase.
- Same fields in the existing `ask answered` log line.

**Exit**: `shadow.json` captured and matching `before.json` within noise (proves no regression). Traffic is about 80 turns a month, so shadow data accumulates slowly; the fixture and the `--from-db` replay carry the tuning, shadow proves production latency and failure rate.

### Phase 3: Jev decides (mode `on`)

Goal: the target flow above.

- `src/endpoints/ask.ts`:
  - Contact-detail check in code first.
  - `Promise.all([judgeTurn(...), embed...])`. On a follow-up, embed both query forms in one `embedMany` call and pick the vector once `depends_on_previous` is known. This needs `retrieveSources` to accept a prepared vector or the two candidate queries; keep the seam's promise that the endpoint knows nothing about *how* sources are found.
  - Apply the decision table. Card-only paths reuse `handoffResponse()`.
  - The writing model gets no `tools` and `askSystemPrompt({ grounded, handoff, tool: false })`.
  - Card after text: call `toUIMessageStream({ ..., sendFinish: false })`, forward its chunks, then write the same `tool-input-available` / `tool-output-available` pair `handoffResponse()` writes, then `finish`. Verify against `node_modules/ai/docs` and `dist/index.d.ts` (AI SDK v7); `record()` must still fire exactly once with the card's reason.
- `src/features/ask/retrieve.ts`: `judgePassages()` runs inside the embedding path, after `queryNearestChunks` and before `chunksToSources`, so sources shown to the visitor are only documents with kept chunks. Lower `MIN_SIMILARITY` only if the fixture shows the floor is cutting chunks Jev would keep; otherwise leave it as the cheap first filter. The keyword fallback path is unchanged.
- `src/features/ask/prompts.ts`: `offersAskHandoff` stays the rule for `sent`; add the explicit no-tool variant (the branches already exist for `tool = false`). Update `prompts.test.ts`.
- Low confidence or a null judgment takes today's path with the tool, unchanged.
- Analytics: the Phase 3 rows of the Analytics section (`model_skipped`, `fell_back`, their two tiles).
- README: new flow diagram, files table rows, configuration rows, a "Known limits" entry for Jev's literal reading.

**Exit**: `after.json`. Expected shape of the result: card-only and no-answer turns drop from seconds to well under one second; card accuracy rises and is stable across the 3 runs; answered turns are about level on total time (one added Jev round trip, a smaller prompt). If answered turns get slower by more than about 300 ms, investigate before shipping.

### Phase 4: a lighter writing model (in scope, decided 2026-09-19)

Goal: faster first words on answered turns. Only possible after Phase 3, because the writing model no longer needs tool calling or judgment: its whole job is to write up to 120 words from passages Jev already vetted.

Run the candidates in this order, one benchmark capture each (`after-model-<name>.json`), and stop at the first that passes:

1. `gpt-5-mini` with `reasoningEffort: 'minimal'`: one line in `src/endpoints/ask.ts` (the installed `@ai-sdk/openai` accepts `none | minimal | low | ...`). Cheapest experiment, no new model.
2. `reasoningEffort: 'none'` if the model accepts it.
3. A non-reasoning small model in `src/features/ask/model.ts`. Check the provider's current lineup at that time rather than trusting a name written here. `model.ts` is the single seam; a provider change also means the matching `@ai-sdk/*` package and `ASK_MODEL_API_KEY_VAR`. The embedding model does not change.

Re-tune `MAX_ANSWER_TOKENS` afterwards: 1,200 exists to leave headroom for hidden reasoning tokens, which a non-reasoning model does not spend.

**Pass criteria**, all of them, against `after.json`:

- Median time to first output on answered turns improves by at least 20 percent. Less than that is not worth a model change; keep `gpt-5-mini`.
- Card accuracy and source accuracy unchanged (the writing model no longer influences either; a change means a wiring bug).
- A human read of the side-by-side in `report.md` finds no invented facts, no markdown, no "sources" talk, answers within 120 words, and the partial-answer sentence still naming a real page path. Grounding slips are the disqualifier.
- `scripts/ask-eval.ts` still passes.

Analytics: the Phase 4 row of the Analytics section (`answer_model`), so production latency can be split by model after the switch.

**Exit**: the winning capture renamed `after-model.json`, `report.md` regenerated across `before`, `after`, `after-model`, and the README's model line updated. Rollback is reverting `model.ts` and the one `providerOptions` line.

### Analytics (the implementing session owns this)

Miles does none of this by hand. The session that builds each phase loads the **`posthog-analytics`** skill first and follows it end to end: code, registry, verification, dashboard. The PostHog MCP server (project 512227) must be connected in that session; its tools only load in a new session, so check with `/mcp` before starting Phase 2.

**Reuse `ask_questioned`, add properties.** The skill's rule is to extend an existing event before inventing a near-duplicate, and every one of these is a fact about a turn. No new event is planned. Metadata only: never question text, never probabilities tied to text.

| Property | Type | Meaning | Added in |
|---|---|---|---|
| `judge_mode` | `off` / `shadow` / `on` | The mode the turn ran under | Phase 2 |
| `judge_ms` | number, null | Wall time of `judgeTurn()`; null when it did not run | Phase 2 |
| `judge_failed` | boolean | Jev was asked and returned nothing (timeout, 429, error) | Phase 2 |
| `judge_request` | string, null | The `request` Choice's pick | Phase 2 |
| `judge_confidence` | number, null | That Choice's confidence | Phase 2 |
| `judge_agrees` | boolean, null | Shadow only: Jev's card decision equals the writing model's | Phase 2 |
| `chunks_candidates`, `chunks_kept` | number | Before and after the passage check | Phase 2 |
| `passages_ms` | number, null | Wall time of `judgePassages()` | Phase 2 |
| `first_output_ms` | number, null | Server time to the first text or card chunk. `latency_ms` only measures stream finish, which hides the gain visitors feel | Phase 2 |
| `model_skipped` | boolean | The turn was answered with no writing-model call | Phase 3 |
| `fell_back` | boolean | Mode `on`, but the turn took today's path (low confidence or Jev failure) | Phase 3 |
| `answer_model` | string, null | The writing model's id; null when skipped | Phase 4 |

**Steps, per phase that adds properties**

1. Add the properties to the `captureServerEvent` call in `record()` (`src/endpoints/ask.ts`). Existing properties keep their names: renaming breaks every insight built on them.
2. Update the `ask_questioned` row of the Event registry in `.agents/skills/posthog-analytics/SKILL.md` in the same change.
3. Verify the way the skill says: a preview deploy (always captures, `environment = preview`), or locally with `NEXT_PUBLIC_POSTHOG_CAPTURE_DEV=true`. Confirm the new properties arrive with `read-data-schema` (`event_properties` for `ask_questioned`) over the PostHog MCP. Make sure the browser is not marked internal.
4. Update the feature README's "Metadata only in PostHog" paragraph.

**Dashboard tiles** on the existing **Ask** dashboard (tag `sas-analytics`), built over the PostHog MCP in Phase 2 and extended in Phases 3 and 4. Follow the skill's rules: tiles filter `environment = production`, internal-user filters use exclusive operators only, pass a date range override to dodge cached results, and ask Miles before touching project settings.

| Tile | Reads | Phase |
|---|---|---|
| Time to first output, p50 and p90, by `judge_mode` | `first_output_ms` | 2 |
| Total latency, p50 and p90, by `judge_mode` | `latency_ms` | 2 |
| Jev agreement rate (shadow) | `judge_agrees` | 2 |
| Jev failure rate and p90 `judge_ms` | `judge_failed`, `judge_ms` | 2 |
| Passages kept per turn | `chunks_kept` / `chunks_candidates` | 2 |
| Share of turns with no writing-model call | `model_skipped` | 3 |
| Fallback rate in mode `on` | `fell_back` | 3 |
| Time to first output by writing model | `first_output_ms` by `answer_model` | 4 |

These tiles are the production half of the before-and-after story; `scripts/ask-bench.ts` is the controlled half. At about 80 turns a month the tiles fill slowly, so read them over weeks, not days.

### Rollout and rollback

`ASK_JEV` is the switch: `off` is today's code path byte for byte, `shadow` observes, `on` decides. Rollback is an env change and a redeploy, no code revert. Production order: `shadow` for a week or 30 turns, then `on`. Site Info › Ask › Hide Ask remains the feature-level off switch.

## Build record (2026-09-19)

Everything below was measured on one laptop against the local dev server (`next dev`) and a workspace database cloned from production content (370 chunks, 38 documents). Numbers are relative, as the plan said; production will differ, mostly in the round trip to TypeSafe.

### Phase 0

`before.json` captured at commit `7921850`, before any Ask code changed. The fixture grew to 19 cases (the six original eval cases verbatim, then the live closing-band chips, own timeline and start date, a bare project, a named project, a call request, contact details, a no-answer, the mixed question, two follow-ups and a thanks). `expect.text` is optional: omitted means either is right ("What does it cost?").

What the baseline showed: 52 of 57 cards right, 49 of 57 turns with words exactly when expected. The known flaw is real and total: the mixed question ("How do you work, and what would my project cost?") got the card with no words on 3 of 3 runs, and so did the "Can you fix my Webflow site?" chip. "What does it cost?" got `no_answer` on 3 of 3 (nothing cleared the 0.3 floor). "How do we start?" drew a stray `project` card once, and the dependent follow-up ended in `no_answer` once with four good sources in hand.

### Phase 1

`request` was right on 19 of 19 cases at the first wording. Two drafts changed, both recorded under [Questions as built](#questions-as-built-2026-09-19-jev-1130): `only_a_person` became three literal Nouls, and `depends_on_previous` was reworded (the draft put a topic switch at 0.52, above a 0.5 threshold). After that, `routeTurn` alone agrees with the fixture on 19 of 19. `--from-db` is built but found nothing to replay: the local database holds no `ask-questions` rows, and production's were left alone (open decision 2).

### Phase 2

`shadow.json` matches `before.json` within noise (52 of 57 cards both, median first output 2,950 ms against 3,177 ms), so shadow mode changes nothing a visitor sees. What it measured changed the plan:

- **The 400 ms timeout was wrong.** Over 68 shadow turns a judgment took 130 to 400 ms (p50 352 ms), so 12 of 68 timed out, and 43 of 62 passage batches lost at least one passage (a batch is as slow as its slowest request; p50 403 ms, the timeout itself). Connections are cold on every turn here, as they will be in production at 80 turns a month. `ASK_JUDGE_TIMEOUT_MS` is now 800: over the 57 turns of the `after` capture, no judgment failed and one batch lost passages.
- **Agreement.** Jev's card matched the writing model's on 48 of 56 turns. All eight misses were turns the writing-model path ended in `no_answer`: three were "What does it cost?" (the floor, fixed in Phase 3), two were the dependent follow-up the model gave up on with good sources, and three were a gap in the agreement calculation itself (an evidence route with nothing retrieved is a `no_answer` card too), fixed before Phase 3. On the fixture's own expectations Jev was right in every one.

### Phase 3

`after.json`, judge `on`, against `before.json`:

| Metric | before | after |
|---|---|---|
| Card accuracy | 52 of 57 | 57 of 57 |
| Words when expected, none when not | 49 of 57 | 56 of 57 |
| Cases with the same card on every run | 17 of 19 | 19 of 19 |
| Turns with no writing-model call | 6 of 57 | 23 of 57 |
| Median time to first output, card-only turns | 2,669 ms | 365 ms |
| Median time to first output, turns that must have words | 3,490 ms | 4,655 ms |

The shape is the one predicted: card-only turns fall from seconds to well under one (own price 466 ms, a person 391 ms, contact details 17 ms with no Jev call at all), card accuracy rises and is stable, and the partial answer now lands every time because code writes the card after the text. The one miss: "When could you start on our project?" answered and then showed its card once in three, because its `own_project` sits at 0.73 to 0.76 and the threshold was 0.7. The threshold is 0.6 since (after this capture), in the gap the eval shows between 0.41 and 0.73.

Answered turns are slower, and by more than the 300 ms the plan said to investigate. Two causes, read off the server log. The judge adds about 450 ms here: the passage check is a serial round trip that took 340 to 660 ms (p50 about 430 ms), not the 100 to 250 ms assumed, and the turn judgment (290 to 520 ms) often outlasts the embedding call it runs beside. The rest is the writing model's own variance: `gpt-5-mini` at `low` ranged from 2.8 to 14 s to first word within this one capture, and the hour it ran in was slower than the `before` hour on cases the judge does not touch. Over the 57 turns no judgment failed and no passage check timed out at 800 ms. Two things take the judge's share back: a data-center round trip to TypeSafe should be shorter than a laptop's (measure on preview once the key is in Vercel), and the passage check could start as soon as the query is embedded instead of after the route is known (a first turn has one query form), left as a later optimization. Phase 4 is the larger lever, and the reason this phase could ship slower: it is what makes a lighter writing model possible.

With a card following, the prompt tells the model to end with the answer, and in this capture it did: none of the 12 partial answers (webflow, build-x, mixed, cost-general, three runs each) closes with an invitation or mentions the offer.

Departures from the plan, all small: the similarity floor drops to 0.2 when the passage check runs (measured, see above); a card with no retrieval behind it records `chat_only`, which is what `askOutcome()` says of a reply with no sources (it was `partial` when the model decided after retrieving); `retrieveSources` stayed as the one-query shorthand over a new `prepareRetrieval`; and once the visitor has sent, a turn Jev would have carded takes the judge-off path, where the model is told not to offer.

A trap for whoever benchmarks next: against `next dev`, Payload keeps endpoint code across hot reloads, so an edit to the endpoint or its prompts is not live until the server reloads (any change to `.env` does it). One capture here measured old code and was thrown away. Prove the new code answers before capturing.

### Phase 4

Candidate 1 passed, so the order stopped there: `gpt-5-mini` with `reasoningEffort: 'minimal'`, on routed turns only. A turn that falls back still decides with the tool, so it keeps `low`, and mode `off` is untouched. Captured as `after-model.json`, against `after.json`:

| Metric | before | after | after-model |
|---|---|---|---|
| Median time to first output, turns that must have words | 3,490 ms | 4,655 ms | 1,542 ms |
| Median total time, turns that must have words | 3,974 ms | 5,320 ms | 2,569 ms |
| Median time to first output, all turns | 3,177 ms | 3,408 ms | 1,355 ms |
| Card accuracy | 52 of 57 | 57 of 57 | 57 of 57 |
| Words when expected, none when not | 49 of 57 | 56 of 57 | 57 of 57 |
| Expected sources present | 3 of 3 | 3 of 3 | 3 of 3 |

Against the pass criteria: time to first output on answered turns improved 67 percent over `after` (the bar was 20), and 56 percent over `before`, judge round trips included; card and source accuracy are unchanged; `scripts/ask-eval.ts` passes 6 of 6. A direct call confirms where the time went: `low` spends about 64 hidden reasoning tokens and 2.4 to 2.9 s before the first word on a short prompt, `minimal` spends none and starts in about 0.6 s.

The read of the side-by-side (`report.md`), done by the building session and still owed a human pass: all 33 answers are under 120 words (the longest 99), none uses markdown, every page path named is a real page, and the facts match the `low` answers (the same client names, the same cost factors, the same two-business-day reply the Project Inquiry page publishes). No invented fact was found. What `minimal` costs is polish, not grounding: it is more formulaic ("If you want X, we don't publish that here"), it is terser on the dependent follow-up (it says the results are not published and points to `/works/interchecks`, where `low` also described the deliverables), and when the next step is the homepage it writes the chunk's heading trail beside the path ("see / (Home > Our work in)"; `low` does a milder version of the same, and a prompt line against it changed nothing at `minimal`, so it was not shipped). If that trade is wrong, rollback is one value: `REASONING_EFFORT.writing` in `src/endpoints/ask.ts`.

`MAX_ANSWER_TOKENS` was re-tuned as planned: routed turns spend no reasoning tokens (43 answers: 180 output tokens at most, 115 at the median), so they run under `MAX_WRITING_TOKENS = 400`; 1,200 stays for the path where the model still reasons. Candidates 2 and 3 were not run. For whoever reopens this: `gpt-5-mini` does not take `none`, and the lineup on 2026-09-19 has `gpt-5.4-mini` and `gpt-5.4-nano`, which do (about 0.4 to 0.6 s to first word in the same direct call), and `gpt-4.1-mini` (0.8 to 0.95 s).

### Analytics: what is done and what is owed

Done: the thirteen properties are on `ask_questioned` (Phases 2, 3 and 4 together), the `posthog-analytics` skill's registry defines each, the feature README's PostHog paragraph names them, and the same object is written to the `ask answered` log line, where every value in this record was read from. They were checked there in all three modes.

Owed, because the PostHog MCP server was not connected in the building session (its tools only load at session start): confirming with `read-data-schema` that the properties arrive in PostHog (a preview deploy captures with `environment = preview`), and building the eight tiles on the **Ask** dashboard. The tile table above is the spec. A session started with the PostHog MCP connected can do both in one pass.

### Still owed before the judge decides anything in production

The ordered list, with commands and done-when checks, is [Next steps](#next-steps) at the top of this document. In short: the key in Vercel (it was not there on 2026-09-19), a preview baseline and then `on` for preview, the human read of the answers, TypeSafe on the privacy page, production `shadow` and then `on`, and the PostHog schema check and tiles.

## One session and the journey (built 2026-09-19)

Asked for after Phases 0 to 4: the three surfaces were three conversations, and a question arrived with no idea where the visitor was or what they had read. Reference: the feature README's "One session, and the journey". This section is the record of what was tried.

**One session.** `AskSessionProvider` in the root providers holds one AI SDK `Chat`; `useAskChat` reads it on every surface (`useChat({ chat })`), and keeps a private chat only for a scripted surface (stories, tests). Checked in a headless browser: a question typed in the closing band on `/works/interchecks` was on the menu's transcript, and the follow-up sent from the menu carried the same chat id with three messages. This half ships in every mode, `off` included.

**The journey, and what Jev is asked.** The session records path, visible seconds and scroll depth per page, in memory only, and sends it beside each question. The endpoint resolves paths to titles from the Ask index, so no client words reach a prompt. Read only in `shadow` and `on`.

| Tried | Result | Kept |
|---|---|---|
| Probe: journey digest in the state, four questions (page reference, which page, interest, stage) | All four read sensibly on invented titles, about 850 input tokens and 180 to 380 ms a request, $0.0003 for eight | The feasibility answer: yes |
| `about_page` Noul with `current_page` in the state, real titles | Yes cases 0.35 to 0.87, no cases up to 0.64: no usable threshold. A terse title ("Interchecks", "Work") tells Jev too little to judge fit | No |
| Split in two literal Nouls: `open_reference` (question alone) and `fits_page` | `open_reference` 0.95 to 0.97 on leaning questions, 0.51 or less on the rest; `fits_page` 0.58 to 0.82 against up to 0.72, useless | `open_reference` only, and the page stays out of Jev's state, so no other answer can move (fixture replayed: 19 of 19) |
| Page query form "{title}\n{question}" | The passage check kept 0 of 12 for "What results did it get?" | No |
| Page query form "About {title}: {question}" | Kept the case study's results section (relevant 0.71, evidence 0.85) | Yes (`pageRetrievalQuery`) |
| Page form instead of the plain form | "What does it cost?" reads 0.96 on `open_reference` (the idiom), and under "About Interchecks:" every pricing chunk was dropped | No: the page form is searched beside the plain one and the kept chunks are pooled (`also` in `prepareRetrieval().search`) |

`scripts/ask-judge-eval.ts --journey --passages`: `open_reference` agrees on 13 of 13 `ASK_JOURNEY_CASES`, every expected page is kept, and the turn fixture with the question added still routes 19 of 19. Live, mode `on`: "What did you do for them?" answered about GentleBeast from `/bench` and about Interchecks from `/works/interchecks`; "What does it cost?" on that page still answered from the FAQ and showed the `estimate` card; "What is your process like?" stayed general.

The prompt note went through two edits from live reads: the model named the page in an unrelated answer ("We don't publish a timeline on the Interchecks page"), so the note now says a question that names its own subject is not about the page; it offered the page as a next step, so the path was taken out of the note.

**By hand**, judge `on`: open a case study, ask "What did you do for them?" in the closing band (the answer is about that client, its page leads the sources, and the log line says `page_attached: true`), open the menu and focus its Ask box (the same exchange is there), ask "What does it cost?" from the menu (pricing answer, `estimate` card), then "New conversation" in the menu and scroll back to the band (its transcript is empty too).

**Not built, and why.** Each needs a decision from Miles or a migration, and none blocks the above:

- *Interest and buying stage.* The probe says Jev can score both from the pages read. Nothing in code yet has a use for the answer that is safe to automate: changing which card a visitor gets by how many pages they read would undo thresholds tuned on the fixture. The writing model already gets the pages read, for free, inside a call that was being paid for. First use worth building: record stage in `shadow` and compare it with who sent an inquiry.
- *The journey on the inquiry.* "Read Interchecks and Website Strategy before writing in" is worth more to the team than to the model. Needs a field on `inquiries` (additive: **create** if `migrate:create` asks).
- *Chips chosen by page.* The closing band's three chips are hardcoded; a case study could offer "What did you do for {client}?". No tokens at all, but it is copy, so it is Miles's call.
- *A transcript that survives a reload.* sessionStorage, the visitor's own words only. The journey should stay memory only.
- *Privacy page.* The journey is first-party, in memory, unidentified and unstored, but the page that lists TypeSafe (open decision 2) should say Ask reads which pages the visit has covered when a question is asked.

## Risks

| Risk | Guard |
|---|---|
| Jev misreads intent and a buyer gets no card, or a browser gets one | Conservative `T_act`; low confidence falls back to today's path; the quiet offer still closes every answer, so a way to a person is never absent |
| Passage check drops the one useful chunk | Fail open per chunk; fixture `sources` expectations catch it; thresholds tuned on the real corpus |
| TypeSafe rate limits shift (their docs warn of it) or the API is down | 400 ms timeout, no retries, null → today's path. Shadow mode measures the failure rate first |
| `jev-latest` moves and thresholds drift | Pin the version; re-run `ask-judge-eval.ts` before bumping |
| Visitor text reaches a new processor | Redacted before sending; privacy page updated (open decision 2) |
| Fallow dead-code gate | Every new export is used by the endpoint, a test, or a script; check `.fallowrc.jsonc` treats `scripts/` as entry points |

## Later (needs a migration, ask first)

- **Groundedness flag.** After the stream, in `record()`, ask Jev whether the answer's claims are supported by the kept passages; store on the `ask-questions` row; add an admin filter. One new field.
- **Store the judgment on the row** (request, probabilities, chunks kept) so the admin's reading room shows why a turn went where it went. One new group field.
- **Auto topic.** A Choice over the site's categories fills the triage `topic`.
- **Semantic answer cache** (RAG roadmap stage 5). Nearest stored question by cosine, then a Jev Noul "do these two questions ask for the same thing?" before serving a stored answer. Invalidate on index sync. Biggest win for the closing band's chips.

### migrate:create prompt answers

Phases 0 to 4 change no Payload schema: no migration and no prompts expected. Each "Later" item is additive (new fields on `ask-questions`), so **create** for every prompt if one appears.

## Reference

- TypeSafe docs index: `https://docs.typesafe.ai/llms.txt` (append `.md` to any page path).
- Read before coding: `concepts/how-to-build-with-system-one`, `primitives/choice`, `primitives/noul`, `confidence`, `patterns/fan-out`, `cookbooks/classifying_rag_passages`, `cookbooks/skill_suggestion` (Choice plus Noul on the same shortlist), `model-jaggedness/jev-1.13`, `sdk/javascript`.
- Pricing and limits at time of writing: $0.042 per million input tokens, output free, 1,200 requests per minute, 64k tokens per request.
