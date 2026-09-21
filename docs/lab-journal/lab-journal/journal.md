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

## 2026-09-21 17:35 UTC | milestone | A team guide, and what writing it exposed

Miles asked for a guide he and the team can follow in order, ending with the feature as a Lab Project and a new Lab Page. It is docs/lab-journal/README.md, beside the journals: setup per machine, the order of a feature (start, each session, moving branch, changing subject, pausing), the eight finishing steps from final milestone to publish and wrap, team rules, a symptom table and a checklist. The skill stays the agent's contract and the guide points at it rather than repeating it.
Writing the steps down exposed two gaps, both fixed: there was no way to capture a session the hooks had missed (now `pnpm lab:journal sync <session-id>`), and the writer agent said nothing about images (it now places media ids it is given and otherwise leaves hero, visuals, SEO and related projects to a person). One claim in the first draft was wrong and was corrected: a wrapped journal can be resumed, so it "stops capturing", it is not "never live again".
For a team, the limit worth knowing: prompts and transcripts stay on the machine that produced them, so the digest and the writer should run where most of the work happened.
Verified: tsc, biome, 11 tests. Not verified: the finishing steps end to end, since no feature has been written up yet.

<!-- session: b7777b4e-b883-4269-88eb-e1738d94a25f, branch: main -->

## 2026-09-21 17:42 UTC | challenge | A worktree session could not see the sessions before it

Miles asked whether the feature could continue in a new session in a Claude worktree. Checking that found a gap: Claude Code files transcripts under the path of the directory a session ran in, and the tooling only looked under the current directory and its own checkout root. From a worktree, `sync` and the digest would not have found the sessions that ran in the main checkout, so their tokens could never be recounted and their agent messages never judged.
Fix: transcripts are now looked for under every checkout of the repository, from `git worktree list` (the main checkout and each worktree). Verified by resolving this session's transcript from inside the existing contents-button worktree. Conductor workspaces are separate clones, not worktrees, so sessions there are still only found from their own workspace.
Also confirmed for this session: the journal was paused between tasks and this session started before the hooks existed, so nothing here was captured live. Every prompt was recovered from the transcript on each resume.

<!-- session: b7777b4e-b883-4269-88eb-e1738d94a25f, branch: main -->

## 2026-09-21 17:47 UTC | insight | What Conductor changes for the journal

Miles asked whether the feature could be picked up in Conductor instead of a Claude worktree. Checked, not assumed:
- A Conductor workspace is a worktree of Conductor's own clone, so `git worktree list` from it never names the main checkout. Transcripts are now found by session id in any Claude Code project folder (ids are unique), verified by resolving this session from the Conductor clone's path.
- `.conductor/setup.sh` runs `pnpm install` and copies the root `.env`, which has TYPESAFE_API_KEY, so hooks and digest have what they need.
- `claude mcp list` from the Conductor path shows no `sas-cms` server: it is registered for the main checkout's path only. The write-up step cannot run from a workspace until it is added at user scope. Claude did not read the key to do this; it is Miles's to add.
- Conductor's own clone had a local `main` 36 commits behind origin. Whether a new workspace starts from origin/main was not verified.
- Not verified and not verifiable from here: whether Conductor's agent loads the project's hooks. The SessionStart note in a new workspace chat is the test, and `sync <session-id>` is the fallback.

<!-- session: b7777b4e-b883-4269-88eb-e1738d94a25f, branch: main -->

## 2026-09-21 18:13 UTC | insight | Conductor runs the prompt hook but shows no SessionStart note

Tested in a Conductor workspace chat (dubai), started at 18:11 UTC, three minutes after `resume` made this journal live on lab-journal-workspace-setup. The UserPromptSubmit hook captured the first prompt; the transcript records SessionStart output from two plugins and none from scripts/lab-journal/hook.ts, which prints the note in 0.2 s when run by hand with the same cwd.
So in Conductor a missing note does not mean the journal is not capturing. The guide and the skill now say to run `pnpm lab:journal status` instead of reading the missing note as a hook failure.
Also found: Conductor appends its own `<system_instruction>` block to the prompt text, and cleanPromptText keeps it, so Conductor prompts in prompts.jsonl carry that block (2 so far). Not fixed yet.
Also confirmed: a fresh workspace was level with origin/main (`rev-list --count` 0 0), and sas-cms is now registered at user scope, so the write-up can run from a workspace.

<!-- session: 646a79b6-1542-4ee2-a1f6-cef566b57655, branch: lab-journal-workspace-setup -->

## 2026-09-21 18:25 UTC | decision | Never journal main; strip Conductor's prompt block

