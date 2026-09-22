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

## 2026-09-21 20:21 UTC | decision | Scripts take the site and key from the MCP client's own config

Reverses part of the earlier upload entry. That version made a person copy the MCP key and the production URL into .env before an upload or a draft check would run. Miles pointed out that the sas-cms MCP is already configured for the whole machine and the agent already has it.

He is right about the design, not only the chore. The scripts are plain processes with no MCP connection, so they do need an address and a key, but the right source is where the MCP client keeps them: the sas-cms entry in ~/.claude.json (this project's entry first, then the machine-wide one, with ${VAR} expanded). Read from there, the script cannot disagree with the MCP about which database it is in, which was the whole problem, and there is nothing to set up.

Kept: env overrides (CMS_MCP_API_KEY, CMS_UPLOAD_SERVER) for CI, Codex and Cursor, and the refusal of a local site without --local on that path.
Verified with no variables set: the upload passed target resolution, and verify read Lab Project 2 from production.
Cost: the script reads a file that holds a secret. It uses the key only for the server it was issued for and never prints it.

<!-- session: c24fb9a3-feaf-4fc4-a2c6-1d4b946320f2, branch: lab-journal-workspace-setup -->

## 2026-09-21 20:23 UTC | milestone | Resting point: writer tooling pushed, first real run still to do

Everything built in this session is on origin/lab-journal-workspace-setup (commits 4358659 and aa9d7d8). No pull request is open yet. Miles is stopping here and will pick the feature up later.

Where things stand: the digest's figure plan, pnpm lab:journal:verify, pnpm lab:journal shot, scripts/cms-target.ts (site and key read from Claude Code's sas-cms config, nothing to set in .env), and the rewritten lab-project-writer brief with the screenshot steps in the article-authoring skill. All run and checked except one thing.

Not yet done, and the place to start next time: the first real writer run. Start Claude Code with claude --chrome on this branch, sign in to the CMS admin in Chrome, and run the lab-project-writer agent on lab-journal. That run answers the open question of whether a subagent gets the claude-in-chrome tools; if it does not, the calling session takes the shots and hands over media ids. It is also the first real data for tuning the untuned thresholds in the digest's figure plan (0.5) and in verify (checkable 0.25, confidence 0.6).

<!-- session: c24fb9a3-feaf-4fc4-a2c6-1d4b946320f2, branch: lab-journal-workspace-setup -->

## 2026-09-21 23:08 UTC | milestone | Merged to main as PR 18; the feature carries on from this branch

Miles started a new Conductor workspace and found none of this work in it: a workspace starts from main, and everything was on lab-journal-workspace-setup with no pull request. His call: merge now, keep working after.

PR 18 was merged into main with a merge commit (2054ae1), not a squash, so this branch and main share history and later work on the branch merges cleanly again. The branch was kept and fast-forwarded to main. GitHub's merge call answered with a server error twice and then with an empty body, yet the merge had gone through: the PR's state, not the command's output, was the thing to check.

The feature is not finished and the journal is not wrapped. It stays live on this branch only; on main it refuses to go live. To continue from another workspace: bring in main, run pnpm lab:journal resume lab-journal on that workspace's branch, and start a new chat so the hooks load. Next step is unchanged: the first real writer run from a session started with claude --chrome.

<!-- session: c24fb9a3-feaf-4fc4-a2c6-1d4b946320f2, branch: lab-journal-workspace-setup -->

## 2026-09-21 23:53 UTC | decision | On-brand copy is guaranteed in three layers, with the voice rules in one file

Miles asked that every piece of text the writer produces follow the editorial guide's voice, tone and style, and that the feature use TypeSafe wherever a judgment fits. He noted the guide (docs/editorial/editorial-guide.md, last edited 2026-08-20) is current on voice but stale on composition: its page structure, layout rules and master prompt describe service pages built with an older block set, and the article-authoring skill is the accurate composition contract for Lab Pages.

Chose three layers, each catching what the one before cannot:
1. The rules, once. The voice, tone, sentence, punctuation and language rules move to docs/editorial/voice.md, which agents load before writing copy. The guide's voice section points there, and its composition sections are marked as the service-page rewrite system. A test keeps the code's phrase lists identical to the doc's, so the two cannot drift.
2. A gate at save time. A Payload plugin walks every string an MCP API key writes and refuses, by path, an em dash or a phrase the guide bans, the way the figures plugin refuses a bad spec. Team members in the admin are not gated: a person may quote. This is the only layer that can promise anything; the other two report.
3. A check with Jev. Code lints what is exact (banned phrases, contrast frames, semicolons, paragraph length, headings that all share one grammatical form, judged by Jev per heading). Jev scores each passage on the guide's dimensions: specific or generic, composed or inflated, human or formulaic, and whether the paragraph closes on a punchline. Thresholds live in code. pnpm lab:journal:verify gains a Voice section, and pnpm editorial:voice runs the same check on any Lab Project, page, post or file.

