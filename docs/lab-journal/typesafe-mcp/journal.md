# Lab journal: TypeSafe tools for the sas-cms MCP

Kept while the feature is built, newest entry last. How entries are written: `.agents/skills/lab-journal/SKILL.md`. Token usage per session is in `sessions.jsonl`; prompts stay outside the repository.

## 2026-09-21 16:45 UTC | note | Where this started

Miles asked, through the TypeSafe plugin's skill command, for a review of the sas-cms MCP server: where TypeSafe's Jev model could speed up authoring, improve accuracy, reduce errors and, above all, reduce Claude and OpenAI API usage. The review and its ranked list are in docs/typesafe-mcp-roadmap.md. Nothing in the MCP was changed in this session. The second half of the session built the lab journal itself, so that this feature and later ones are documented as they are built.

<!-- session: b7777b4e-b883-4269-88eb-e1738d94a25f, branch: main -->

## 2026-09-21 16:45 UTC | insight | An MCP edit is paid for in output tokens

Earlier authoring sessions measured `find*` results at 100 to 250KB, roughly 25 to 60K Claude input tokens per read, because the generated tools return whole documents. `update*` resends the whole `layout` as output tokens, the expensive side, and a refused save sends it again. `select` cannot narrow a read: on blocks nested in a Section it returns schema defaults, not stored values. OpenAI spend on Ask is cents by comparison: about 80 turns a month, already routed by Jev.

<!-- session: b7777b4e-b883-4269-88eb-e1738d94a25f, branch: main -->

## 2026-09-21 16:45 UTC | decision | Rank plain code above Jev where code is enough

Claude's call, reported to Miles. The brief was to find uses for TypeSafe, and the honest finding is that the largest saving needs no model: an outline tool, a get-one-block tool and a patch-one-block tool. Estimated at more than 90 percent of the tokens of a single-block edit; an estimate from dump sizes, not yet measured.
Jev is kept for what needs meaning: picking the block an instruction refers to, finding where the site discusses something, matching a loose name to a taxonomy term, checking a claim against its evidence.
Rejected: fitting every idea to Jev. Exact lookups and regex rules (em dashes, ids, email shapes) stay in code, as TypeSafe's own guidance says.

<!-- session: b7777b4e-b883-4269-88eb-e1738d94a25f, branch: main -->

## 2026-09-21 16:45 UTC | insight | A judgment already paid for was being thrown away

Ask's judge classifies every visitor turn (information, estimate, project, person, conversation, other). That verdict goes to PostHog only; src/features/ask/questions.ts stores none of it on the ask-questions row. Storing it costs no new Jev call and lets an agent filter questions by intent without reading visitor text. Verified by reading questions.ts and the collection's fields.

<!-- session: b7777b4e-b883-4269-88eb-e1738d94a25f, branch: main -->

## 2026-09-21 16:45 UTC | challenge | A stale memory note pointed at a plugin that no longer exists

Claude's project notes described an AI plugin in src/plugins/ai. The directory was missing. `git log` showed commit 287d0fb removed the plugin on 2026-09-06. The note was deleted and the review dropped the idea of replacing that plugin's generation calls. Cost: a few minutes. Lesson already in the notes' own rules: check that a named file exists before building on it.

<!-- session: b7777b4e-b883-4269-88eb-e1738d94a25f, branch: main -->

## 2026-09-21 17:31 UTC | note | This journal was split: the journaling system has its own

The first version of this journal also held seven entries about building the lab journal tooling, because one session did both things and Claude filed them together. Miles pointed out they are different features. Those entries moved, unchanged, to docs/lab-journal/lab-journal/, and this journal's share of that session now ends at 16:33 UTC, when the conversation turned to the journaling system. The first entry's last sentence refers to that work; read it as a pointer to the other journal.

<!-- session: b7777b4e-b883-4269-88eb-e1738d94a25f, branch: main -->

## 2026-09-21 17:31 UTC | milestone | Review done, nothing built yet

Exists: docs/typesafe-mcp-roadmap.md, a ranked list of nine opportunities with a build order. No MCP code has changed.
Next: a feature branch in a Conductor workspace, then the roadmap's first step, the outline, get-block and patch-block tools, starting with a baseline capture of Claude tokens per authoring task on a fixed set of tasks, so the write-up can report measured before and after numbers.