Miles's call, after the doc review found both.
Main: a journal listed on `main` captured every session anyone ran there. Chose: resolveActive treats `main` as never live, and `start` and `resume` refuse on it; `main` was removed from both journals' meta.json. Rejected: only removing `main` from the metas, since the next `resume` on main would bring it back. Cost: a journal cannot follow work done directly on main; branch first.
Conductor: cleanPromptText now strips the `<system_instruction>` block, and the 2 prompts already captured with it were cleaned in place. Both changes are a string compare and a regex, with no extra git calls or model requests, so the hooks cost what they did before (Miles asked that nothing here add token use or cost).
Verified: 13 unit tests, tsc, biome.

<!-- session: 646a79b6-1542-4ee2-a1f6-cef566b57655, branch: lab-journal-workspace-setup -->

## 2026-09-21 18:33 UTC | insight | The writer drafts words only; the published pages are mostly figures and screenshots

An audit of the lab-project-writer agent against the two published Lab Pages (From Webflow to Payload, Building a shader studio in Payload CMS) before extending it to media.

The published pages carry 7 to 8 diagrams each, 10 code listings (Webflow page), 4 charts and 2 bespoke figures (shader page), and 14 admin screenshots (Webflow page, 768x392 WebP, client names blurred, files marked REDACTED). All of that was placed by hand in sessions that predate the journal.

The writer's own brief asks for one chart (tokens per session) and says it cannot see or create images, so it only places media ids a person hands it. That line is out of date: the agent has every tool, Read shows it images, and Playwright with Chromium and WebKit is installed.

A second gap: pnpm cms:upload sends to CMS_UPLOAD_SERVER, else NEXT_PUBLIC_SERVER_URL, which is localhost in this workspace, while the sas-cms MCP writes to production. An uploaded id would name a local media document the production draft cannot resolve. This workspace's .env also has no CMS_MCP_API_KEY.

<!-- session: c24fb9a3-feaf-4fc4-a2c6-1d4b946320f2, branch: lab-journal-workspace-setup -->

## 2026-09-21 18:40 UTC | decision | Screenshots come from Miles's own Chrome, not a Playwright login

Miles's call: the writer takes its screenshots through the Claude in Chrome extension, in the Chrome window he is already signed into. For Payload admin shots he logs in first and the agent navigates the admin; for a reference site it uses the same browser.

Rejected: a Playwright capture script with its own admin login (a stored password or a saved login state per machine, and fixture data unless it pointed at production).
Why it works: the extension shares the browser's login state and its screenshot tool can save the image to disk (Claude Code 2.1.211 or later), so the file can go straight to pnpm cms:upload.
Cost: the writer run needs a Claude Code session started with --chrome (or /chrome) and a visible Chrome window. This Conductor session has no browser tools loaded, so that is still to be proven here.

<!-- session: c24fb9a3-feaf-4fc4-a2c6-1d4b946320f2, branch: lab-journal-workspace-setup -->

## 2026-09-21 18:55 UTC | insight | Jev cannot see a screenshot, but it can plan the figures and check the draft

Miles asked whether TypeSafe could make the writer's media work cheaper and better. Checked against TypeSafe's live docs (models page, citation check cookbook) and the existing digest script.

Jev 1.13 takes text only, so it cannot look at a screenshot: the look-before-upload check stays with Claude. Input is priced at $0.042 per million tokens with output free, so any text judgment is close to free beside a Claude pass.

Two places it fits. First, the digest already sends every journal entry to Jev for a story section; adding figure questions to that same request (does this entry describe something on screen, a mechanism with ordered parts, specific code, comparable numbers) gives the writer a figure plan before it starts, instead of spending Claude tokens deciding where figures go. Second, the citation check pattern: after drafting, each beat sentence is judged against the journal entries as supports, contradicts or says nothing, which enforces the writer's rule that anything the record does not say is not said. Numbers and em dashes are checked by plain code first, per the earlier decision to rank code above Jev.

<!-- session: c24fb9a3-feaf-4fc4-a2c6-1d4b946320f2, branch: lab-journal-workspace-setup -->

## 2026-09-21 19:50 UTC | challenge | Asked what a diagram could show, Jev said yes to every entry

The figure plan adds four questions to the digest's per-entry request: screenshot, diagram, code and chart. The first wording asked whether the entry "describes a mechanism" that "a diagram could show". Jev answered 0.84 to 0.97 for all 17 entries. Rewritten as a 0 to 3 Score, 15 of 17 entries scored 2.9 or higher. A plan that lists everything is not a plan.