Rejected: rewriting the guide (Miles's ask is copy that follows it, not a new guide); a Claude review pass on each draft (costs what the draft cost, and the writer already judges its own work with the same bias); gating humans in the admin (a quotation or a client's own words may hold a banned phrase).
Cost: three places to keep in step, held together by the doc-to-code test and one shared module. Jev cannot read taste: the check finds the faults the guide names, not whether a line is good.

Calibration set: the two published Lab Projects (ids 2 and 3), copy Miles has approved, against a planted off-brand draft.

<!-- session: 5583a82e-a83f-4ece-a7a5-9f28a14cc4c9, branch: lab-journal-workspace-setup -->

## 2026-09-21 23:53 UTC | note | One feature or two: Miles framed the voice work as part of the lab journal

The lab-journal skill says tooling that would be written up on its own is its own journal, and the first journal here had to be split for that reason. The voice check is the writer's quality gate, so it belongs to the pipeline this journal records, but the save-time plugin and the Ask prompt reach beyond the journal. Miles opened the session as a continuation of this feature; logged here on that basis. If it becomes its own Lab Project, pnpm lab:journal window can split this session at the prompt where it began.

<!-- session: 5583a82e-a83f-4ece-a7a5-9f28a14cc4c9, branch: lab-journal-workspace-setup -->

## 2026-09-22 00:03 UTC | measurement | The voice check on the two published Lab Projects and a planted agency draft

pnpm editorial:voice run on 2026-09-21 against copy Miles has approved (Lab Project 3, The new Suits & Sandals CMS, 70 paragraphs and 49 headings; Lab Project 2, Payload CMS Shader Plugin, 48 paragraphs and 23 headings) and a planted four paragraph agency draft written to break every rule in docs/editorial/voice.md.

Code, exact: the approved copy held no em dash and no banned phrase in any copy field; the planted draft was refused at every paragraph (five passages, nineteen distinct phrases), and its flattened claims, two contrast frames in one passage and three semicolons were listed. One false listing: three semicolons in Lab Project 3's internalNotes, which is not copy; the field is now skipped by the check and the gate.

Jev, per paragraph, at the first thresholds: generic (score at or below 0.8 of 2) listed 10 of 70 and 2 of 48 approved paragraphs against 4 of 4 planted; inflated (0.6) listed 1 and 3 approved against 4 planted; formulaic (0.6) listed 3 and 3 approved against 4 planted; punchline closes 4 percent of approved paragraphs against 100 percent planted. Heading forms: approved pages mix sentence, noun phrase and imperative headings, no run.

The approved passages Jev read as inflated were confident assertions the doc asks for (0.60 to 0.78); the planted hype read 0.87 to 0.94. Approved formulaic reads topped at 0.68, planted started at 0.79. Thresholds moved into the gaps: inflated 0.8, formulaic 0.75, generic 0.5. After the move, from the cache with no new requests: Lab Project 3 lists 7 generic, 0 inflated, 0 formulaic; Lab Project 2 lists nothing; the planted draft still lists 3 of 4 generic and 4 of 4 on the other two. The 7 generic lines left are abstract thesis sentences ("The website used to be the thing we owned. Now it is the first thing we do with what we own.", 0.06): Jev cannot tell a studio's own idea stated plainly from agency copy, so that section is a list to read, not a list to cut.

Cost: 119 requests and 76,854 input tokens for Lab Project 3, 71 and 47,517 for Lab Project 2, 8 and 4,987 for the planted draft. Two approved projects and one planted draft is a smoke test, not an accuracy figure.

<!-- session: 5583a82e-a83f-4ece-a7a5-9f28a14cc4c9, branch: lab-journal-workspace-setup -->

## 2026-09-22 00:05 UTC | milestone | On-brand copy: the voice contract, the save-time gate and the Jev voice check are in

What now exists, on lab-journal-workspace-setup:

- docs/editorial/voice.md, the house voice in one file: how it feels, sentences, punctuation, the language to favor and to avoid, the contrast frames, the flattened claims, and a table of what is checked where. The editorial guide's voice section points at it, and a status note at the guide's top marks its composition sections as the service-page rewrite system that predates Sections, Story beats and Lab Pages.
- src/features/editorial/voice.ts: the rules as code (banned phrases, frames, flattened claims, counts) with lintVoice and gateFindings. Its test reads voice.md and fails if the two lists differ. VOICE_PROMPT_LINE now sits in the Ask assistant's system prompt, so visitor-facing replies read the same rules.
- src/plugins/house-style: a beforeChange hook on every collection that refuses a save from an API key holding an em dash or a banned phrase, by path, with autosave and team members exempt. Nine unit tests; the MCP server instructions say so in the budget the 2048 character limit leaves.
- scripts/editorial: passagesOf (a document as the passages a reader meets, Lexical paragraphs and headings included), the Jev questions (specific, inflated, formulaic, punchline per paragraph; grammatical form per heading) with thresholds in code, the report, and pnpm editorial:voice for any Lab Project, any document by collection and id, a file or a string. pnpm lab:journal:verify ends with the same Voice section; both read the document over the MCP endpoint through the new scripts/cms-fetch.ts.
- The writer brief, the article-authoring skill, the lab journal guide, docs/mcp.md and AGENTS.md point at the contract and the commands.

