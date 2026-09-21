# TypeSafe + the sas-cms MCP: review and roadmap

Status: **review only, 2026-09-21**. Nothing here is built. No repo code changed in the review session. This document is the record of the review, the ranked opportunities, and the process behind it, kept so the work can later be written up as a Lab Project.

Written to be picked up cold by a later session. Before writing any Jev call, load the `typesafe:typesafe-ai` skill and read the live TypeSafe docs it points to: they are the source of truth for the SDK and question wording. Companion reading: [mcp.md](mcp.md), [ask-jev-roadmap.md](ask-jev-roadmap.md), the [Ask README](../src/features/ask/README.md).

## The prompt that started it

Sent by Miles on 2026-09-21 in Claude Code (VS Code extension), through the TypeSafe plugin's skill command:

> /typesafe:typesafe-ai review my sas cms mcp and find opportunities where typesafe ai can speed up workflow, improve accuracy, reduce errors, and most importantly above all reduce usage on claude or openai api usage.

The follow-up that produced this file:

> create md of your findings and at the top include my initial prompt - this feature work will be turned into a lab project entry on my site and i want to document my process as well as work with you including token usage and model used on all sessions related to this feature.

## The main finding

The largest Claude savings on the MCP come from ordinary code, not from Jev. Jev earns its place where a tool needs semantic selection: picking the block an instruction means, finding where the site talks about something, matching a loose name to a taxonomy term, checking a claim against its evidence.

The facts behind that:

- **What an authoring task costs today.** A `find*` call returns the whole document. Earlier authoring sessions measured those dumps at 100 to 250KB, roughly 25 to 60K Claude input tokens per read. An `update*` call resends the whole `layout`, as Claude **output** tokens, which is the expensive side. A refused save repeats the send.
- **`select` cannot narrow it.** `select` on blocks nested in a Section returns schema defaults rather than stored values (found 2026-09-21 in an authoring session), so whole-document reads are forced.
- **OpenAI on Ask is already small.** About 80 turns a month, and the Jev judge already routes turns, skips the writing model on card-only turns, and vets passages. The bill is cents.
- **Jev is nearly free by comparison.** `jev-1.13.0` costs $0.042 per million input tokens, output is free, 64K context per request with 32K for state, 1,200 requests a minute (TypeSafe models page, read 2026-09-21). One judgment over a full 32K-token state is about $0.0013. A Choice takes up to 255 options and a Score up to 10 levels.
- **The plugin has the seam.** `@payloadcms/plugin-mcp` accepts custom tools through `mcp.tools`: a name, a description, zod `parameters`, and a handler that receives `(args, req)`. Every tool below would be one of those, running the Local API with `overrideAccess: false` and the key's user, like the generated tools. **Not checked:** whether a custom tool gets a per-key capability checkbox. Verify before building; a tool every key can call is not acceptable for anything that reads visitor records.

## Opportunities, ranked by Claude and OpenAI tokens saved

### Tier 1: cut the Claude tokens spent on authoring

**1. `outlineDocument`, `getBlock`, `patchBlock` (code), plus `locateBlock` (Jev).**

- Today: finding one FAQ means reading a 200KB page, and changing it means resending the whole layout.
- Code part:
  - `outlineDocument` returns one row per block: `{id, blockType, blockName, path, first 200 characters}`.
  - `getBlock` returns one block by id.
  - `patchBlock` merges one block by `id` on the server and saves as a draft. It also shrinks the refused-save loop: a retry resends one block, not the page.
- Jev part: `locateBlock({collection, id, instruction})`. Code walks the layout into candidates, and one Jev request picks the block the instruction means: a Choice over block ids with a `none` option, or a Score per block when several may match. This is the shape of TypeSafe's line-by-line search cookbook.
- Expected saving: more than 90 percent of the tokens of a typical single-block edit. This is an estimate from the dump sizes above, not a measurement. Phase 0 of any build should capture a baseline first, as `scripts/ask-bench.ts` did for Ask.

**2. `locateContent`: semantic find across collections.**

