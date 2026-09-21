# Lab journal: the team guide

How to document a feature while you build it, and how to turn the record into a Lab Project and its Lab Page when you are done. Follow the steps in order: the order is what keeps the token counts and the prompt history right.

This guide is for people. The agent's own rules (what it logs, when, and what never goes in) are in the skill, [`.agents/skills/lab-journal/SKILL.md`](../../.agents/skills/lab-journal/SKILL.md), and are not repeated here. Code: [`scripts/lab-journal/`](../../scripts/lab-journal/).

## What it does, in one minute

- **The agent writes the journal** as the work happens: decisions (with what was rejected and why), challenges, insights, measurements, milestones. You can ask it to log something at any time.
- **Hooks capture the rest** with no model involved: every prompt you type, and each session's model and token counts, subagents included.
- **At the end**, Jev (TypeSafe) sorts the record into a short brief, and the `lab-project-writer` agent drafts the Lab Project and its Lab Page in the CMS. A person reviews and publishes.

Each folder beside this file is one feature's journal.

| File | Holds | Committed |
| --- | --- | --- |
| `<slug>/journal.md` | The entries, newest last | Yes |
| `<slug>/sessions.jsonl` | One row per session: model, tokens, dates | Yes |
| `<slug>/jev.jsonl` | Jev's usage for the digest | Yes |
| `<slug>/meta.json` | Title, status, the branches it is live on | Yes |
| `~/.claude/lab-journals/sas-site/<slug>/prompts.jsonl` | Every prompt, redacted | **No.** This repository is public |
| `~/.claude/lab-journals/sas-site/<slug>/digest.md` | Jev's brief, which quotes prompts | **No** |
| `~/.claude/lab-journals/sas-site/<slug>/digest.json` | Jev's raw judgments, so a rerun only sends what is new | **No** |
| `~/.claude/lab-journals/sas-site/<slug>/media/` | Screenshots, until a person or the writer has looked at each and uploaded it | **No** |
| `~/.claude/lab-journals/sas-site/<slug>/verify.md` | The draft check: what the Lab Project says that the record does not | **No** |

## One-time setup, per person and per machine