Verified: 38 unit tests pass, tsc and biome are clean, and the check ran on Lab Projects 2 and 3, Lab Page 2 and a planted agency draft (numbers in the measurement entry). Not verified end to end: the save-time refusal against a running server, since the hook is covered by unit tests only and this workspace has no dev server of its own up. Next: the first real writer run from a session started with claude --chrome, which now also exercises the Voice section of verify.md.

<!-- session: 5583a82e-a83f-4ece-a7a5-9f28a14cc4c9, branch: lab-journal-workspace-setup -->

## 2026-09-22 01:37 UTC | decision | The strict pass on the published Lab Projects: nine lines change, the abstract lines stay

Miles asked for the strict voice pass on the current Lab Pages now that the check exists. The check's own lists were read in full, then every passage of Lab Projects 2 and 3 and Lab Pages 1 and 2 was read against docs/editorial/voice.md by hand, since Jev lists what the doc names and a pass has to read the rest.

Kept, against Jev's generic list: every listed passage is an abstract line the studio means ("The website used to be the thing we owned. Now it is the first thing we do with what we own.", the thesis, "Access control is also just a function"). The doc asks for strong, simple assertions and the occasional memorable line; these are those.

Changed, as drafts on the Lab Projects, never published:
1. Lab Project 3, challenge, "Fixing the template was not enough": "unlocks composable content areas" is the banned verb inflected. The gate's pattern stopped at the bare word; it now catches a single banned word in any form, with a test. The line becomes "adds composable content areas".
2. Lab Project 3, strategy, "Why Payload": "extremely developer friendly" is a ranking with no particular; it becomes what the particular is, the content model as TypeScript in our own repository.
3. Lab Project 3, strategy, "Write it once, use it everywhere": "actually" dropped from the close.
4. Lab Project 3, approach, "One object, everything generated": "All of it comes out of the box" is a stock phrase; it becomes "None of it needed configuring."
5. Lab Project 3, approach, "Copy that does not know it is on a website": the rhetorical setup ("It sounds fussy. It is not, and here is the payoff:") goes; the paragraph opens on the fact.
6. Lab Project 3, learnings, "Visitors write the content brief": "The quietly most useful thing" reads as a slip; it becomes "The most useful thing in the CMS, and the least visible,".
7. and 8. Lab Project 2, the medium summary and the first challenge beat: "with performance at the forefront", twice, is a stock phrase; both become "cheap to run", which is the beat's own heading.
9. Lab Page 2, the caption under "Where the story lives": its second clause restates a line the medium summary and the strategy beat already carry on the same page ("a fact fixed once is fixed everywhere"); the doc gives every idea one home, so the caption keeps its first sentence and the "one record" clause only.

Rejected: rewriting the four outcome beats that open by repeating their heading ("The website. Each work page..."), because the page shows them as a run without headings and the openers are the labels; and touching the figures' text alternatives, which all open "The takeaway is", because that is the figures contract for alt text, not prose. Whose call: mine on the reads, Miles's on the pass; he reviews the drafts before anything publishes.

<!-- session: 5583a82e-a83f-4ece-a7a5-9f28a14cc4c9, branch: lab-journal-workspace-setup -->

## 2026-09-22 01:39 UTC | milestone | The strict pass is applied as drafts on both Lab Projects and Lab Page 2

The nine edits from the pass are saved as drafts, never published: six beats on Lab Project 3, one beat and the medium summary on Lab Project 2, and one caption on Lab Page 2. Each project update resent every beat row with its id and the changed beat as Markdown with replace: true; the page update resent the whole layout with every block id kept and diagram geometry stripped. A dump of every passage before and after shows exactly those lines changed and nothing else: 236 lines on Lab Project 3, 140 on Lab Project 2, 164 on the page, same counts before and after.

The check rerun on the drafts: nothing refused, nothing listed by the doc, no inflated or formulaic passage on any of the three. Jev was asked only about the changed passages (6, 2 and 1 requests, 4,512, 1,541 and 725 input tokens), because the cache is keyed on the passage text. Lab Project 3 still lists the same abstract lines as generic, kept on purpose.

One gap the pass found in the gate: "unlocks" passed the first pattern, which stopped at the bare word. A banned single word is now caught in any inflection, with a test, and the doc says so.

Miles reviews the drafts in the admin (Lab Projects 2 and 3, Lab Page 2) and publishes or reverts each: the Lab Project first, then the page.

<!-- session: 5583a82e-a83f-4ece-a7a5-9f28a14cc4c9, branch: lab-journal-workspace-setup -->
