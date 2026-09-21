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