<!-- session: b7777b4e-b883-4269-88eb-e1738d94a25f, branch: main -->

## 2026-09-21 23:03 UTC | note | Work moved to a Conductor workspace

The journal was paused on main after the review. It is resumed in the Conductor workspace kampala, on the feature branch resume-typesafe-mcp-journal, so sessions and prompts on this branch are captured again. The prompt hook was checked: this session's first prompt landed in the private prompts file.
State on pickup: docs/typesafe-mcp-roadmap.md is the plan, no MCP code has changed. The next step is still the roadmap's first: a baseline capture of Claude tokens per authoring task, then the outline, get-block and patch-block tools. Miles gives the next steps from here.

<!-- session: 4ad25f66-d8cd-4f8d-ad48-53462d601df6, branch: resume-typesafe-mcp-journal -->

## 2026-09-21 23:36 UTC | measurement | The MCP tool list is 1.65MB, and the schemas are the weight

Miles asked whether team members on Codex and Cursor get the roadmap's savings too. To answer, Claude probed production's tools/list with the key Claude Code uses (all capabilities on), with a small script in .context/mcp-tools-size.ts: initialize, then tools/list, then JSON byte counts per tool.
107 tools, 1,654,849 bytes, about 414K tokens at 4 characters a token. Descriptions are 40 to 120 characters each; the input schemas are the weight. updateWorkPages is 131KB, createWorkPages 131KB, updateLabPages 121KB, updatePages 120KB, updatePosts 97KB, updateHome 49KB. By verb: update 828KB, create 744KB, find 51KB, delete 32KB. The server instructions are 2,022 characters, under Claude Code's 2,048 cut.
Compared against: nothing yet. Claude Code defers these schemas behind ToolSearch, so it pays for a schema only when a tool is first loaded (updatePages alone is about 30K tokens). What Codex and Cursor do with a 1.65MB tool list is not documented (Codex and Cursor MCP docs read 2026-09-21): to be measured in each client. A team member's key has fewer capabilities, so a smaller list.

<!-- session: f039e154-6ad4-49fd-8f41-f636a96b5826, branch: resume-typesafe-mcp-journal -->

## 2026-09-21 23:36 UTC | insight | Server-side tools are client-agnostic; schemas are not