- Reuses `prepareRetrieval` ([retrieve.ts](../src/features/ask/retrieve.ts)) and `judgePassages` ([judge.ts](../src/features/ask/judge.ts)), both already built and tuned for Ask.
- "Where do we mention Webflow pricing?" comes back as at most 10 rows of `{collection, id, title, headingPath, snippet}` instead of several full collection dumps.
- Limit: `ask_embeddings` holds published content only. Drafts need a fallback: `extractDocMarkdown` over the draft, chunked, then the same Jev passage check with no vector step.

**3. `resolveRefs`: names to ids.**

- Today an agent calls `findOrganizations`, `findCapabilities`, `findIndustries`, `findPlatforms` and `findContactPages`, and each returns full documents, to learn a handful of ids.
- Code part: exact and case-insensitive matching settles most names. Exact lookups stay in code.
- Jev part: only the misses, as a Choice over the vocabulary's titles plus `none` (the entity-alignment pattern). "non-profits" resolves to the Industries term Nonprofit.
- The same tool can suggest taxonomy terms for a new document: one Noul per term over the document's text, all in one request, since the vocabularies are small.

**4. `pickMedia`: a brief to the top five media ids.**

- Code filters by asset library, organization, project and `usageStatus`.
- Jev scores each candidate over `{title, alt, caption, description, purpose}`, one request per candidate in parallel (the passage-check pattern: a large state full of unrelated text costs Jev accuracy).
- Returns ids and alt text only, so the agent stops paging through `findMedia`.

### Tier 2: store judgments as data

**5. Classify visitor records when they are written.**

- **Ask questions.** `judgeTurn` already computes the request kind on every turn. It goes only to PostHog (`judge_request`); [questions.ts](../src/features/ask/questions.ts) stores none of it on the row. Storing it costs no extra Jev call, and an agent can then filter by intent without reading text.
- Two more judgments per question: a Choice for `topic` over Categories (the triage field filled by hand today, so this would be a suggestion beside it, not a replacement), and a Noul for whether the gap is worth writing content for.
- **Inquiries.** A Noul for solicitation (human-sent vendor pitches pass the honeypots and BotID), a Choice for fit, a Score for urgency.
- Result: the agent queries by filter and counts rows instead of pulling visitor text into Claude. That saves tokens and keeps contact details out of Claude's context. [mcp.md](mcp.md) says plainly that the PII rule is an instruction, not an enforced check.
- Cost: a few cents a month at this volume. It adds fields, so it needs a migration.

### Tier 3: accuracy checks on MCP writes

**6. A `reviewDraft` tool, or a `beforeChange` hook that acts only when `req.payloadAPI === 'MCP'`.**

- Roll out warn-only, and tune thresholds on a fixture the way `scripts/ask-judge-eval.ts` does for the judge.
- Code checks: an em dash regex, and the email and phone rules [redact.ts](../src/features/ask/redact.ts) already has. These would enforce rules that are only written instructions today.
- Jev claim check (the citation-check cookbook): code pulls sentences containing numbers from case-study and work-page copy; one Noul per sentence asks whether the case study's `approvedClaims` or its `approvedForPublic` metrics support it. Unsupported sentences come back with their path. This catches an invented metric before a person reviews the draft.
- Jev check on a figure's `textAlternative`: two Nouls against the spec, whether it says what the figure shows and whether it states the takeaway (the article-authoring skill's own rule).
- Jev check on copy: a Noul for whether it names a private individual from the visitor records.

### Tier 4: OpenAI on Ask (small bill, low priority)

**7. Serve FAQ answers verbatim.** When a kept passage is a published `faq` item and `has_evidence` is high, stream the published answer and skip `gpt-5-mini`: one fewer writing call, no chance of a made-up answer, a faster reply. Missing piece: mapping a chunk back to its FAQ item. [extract.ts](../src/shared/content/extract.ts) walks blocks generically and has no FAQ handling today.

**8. A grounding flag after the answer streams.** One Noul per answer sentence against the kept chunks, written as `grounded` on the row. Better triage, no money saved.

**9. An answer cache** (open in stage 5 of the Ask README). Jev would judge whether a new question matches a cached one among its nearest neighbours. Skip until traffic grows: 80 turns a month gives almost no hits.

### Not worth doing

