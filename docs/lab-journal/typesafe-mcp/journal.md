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

## 2026-09-21 16:45 UTC | decision | The companion is a skill plus hooks, not a subagent

Miles asked for an agent that stays with a feature across days and sessions. Claude's recommendation, accepted by Miles ("i want this built").
A subagent runs in its own context, sees only what it is handed and returns one message, so it cannot watch a session. Keeping it informed would mean resending context each time.
Chosen: a skill that tells the main session what to log and when (only it has the context), three hooks that capture prompts and token counts with no model involved, and one subagent at the end (lab-project-writer), where a fresh context is an advantage: it reads the journal, not five days of conversation.

<!-- session: b7777b4e-b883-4269-88eb-e1738d94a25f, branch: main -->

## 2026-09-21 16:45 UTC | decision | Prompts stay outside the repository

Found while building: `gh repo view` reports the repository as PUBLIC. A committed prompt file would publish everything Miles types, including anything pasted by accident.
Chosen: journal.md, sessions.jsonl and meta.json are committed; prompts go, redacted with Ask's redactFreeText, to ~/.claude/lab-journals/sas-site/<slug>/, which every workspace and worktree on the machine shares.
Rejected: everything in the repository (travels with the branch, publishes raw prompts); a gitignored folder in the checkout (a second Conductor workspace would not see it).
Cost: prompt history does not follow the work to another machine. Claude's call, made without asking because it is the safe default and reversible; flagged to Miles.

<!-- session: b7777b4e-b883-4269-88eb-e1738d94a25f, branch: main -->

## 2026-09-21 16:45 UTC | measurement | What a hook costs per prompt

Measured on this machine (Node 22.20, `time`, one run each): a trivial TypeScript file starts in 52 ms under Node's native type stripping and 164 ms under tsx. The real UserPromptSubmit hook, under tsx, took 163 ms end to end.
Chose tsx: it matches every other script in the repo (extensionless imports, the `@/` alias, so the hook reuses Ask's redaction instead of a copy). The prompt and Stop hooks run `async`, so the 163 ms never delays a reply. Only SessionStart is waited for, once per session.

<!-- session: b7777b4e-b883-4269-88eb-e1738d94a25f, branch: main -->

## 2026-09-21 16:45 UTC | challenge | The first live run captured the wrong session

`start` backfills the running session's prompts from its transcript. The first version found that transcript as the newest file in the project's transcript folder. Miles had a second session open in the same checkout, which had written more recently, so the journal took that session's prompt and token counts.
Found on the first real run, by reading the session id in the output instead of trusting the summary line. Fix: Claude Code names the session in every tool call's environment (CLAUDE_CODE_SESSION_ID); the newest file is now only a fallback. The same run showed the private folder named "with-vercel-website": package.json still carries the template's name, so the name now comes from the git origin.
The wrong rows were deleted and the journal restarted. Unit tests had passed: both bugs lived in the part that touches the real machine.

<!-- session: b7777b4e-b883-4269-88eb-e1738d94a25f, branch: main -->

## 2026-09-21 16:45 UTC | decision | Jev reads the raw record so the writer does not have to

Miles asked for TypeSafe to be used in the journal where it saves usage. Claude's design.
Not in the hooks: they must be instant, offline and unable to fail a session.
In a digest step run once at wrap-up (scripts/lab-journal/digest.ts), three judgments, each item judged alone: per prompt, a Choice for what it was doing, a Score for how much of the story it tells, a Noul for whether it must not be published; per journal entry, a Choice for the Lab Project story section; per agent message, four Nouls (decision, problem, measurement, lesson) so an unlogged moment can be found without Claude rereading transcripts.
Raw probabilities are cached, thresholds live in one constant and are untuned, and an item already judged is never sent again.

<!-- session: b7777b4e-b883-4269-88eb-e1738d94a25f, branch: main -->

## 2026-09-21 16:47 UTC | measurement | First Jev digest, on this journal

Run on the record of this session: 4 prompts, 10 journal entries, 3 agent messages of 280 characters or more. 17 Jev requests (jev-1.13.0), 13,556 input tokens, 1.2 seconds wall clock, from the script's own output. At TypeSafe's listed $0.042 per million input tokens that is about $0.0006.
It offered 3 of 4 prompts for quoting, held none back, placed all 10 entries in a story section (the placements read correctly to Claude; Miles has not reviewed them), and flagged 3 agent messages as candidate moments, all already logged.
Not measured: what the same pass would cost Claude. The comparison needs a longer feature; one session is too small to show it.

<!-- session: b7777b4e-b883-4269-88eb-e1738d94a25f, branch: main -->

## 2026-09-21 16:47 UTC | milestone | Lab journal built and run on itself

Exists now: scripts/lab-journal (lib, hook, cli, digest, 10 unit tests), the lab-journal skill, the lab-project-writer agent, and SessionStart, UserPromptSubmit, Stop and SessionEnd hooks in .claude/settings.json.
Verified: tsc and biome clean, tests pass, every hook event exercised by hand with real payload shapes (redaction, subagent events ignored, bad input exits 0), start, log, status and the digest run for real against this session.
Not verified: the hooks firing from Claude Code itself, which needs a new session; the lab-project-writer agent, which has not been run; the digest thresholds, which are untuned defaults.
Next for the feature: nothing in the MCP is built yet. The roadmap's first step is the outline, get-block and patch-block tools, starting with a baseline capture of tokens per authoring task. The journal is paused on main so unrelated sessions are not captured: `pnpm lab:journal resume typesafe-mcp` on the feature branch, then `pnpm lab:journal sync`.

<!-- session: b7777b4e-b883-4269-88eb-e1738d94a25f, branch: main -->