1. `pnpm install` in the checkout or workspace. The hooks run `node_modules/.bin/tsx`.
2. Start a **new** Claude Code session in the project. Hooks load when a session starts. If Claude Code asks whether to trust the project's hooks, accept; `/hooks` lists them (SessionStart, UserPromptSubmit, Stop, SessionEnd, all pointing at `scripts/lab-journal/hook.ts`).
3. For the digest: `TYPESAFE_API_KEY` in `.env`. Without it everything still works and the writer reads the raw record instead.
4. For the write-up: the `sas-cms` MCP server connected ([mcp.md](../mcp.md#connecting-a-client)), with a key that has find, create and update on `lab-projects` and `lab-pages`, find on `media` and `asset-libraries`, and **Upload media** ticked. The server writes to **production**, as drafts.
5. Nothing more for uploads and the draft check: `pnpm cms:upload` and `pnpm lab:journal:verify` read the site and the key from the `sas-cms` server in your Claude Code config, so they always talk to the site the MCP drafts on. Outside Claude Code (CI, Codex, Cursor), set `CMS_MCP_API_KEY` and `CMS_UPLOAD_SERVER`; a local site is refused without `--local`, because a media id from a workspace database does not exist on production.
6. For screenshots: the [Claude in Chrome extension](https://code.claude.com/docs/en/chrome), and Claude Code started with `claude --chrome` (or `/chrome`, "Enabled by default"). The agent drives the Chrome you are signed into, so there is no password to give it.

## The order of things

### 1. Start: one journal per feature

A feature is whatever would be one Lab Project entry. Tooling you build along the way, or a second idea that grows out of the first, is its own feature with its own journal.

On the feature's branch (a worktree or a Conductor workspace), tell the agent:

> Start a lab journal for this feature: `<short-slug>`, titled "<Title>".

or run it yourself:

```sh
pnpm lab:journal start <slug> --title "<Title>"
```

Do this **before the real work begins**, in the session where the feature is first discussed: `start` keeps the prompts of the session that ran it, so the conversation that led to the feature is part of the record.

A journal is never live on `main`: `start` and `resume` refuse there, and the hooks ignore `main` even in an old `meta.json` that lists it. On `main` it would capture every session anyone runs there. Branch first, then start.

### 2. Every working session

1. Open a session on the feature's branch. The first thing the agent sees is a note that the journal is live, with its latest entries. If that note is missing, run `pnpm lab:journal status` before doing anything else (see [When something is off](#when-something-is-off)).
2. Work as usual. The agent logs as it goes. When you make a call yourself, say why: the agent records it as yours, and "why" is what the write-up needs.
3. Anything you want on the record, ask for it: "log that as a challenge", "log the numbers we just measured".
4. Before you stop for the day, ask the agent for a closing milestone: where things stand and what comes next. The next session starts from that, not from your memory.
5. Commit the journal folder with the rest of the work. `sessions.jsonl` changes every session; that is expected.

### Screenshots as you go

A screen changes while a feature is built, and the write-up wants the one the entry described. When a milestone or a challenge is about something on screen, have the agent take the shot then (through Chrome, as in the article-authoring skill) and file it:

```sh
pnpm lab:journal shot ~/Downloads/capture.png --what "The digest's figure plan in the terminal, for the milestone on Jev's figure questions"
```

It is copied, numbered, to `~/.claude/lab-journals/sas-site/<slug>/media/`, with what it shows in `shots.jsonl`. Nothing is uploaded and nothing enters the repository: the writer looks at each file at the end and uploads the ones fit to publish.

### 3. The feature moves to another branch or workspace

```sh
pnpm lab:journal resume <slug>
```

That makes the journal live on the new branch too. Prompts are shared across every checkout on the same machine, so nothing is lost between Conductor workspaces.

#### In Conductor

A Conductor workspace is a worktree of Conductor's own clone (`~/conductor/repos/sas-site`), not of your main checkout ([conductor.md](../conductor.md)). What that means here:

- `.conductor/setup.sh` fetches and fast-forwards the Conductor root's `main` before the workspace is used, runs `pnpm install`, and copies `.env` (with `TYPESAFE_API_KEY`) from the Conductor root, so the hooks and the digest have what they need. To confirm the workspace starts from current `main`: `git rev-list --left-right --count origin/main...HEAD` prints `0 0` on a fresh workspace.
- Run `pnpm lab:journal resume <slug>` in the workspace, then start a new chat there. Conductor runs the project's prompt and token hooks, but the "lab journal live" note has not been seen to open a Conductor chat. Do not read a missing note as "not captured": run `pnpm lab:journal status` and tell the agent the journal is live, so it loads the skill and logs. If the prompt count does not grow either, the hooks are not running: keep logging entries, and at the end run `pnpm lab:journal sync <session-id>` for each session so prompts and tokens are recovered from the transcripts.
- Sessions that ran in your main checkout are found from the workspace by their id, and prompts are shared across the machine, so nothing from earlier sessions is lost.
- The write-up needs the `sas-cms` MCP server. Registered for one project path, a workspace does not have it; registered at user scope (`claude mcp add --scope user sas-cms ...`, command in [mcp.md](../mcp.md#connecting-a-client)), every workspace does. `claude mcp list` in the workspace tells you which. Building does not need it.
- `CMS_MCP_API_KEY` is blank in every `.env` by design. `pnpm cms:upload` needs it exported in the shell that runs it.

### 4. A session turns to a different feature

Say so, and have the agent switch journals **before** it logs anything else. It closes this journal's share of the session at the prompt where the subject changed and opens the other journal from the same moment (`pnpm lab:journal window`, steps in the skill). Skipping this counts one session's tokens into two features, which is how the first journal here had to be split.

### 5. Taking a break from a feature

`pnpm lab:journal pause`, and `pnpm lab:journal resume <slug>` when you come back. Pause whenever a branch with a live journal is going to be used for unrelated work.

## When the feature is done: journal to Lab Project and Lab Page

Do these in order, in one session on the feature's branch, **on the machine that did most of the work**: prompts and transcripts live on the machine that produced them, and the digest and the writer can only read what is there.

1. **Close the record.** Ask the agent for the final milestone: what shipped, how it was verified, the measured results. Then:

   ```sh
   pnpm lab:journal sync
   ```

   It recounts every session whose transcript is still on this machine.

2. **Run the digest.**

   ```sh
   pnpm lab:journal:digest
   ```

   Jev sorts the entries into the Lab Project's story sections, picks the prompts worth quoting, holds back any that look sensitive, drafts a figure plan (which entries could carry a screenshot, a diagram, a code listing or a chart), and lists agent messages that read like a decision, a problem, a measurement or a lesson nobody logged. It costs a fraction of a cent. It sends redacted prompts, entries and the agent's prose to TypeSafe: skip this step if the record holds something that must not leave the machine, and tell the writer to read the raw record instead.

3. **Fill the gaps.** Open `~/.claude/lab-journals/sas-site/<slug>/digest.md`, read "Moments that may be missing", and have the agent log the ones that are real and absent. Read `journal.md` top to bottom yourself once. This is the last cheap moment to fix the story.

4. **Open Chrome and sign in.** Start the session with `claude --chrome`, open Chrome, and sign in to the CMS admin (and anything else the shots need). The writer takes its own screenshots there: it agrees a shot list with you first, blurs what must not be published before each capture, saves the files to the journal's private `media/` folder, looks at every one, and uploads them with `pnpm cms:upload` ([figures.md](../figures.md#media-upload)). Anything you want in that it cannot stage (an old screen, a recording, a photo) you upload yourself and hand over as media ids. Screenshots taken during the build are already in `media/`: see [Screenshots as you go](#screenshots-as-you-go).

5. **Run the writer.** In Claude Code:

   > Use the lab-project-writer agent on `<slug>`. Media ids: ...

   It checks its setup first (MCP, upload target, browser) and says what is missing. Then it reads the journal, the token rows and the digest (never the transcripts), and drafts over the `sas-cms` MCP:
   - the **Lab Project** (`lab-projects`): the six story sections, each an overview and keyed story beats, including how the work was split between people and agents, with models and token counts from `sessions.jsonl`;
   - the **Lab Page** (`lab-pages`), which requires that Lab Project and is composed from its beats, one Section per idea, to the bar of the published pages: a diagram for each mechanism, code listings copied from the committed files, charts from measured numbers only (always tokens per session when there are two or more), and screenshots beside the beats that describe a screen.

   Before it reports, it checks its own draft:

   ```sh
   pnpm lab:journal:verify <slug> --project <lab project id>
   ```

   Code lists every em dash and every number the record does not hold. Jev then holds each sentence against the journal entries nearest to it: supported, contradicted, or not in the record. It costs a fraction of a cent and writes `verify.md` beside the digest. You can run it yourself after any edit.

   Everything is saved as a draft. It reports the ids, the figure counts, every media id and what was blurred, every prompt it quoted, what the check still lists, and every claim it left out because the record did not support it.

   If the writer runs where there is no browser (a subagent may not get the Chrome tools, and a Conductor chat has none unless Claude Code was started with them), it drafts everything else and says so. Take the shots from a session that has the browser, with the article-authoring skill, and hand it the ids.

6. **Review, as a person.** In the admin, open the Lab Project, then the Lab Page in live preview.
   - Every number traces to the journal. An estimate says "estimate".
   - Every quoted prompt is one you are happy to publish, exactly as typed.
   - No client confidences, no personal details, no secrets.
   - Every screenshot: nothing private showing, the blur covers what it should. Agent uploads are public on arrival.
   - Look at the page once in Safari or on a phone: the writer checks in Chrome only.
   - Hero, SEO and related projects are yours to set: the writer leaves them.
   - Send corrections back to the agent, or edit in the admin. If the story is wrong, fix the beat on the Lab Project, not the page.

7. **Publish**, in the admin: the Lab Project first, then the Lab Page. Agents never publish.

8. **Wrap and commit.**

   ```sh
   pnpm lab:journal wrap
   ```

   Commit the journal folder and merge the branch. A wrapped journal stops capturing.

## Working as a team

- **One journal, several people.** Everyone on the feature's branch logs into the same `journal.md`, and each person's sessions add their own rows to `sessions.jsonl`. Pull before you start; a conflict in either file is always "keep both sides".
- **Prompts stay per machine.** Your prompts are on your machine only. Run the digest and the writer where most of the work happened, and say in the write-up request if a teammate's prompts matter: they can run the digest themselves and send you the quotable lines.
- **Other agents.** Codex and Cursor's own agent read the same skill and can log entries, but no hook runs there: their prompts and tokens are not captured, and the write-up has to say so.
- **Not captured anywhere:** the small model inside `WebFetch`, and anything done outside an agent session. If it matters to the story, log it as a note.

## When something is off

| Symptom | Check |
| --- | --- |
| No "lab journal live" note at session start | `pnpm lab:journal status`. Not live on this branch: `resume <slug>`. Live, but no note: `/hooks` should list the four hooks; start a new session after `pnpm install`. In Conductor the note is expected to be missing (see [In Conductor](#in-conductor)): tell the agent the journal is live |
| Prompts count is not growing | Same as above. After fixing, `pnpm lab:journal sync` recovers the prompts and tokens of sessions already in `sessions.jsonl` |
| Token totals look doubled | One session served two features. Set the window on each journal (step 4 above) |
| A session is missing from `sessions.jsonl` | It ran while the journal was paused or on another branch. Transcripts are kept about 30 days: resume, then `pnpm lab:journal sync <session-id>` (the id is the transcript's file name under `~/.claude/projects/`). If only part of it belongs to this feature, set the window afterwards |
| `start` or `resume` refuses | On `main`: switch to the feature's branch. Another journal is live on this branch: pause or wrap it first, one feature per branch. The slug already exists: `resume <slug>` instead of `start` |
| The digest fails | `TYPESAFE_API_KEY` missing from `.env`. The digest is optional |

## Checklist

```text
Start      [ ] feature branch   [ ] pnpm lab:journal start <slug>   [ ] new session shows the note
Each day   [ ] note appeared    [ ] decisions logged with why       [ ] closing milestone   [ ] committed
Switching  [ ] new branch: resume   [ ] other feature: window + switch journals   [ ] break: pause
Each shot  [ ] pnpm lab:journal shot <file> --what "..."   (while the screen still looks like this)
Finish     [ ] final milestone  [ ] sync   [ ] digest   [ ] gaps logged   [ ] claude --chrome, signed in
Write-up   [ ] writer agent run [ ] verify.md read   [ ] screenshots, numbers and quotes reviewed
           [ ] Safari check     [ ] Lab Project published, then Lab Page
Close      [ ] wrap   [ ] journal committed   [ ] branch merged
```