- Jev routing across the MCP's tools (about 100 with a fully granted key): Claude Code already defers their schemas until needed.
- Jev for em dashes, slugs or exact ids: code.
- Jev for SEO copy or alt text: it cannot write.

## Privacy

- Inquiry text to TypeSafe is a new PII flow. Redact first, and the Privacy Policy (Pages id 8, sections 6 and 7) would need updating before it ships.
- Draft client copy to TypeSafe means unpublished material leaves the workspace. Check client NDAs first. `locateBlock`, `reviewDraft` and the draft fallback of `locateContent` all touch drafts.
- Published content and redacted Ask questions are already covered by the current policy.
- TypeSafe does not train on requests; zero retention is an enterprise plan (from the Ask + Jev work, not re-checked in this review).

## Recommended order

1. The three code tools of idea 1. Largest saving, no new processor, no privacy question.
2. `locateBlock` and `locateContent`, which reuse the Ask retrieval and judge code.
3. Store the Ask judgment on each row: no new Jev call.
4. The claim check: the best accuracy gain.

Each step should start with a baseline capture (tokens per task on a fixed set of authoring tasks) so the Lab Project can report measured before and after numbers, not estimates.

## Process record

How the review session worked, in order, for the write-up.

1. **Skill first.** The `/typesafe:typesafe-ai` command loaded the TypeSafe skill, which sets the method: start from the behaviour wanted, work back to the judgments, keep rules and exact lookups in code, read the live docs.
2. **Context from memory.** Claude read two of its own project notes before any code: the Ask + Jev roadmap note and the MCP internal-authoring note. They supplied the dump sizes, the nested `select` bug, the 2,048-character instruction cap and the production-pointing MCP.
3. **Live docs.** The TypeSafe docs index (`llms.txt`), then the models page (price, context, rate limits) and the HTTP API page (255 options per Choice, 10 Score levels).
4. **Code read directly, no subagents.** [src/plugins/mcp.ts](../src/plugins/mcp.ts), [mcp.md](mcp.md), [judge.ts](../src/features/ask/judge.ts), the [Ask README](../src/features/ask/README.md), the article-authoring skill, and the segment-page authoring note.
5. **Targeted checks for each claim.**
   - The plugin's `types.d.ts`, to confirm `mcp.tools` exists and its handler receives `req`.
   - `questions.ts` and `AskQuestions.ts`, to confirm the judge's verdict is not stored on the row.
   - `Inquiries/index.ts` and [inquiries.md](inquiries.md), for the triage fields and the three spam layers.
   - `CaseStudies/index.ts`, for `approvedClaims` and `approvedForPublic`.
   - `Media.ts`, for the text fields a media pick could score.
   - `extract.ts`, for FAQ handling (none).
6. **A correction along the way.** A project note described an AI plugin in `src/plugins/ai`. The directory was gone: commit `287d0fb` removed the plugin on 2026-09-06. Claude deleted the stale note, and the review dropped the idea of replacing that plugin's generation calls.
7. **What was not verified.** Per-key gating of custom tools; the 90 percent saving (an estimate); media and inquiry volumes; whether FAQ chunks can be mapped back to their items.

What Miles decided and what Claude decided: Miles set the goal and its priority (reduce Claude and OpenAI usage above all). Claude chose the ranking, and chose to report that the top saving needs no model at all rather than fit every idea to Jev.

## Session log

Moved to the feature's lab journal, [lab-journal/typesafe-mcp/](lab-journal/typesafe-mcp/): `journal.md` holds the decisions, challenges, insights and measurements as they happened, `sessions.jsonl` one row per session with its model and token counts (written by a hook from the session transcript, subagents included), `jev.jsonl` Jev's usage. `pnpm lab:journal status` prints the totals. How the journal works: the `lab-journal` skill (`.agents/skills/lab-journal/SKILL.md`).

The session that produced this review went on to build the lab journal tooling, which is a separate feature with its own journal, [lab-journal/lab-journal/](lab-journal/lab-journal/). This feature's share of that session ends at 16:33 UTC.

What the counts leave out: `WebFetch` summarises a page with a small model inside the tool, and those tokens are not in a transcript; sessions in Codex or Cursor's own agent are not captured.