Every roadmap item runs inside the Payload MCP plugin on the site, so whichever client calls it (Claude Code, Codex, Cursor) gets the same smaller results, and any Jev call is billed to TypeSafe on the server, never to the client's model. The token saving per authoring task, the accuracy of a Jev-picked block and the server-side rule checks all reach every team member without a client change.
Two things do not travel: the server instructions (Codex reads them and its docs say to keep the first 512 characters self-contained; Cursor's handling is undocumented; Claude Code cuts at 2,048), and the tool schemas, which a client that loads every schema each turn pays for before any tool is called. That makes the size of the tool surface a second, client-dependent cost the review had scored as "not worth doing" because Claude Code defers schemas.

<!-- session: f039e154-6ad4-49fd-8f41-f636a96b5826, branch: resume-typesafe-mcp-journal -->

## 2026-09-21 23:40 UTC | decision | Order amended for a three-client team

Miles's call, after the tools/list measurement. His team runs the MCP from Codex and Cursor as well as Claude Code, and he has the same Codex and Cursor setup, so he can take the readings those clients need.
Chosen order: a baseline on all three clients first; then the code tools outlineDocument, getBlock and patchBlock; then the code-only beforeChange checks on MCP writes (em dash, email and phone rules), because for Codex and Cursor those are the only enforcement there is; then locateBlock with Jev; then the claim check.
Added to the roadmap: the tool schema surface as a client-dependent cost (schema on demand, one block type at a time), which the review had scored "not worth doing" on the strength of Claude Code's deferral alone.
Rejected: Jev routing a natural-language instruction to a collection and operation (the function-calling pattern). The schema is the cost, not the choice of tool, and the client still needs the block schema to write valid layout JSON.

<!-- session: f039e154-6ad4-49fd-8f41-f636a96b5826, branch: resume-typesafe-mcp-journal -->

## 2026-09-21 23:59 UTC | decision | Block tools: three custom plugin tools, gated twice, patch by shallow merge

Claude's call, on the roadmap's first step. The three tools are custom tools of @payloadcms/plugin-mcp (src/plugins/mcp-tools/), so every client gets them from the server. outlineDocument returns one row per block (path, id, blockType, blockName, child count, first 200 characters of copy); getBlock returns one block by id; patchBlock merges a partial block on the server and saves a draft by default, returning only the saved block.
Gating: the plugin gives each custom tool a per-key checkbox, but with defaultValue true, the opposite of every collection capability; mcp.ts flips it to false. The tools also check the key's find or update capability on the collection they touch. The key document is not on the request in a custom tool handler, so overrideAuth keeps the plugin's own lookup and puts the key on req.context.mcpApiKey.
Rejected: a JSON string for the patch (the generated update tool's old shape; Codex and Cursor mangle nested strings) in favour of a plain object; a typed per-block schema on patchBlock (that is the 100KB the tools exist to avoid; the client learns the shape from getBlock).
Cost: three new columns on payload_mcp_api_keys, so a migration; and a patch replaces each named field whole, so changing one row of an array means sending the array.

<!-- session: f039e154-6ad4-49fd-8f41-f636a96b5826, branch: resume-typesafe-mcp-journal -->

## 2026-09-21 23:59 UTC | challenge | Two zods and a key encrypted under another secret

The plugin and the MCP SDK under it resolve zod 3.25.76; the project is on zod 4.6.5. Typing the tools' parameters with the plugin's ZodRawShape first failed outright (zod 4 classes lack v3 internals), then, after switching to the `zod/v3` export, made tsc abort and, with an 8GB heap, report "Type instantiation is excessively deep". Fix: a local BlockTool type with a simple parameters shape and one cast at the export. Runtime is fine: the SDK's converter handles a v3 schema by duck typing. About twenty minutes.
Testing locally, the workspace database's MCP keys decrypted to U+FFFD garbage: the database was copied in from another environment and its keys were encrypted under that environment's PAYLOAD_SECRET, and the production key in Claude Code's config does not authenticate here either. Fix: a .context script creates a workspace-only key (`local-bench`) through the Local API and runs the bench and the patch test with it in the environment, never printed. Ten minutes.

<!-- session: f039e154-6ad4-49fd-8f41-f636a96b5826, branch: resume-typesafe-mcp-journal -->

## 2026-09-22 00:00 UTC | measurement | One block edit, before and after the block tools

scripts/mcp-bench.ts, six fixed tasks in scripts/mcp-cases.ts, read-only captures: `baseline` against production with the generated tools, `local-block-tools` against this workspace's dev server (a copy of the database, so two documents differ a little) with the new tools. Bytes exact; tokens estimated at four characters each and labelled so. Report: docs/perf/mcp-tools/report.md.
Read to find the block (find by id → outlineDocument plus getBlock): AdaCore work page 8.9KB → 2.7KB (69 percent less); shader studio lab page 37.3KB → 9.4KB (75 percent, local copy; production's is 42.7KB); Website Strategy expertise page 41.9KB → 7.2KB (83 percent); home 7.2KB → 5.1KB (29 percent, the target is the biggest block on a three-block page).
Write to save it (the field an update resends → the block a patch sends): 6.5KB → 1.0KB (85 percent), 35.9KB → 0.7KB (98 percent), 39.1KB → 2.6KB (93 percent), home 5.5KB → 4.2KB (23 percent).
Where the page is one block (Privacy Policy, 29.5KB of the 31KB; About Us, 1.8KB of 3.3KB) the tools save nothing on the write, as expected.
The list a client reads when it starts from a title and not an id (find with no id, ten documents): 27KB to 251KB. The tool list: 1.6MB either way. Compared against the roadmap's "more than 90 percent" estimate: true for the write on a many-block page; the read saving is lower because the outline itself is 2 to 9KB.

<!-- session: f039e154-6ad4-49fd-8f41-f636a96b5826, branch: resume-typesafe-mcp-journal -->

## 2026-09-22 00:01 UTC | milestone | Block tools built and measured; migration and client readings next

Exists on branch resume-typesafe-mcp-journal: src/plugins/mcp-tools/ (outlineDocument, getBlock, patchBlock; blocks.ts is the pure walker), wired in src/plugins/mcp.ts with the tool checkboxes off by default and the key on req.context; scripts/mcp-bench.ts, mcp-cases.ts and mcp-client.ts; docs/perf/mcp-tools/ with the baseline and local captures and the report; docs/mcp.md's block tools section; the roadmap amended with the multi-client finding and the measured numbers; the server instructions now name the tools (2,048 characters exactly, the limit).
Verified: 20 unit tests (walker and handlers, gating included), tsc and Biome clean, a patchBlock round trip on the workspace dev server (draft saved, other fields untouched, restored, unknown block refused), and a bench capture with the tools live.
Not done, and needs Miles: the migration for the three columns on payload_mcp_api_keys (create asked for, not run); the Codex and Cursor readings; ticking the tools on the team keys once deployed. Then the roadmap's step 3, the code-only beforeChange checks on MCP writes.

<!-- session: f039e154-6ad4-49fd-8f41-f636a96b5826, branch: resume-typesafe-mcp-journal -->

## 2026-09-22 01:34 UTC | decision | Write checks: a beforeChange hook, em dash and visitor email, diffed against the stored document

Claude's call on the roadmap's step 3, the code-only checks on MCP writes. One beforeChange hook (src/plugins/mcp-write-checks.ts) on every collection and global a key can write, acting only when req.payloadAPI is 'MCP', so admin, REST and Local API saves are untouched and the block tools are covered because patchBlock writes through the Local API with the MCP request.
Two rules. An em dash anywhere in copy, rich text nodes included, refuses the save; the house style's numeric-range exception ("50—100K") passes, and code fields, chart specs, identifiers and inline code are skipped. An email address in copy is looked up in inquiries, subscribers and form submissions, and a match refuses the save: an exact lookup, so the studio's own address passes and nothing is guessed. Only copy that differs from the stored document at the same path is checked, so an older em dash in an untouched block never blocks an edit.
Rejected: warn-only (the roadmap's suggestion), because a warning has nowhere to go: the generated update tools answer with the saved document or an error, nothing else. Also rejected: the phone rule from redact.ts, which flags any run of seven digits and would refuse the studio's own number on a contact page; and a check that an email is not on the studio's domain, which guesses.
The refusal names each problem by path with the text quoted around the dash, so the agent fixes the copy without reading the document again. Cost: three count queries per email found in changed copy, rare.

<!-- session: f039e154-6ad4-49fd-8f41-f636a96b5826, branch: resume-typesafe-mcp-journal -->

## 2026-09-22 01:37 UTC | milestone | Write checks live on both write paths

Exists: src/plugins/mcp-write-checks.ts, wired in mcp.ts on every collection and global a key can write (24 collections, 7 globals), with 11 unit tests; a section in docs/mcp.md; roadmap step 3 marked done. Nothing new on the key: the checks need no capability and add no columns.
Verified live on the workspace dev server with .context/local-write-check-test.ts: patchBlock with an em dash refused with the path and the quoted text; a range em dash ("50—100K") saved; an address from the local inquiries table refused as a visitor detail; the studio's own address saved; the generated updateLabPages tool with an em dash in the same block refused through the same hook. The block was restored afterwards.
Next: Miles's Codex and Cursor readings (roadmap step 2), then locateBlock with Jev (step 4).

<!-- session: f039e154-6ad4-49fd-8f41-f636a96b5826, branch: resume-typesafe-mcp-journal -->

## 2026-09-22 01:40 UTC | decision | locateBlock: one Jev request over a tagged outline, a Choice and a Noul

Roadmap step 4, the first Jev call on the MCP. Shape taken from TypeSafe's line-by-line search cookbook (semantic_find), read live 2026-09-22: code tags every block of the outline with a short id (B00, B01, ...) and joins them into one state, a Choice over those ids answers "which block is this instruction about", and a Noul in the same request answers "does any block match", because Choice probabilities sum to one and always crown something.

Chose: the block tools' own outline as the state (blockType, blockName, nesting, the first 200 characters of copy), never the stored data, so a 40-block page is about 2K tokens of state. Code owns the verdict: `found` needs the Noul and the Choice confidence both above thresholds set in one constant; otherwise `unsure` with the ranked candidates, or `none`. The tool returns the top candidates with their probabilities so a client can still pick, plus model, input tokens and milliseconds for the record. Its own client with a 10 second timeout and one retry, not the Ask judge's 800 ms one: an agent waits, a visitor does not. Same key variable and pinned model as Ask.
Rejected: a Score per block (a page has up to a few dozen blocks; one Choice is one request and 255 options covers every page on the site); sending block data as state (jev-1.13 jaggedness: large state full of irrelevant detail); deciding in code to patch (the tool locates, the client edits).
Cost: a fourth checkbox on the key, so another migration; and no key on the server means the tool answers with an error that points at outlineDocument. Claude's call, on the roadmap's plan.

<!-- session: f039e154-6ad4-49fd-8f41-f636a96b5826, branch: resume-typesafe-mcp-journal -->

## 2026-09-22 01:46 UTC | measurement | locateBlock: 10 of 10 on the eval, one Jev request each

Measured with `scripts/mcp-locate-eval.ts` against the workspace dev server (a copy of production content), 2026-09-22, model jev-1.13.0, thresholds exists 0.5 and confidence 0.5. Record: `docs/perf/mcp-tools/locate-local-second.json`.

Ten cases: the six bench tasks from `scripts/mcp-cases.ts` (each names one block by type on a page of 1 to 40 blocks), two instructions naming a block the page does not have (a pricing table on the AdaCore work page, a refunds FAQ on the home page), and two ordinals among several blocks of one type (the second rich text block of the shader studio lab page, the third of the Website Strategy expertise page). Ground truth is the case's block type and ordinal, read from the document in code.

Result: 10 of 10. The six positives and the two ordinals came back `found` with the right block first, choice probability 0.88 to 1.00 and confidence 0.86 to 1.00. Both negatives came back `none` with exists 0.02. Per request: 124 to 411 ms, 522 to 2,450 Jev input tokens (about 796 for the 8-block AdaCore page, 2,450 for the 40-block lab page); the ten requests cost 11,589 input tokens, under a tenth of a cent at the published price. A first run of the six positives an hour earlier gave the same six hits with the same numbers within 0.05.

Compared against: outlineDocument alone, where the client's model reads the 2 to 9KB outline and picks. locateBlock's answer is the top five candidates, about 1KB. The saving on the client is the outline read; the accuracy is the point. The eval is small (ten cases, one page each per collection) and every instruction was written by the author of the tool: readings from real team instructions in Codex and Cursor are the next test.

<!-- session: f039e154-6ad4-49fd-8f41-f636a96b5826, branch: typesafe-mcp -->

## 2026-09-22 01:46 UTC | insight | A Choice always crowns a block; the Noul is what says no

On the two negative cases the Choice still picked a block with real weight: `featuredWork` at 0.34 on the AdaCore page for "update the prices in the pricing table", and `industryWork` at 0.72 with confidence 0.58 on the home page for "fix the typo in the FAQ about refunds". Confidence 0.58 clears the found threshold, so on the Choice alone the tool would have sent a client to edit the wrong block with a confident face. The Noul in the same request read 0.02 on both, and the verdict was `none`.

That is the cookbook's point made concrete on this content: Choice probabilities are relative and sum to one, so the ranking says where to look and never whether to look. Any tool built on a Choice over candidates needs a separate absolute question for "is it here at all", asked in the same request so it costs no second round trip. The same holds for the planned `locateContent` and `pickMedia`.

<!-- session: f039e154-6ad4-49fd-8f41-f636a96b5826, branch: typesafe-mcp -->

## 2026-09-22 01:48 UTC | milestone | locateBlock built, evaluated and documented; one more column awaits a migration

What exists: `locateBlock` in `src/plugins/mcp-tools/` (the judgment in `locate.ts`, the tool in `index.ts`), a fourth checkbox on the key, the server instructions naming it (trimmed back under 2,048 characters, at 2,04x), `scripts/mcp-locate-eval.ts` with four extra cases in `scripts/mcp-cases.ts`, docs in mcp.md, the roadmap and perf/README. Verified: 5 unit tests over the state, the questions and the verdict (68 across the plugin and script suites), tsc, Biome, and the live eval on the workspace dev server, 10 of 10. Types regenerated.

Not done: the migration. `pnpm check:migrations:drift` names the one column, `payload_mcp_tool_locate_block`; the earlier block-tools migration is uncommitted and unshipped, so the clean move is to regenerate it with all four columns rather than add a second. Also open: Codex and Cursor readings (roadmap step 2), ticking the tools on team keys after deploy, and the branch's first commit; the branch was renamed to `typesafe-mcp` during this session. Next build step: `locateContent`.

<!-- session: f039e154-6ad4-49fd-8f41-f636a96b5826, branch: typesafe-mcp -->