The cause is in TypeSafe's own limitations page for Jev 1.13: it reads the question literally, and literally anything could be drawn. The fix was to ask what the entry is mainly about, and to write the near miss into the false criterion ("components or steps may be mentioned, but how they connect is not what the entry is for"). With that wording the diagram answers spread from 0.16 to 0.88 and five entries pass 0.5; code spreads 0.10 to 0.78. The chart question was a plain factual condition from the start and never had the problem.

Cost of finding it: three full reruns of the digest at about 55,000 input tokens each, a fraction of a cent apiece. The threshold (0.5) is an untuned default like the others.

<!-- session: c24fb9a3-feaf-4fc4-a2c6-1d4b946320f2, branch: lab-journal-workspace-setup -->

## 2026-09-21 19:56 UTC | decision | An upload refuses a local site unless told the MCP is local too

pnpm cms:upload chose its site from CMS_UPLOAD_SERVER, else NEXT_PUBLIC_SERVER_URL, which in a Conductor workspace is that workspace's dev server. The sas-cms MCP server drafts on production. A writer that uploaded a screenshot would get a media id from the workspace database and put it in a production draft, where it names nothing, or another image.

Chose: scripts/cms-target.ts, one place that resolves the key and the site for every agent script. It refuses a localhost target unless --local is passed, and the upload prints the site it went to on stderr. The key is read from CMS_MCP_API_KEY, else SAS_CMS_MCP_KEY, the name the MCP client configs already use.
Rejected: asking the MCP server which site it is (the script cannot see the client's config); defaulting to production (a contributor testing locally would publish by accident, since agent uploads land public-approved).
Cost: one more flag for anyone running the MCP against their dev server. Miles confirmed production as the target.

<!-- session: c24fb9a3-feaf-4fc4-a2c6-1d4b946320f2, branch: lab-journal-workspace-setup -->

## 2026-09-21 19:56 UTC | measurement | The draft check on a planted draft, and on a real project

pnpm lab:journal:verify holds a Lab Project draft against the journal: code lists em dashes and numbers the record does not hold, then Jev judges each sentence against the three entries that share the most words with it (supports, contradicts, says nothing), following TypeSafe's citation check cookbook.

Test one, a five sentence draft with three planted faults: an em dash in the title, an invented result ("cut review time by 83 percent across 412 sessions"), and a reversed decision ("chose to commit every prompt to the repository"). Code caught the dash and both numbers. Jev marked the reversed decision contradicts at confidence 1.00 and the three true sentences supports at 0.81 to 0.99. It cost 5 requests and 6,052 input tokens. The invented result came back says nothing at 1.00 but was hidden at first: the second question, whether the sentence states a checkable fact, scored it 0.47 against a gate of 0.5. The gate is now 0.25.

Test two, reading a real draft the way the writer would: Lab Project 2 fetched from production over the MCP endpoint with a plain JSON-RPC POST, 122 sentences extracted, code checks only (its journal does not exist, so no Jev run). One planted test is not an accuracy figure; the thresholds stay untuned until a real write-up has been through it.

<!-- session: c24fb9a3-feaf-4fc4-a2c6-1d4b946320f2, branch: lab-journal-workspace-setup -->

## 2026-09-21 19:56 UTC | milestone | The writer now plans figures, takes screenshots and checks its own draft

What exists, uncommitted on lab-journal-workspace-setup:

- The digest asks four figure questions with each entry's section question and writes a figure plan (screenshot, diagram with its kind, code, chart). On this journal: 1 screenshot, 5 diagram, 4 code and 4 chart candidates from 17 entries.
- pnpm lab:journal:verify, the draft check. Verified on a planted draft and by reading a real Lab Project from production.
- pnpm lab:journal shot files a screenshot in the journal's private media folder during the build. Verified by running it.
- scripts/cms-target.ts and the upload guard. Verified: refuses with no key, refuses localhost, passes with --local.
- The lab-project-writer brief rewritten: a setup check first, the figure bar of the two published pages, screenshots through Miles's Chrome, the verify run and a preview check before reporting. The capture steps live in the article-authoring skill so any article can use them. Team guide, lab-journal skill, docs/figures.md and docs/mcp.md updated. tsc and the journal's tests pass.

Not verified: the Chrome capture itself. This Conductor session has no claude-in-chrome tools, so no screenshot has been taken through the extension yet, and whether a subagent inherits those tools is unknown. The brief covers both cases. Also restored four jev.jsonl rows by hand after a careless git checkout dropped them; the counts came from the command output and the times are approximate.

Next: commit, then run the writer on this journal from a session started with claude --chrome, as the first real test.

<!-- session: c24fb9a3-feaf-4fc4-a2c6-1d4b946320f2, branch: lab-journal-workspace-setup -->
