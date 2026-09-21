# Lab journal: Lab journal: documenting a feature as it is built

Kept while the feature is built, newest entry last. How entries are written: `.agents/skills/lab-journal/SKILL.md`. Token usage per session is in `sessions.jsonl`; prompts stay outside the repository.

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


## 2026-09-21 17:31 UTC | note | Where this started

At the end of a session reviewing the sas-cms MCP for TypeSafe opportunities, Miles asked for the findings as a document with his prompt, the model and the token usage, because the feature will become a Lab Project entry. He then asked whether an agent could do that for every feature: stay with the work across days and sessions and record key decisions, challenges, insights, models, token usage and prompt history, and asked for it to be built, using TypeSafe wherever it saves usage. The seven entries above were first filed in the typesafe-mcp journal and moved here unchanged; their timestamps are when they were logged, not when they happened.

<!-- session: b7777b4e-b883-4269-88eb-e1738d94a25f, branch: main -->

## 2026-09-21 17:31 UTC | challenge | One session, two features, one journal

The tooling's first real use was wrong in a way no test would catch: Claude started a single journal named for the MCP feature and logged both the MCP review and the building of the journal itself into it, with the whole session's tokens. Miles caught it after the push: they are different features.
Cause: the design assumed a session belongs to one feature. `start` deliberately backfills the session that ran it, which is right for the prompts that led to a feature and wrong when the earlier part of the session was another feature's.
Fix: a session row can carry a window (`pnpm lab:journal window --from/--to`), honored by every recount, by prompt capture and by the digest. The session was split at 16:33:08 UTC, the prompt where the conversation turned. Tokens now sum to the session total across the two journals instead of being counted twice.
Still manual: nothing detects that a session has changed subject. The skill now tells the agent to ask which journal an entry belongs to when a session turns to other work.

<!-- session: b7777b4e-b883-4269-88eb-e1738d94a25f, branch: main -->
