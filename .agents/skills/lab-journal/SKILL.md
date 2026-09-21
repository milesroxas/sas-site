---
name: lab-journal
description: Keep the build record of a feature that will become a Lab Project entry. Use when the user says to start, resume, pause or wrap a lab journal, or to document a feature's process for the lab; when a SessionStart note says a lab journal is live on this branch; and, while one is live, every time a decision is made, an approach fails, something surprising is found, a number is measured, or a piece of the feature lands. Also use to turn a finished journal into the Lab Project draft.
---

# Lab journal

A feature that will be written up for the lab keeps a journal while it is built. You write the journal as the work happens; hooks capture the rest. At the end the `lab-project-writer` agent turns the record into a Lab Project draft in the CMS.

Storage and commands live in `scripts/lab-journal/` (`lib.ts` says what is stored where). This skill is the contract for what you write. The order of steps for people, start to published Lab Page: `docs/lab-journal/README.md`.

## Who records what

| Record | Where | Written by |
| --- | --- | --- |
| Decisions, challenges, insights, measurements, milestones | `docs/lab-journal/<slug>/journal.md`, committed | **You**, with `pnpm lab:journal log` |
| Tokens and model per session, subagents included | `docs/lab-journal/<slug>/sessions.jsonl`, committed | The Stop hook. Never by you |
| Every prompt, verbatim and redacted | `~/.claude/lab-journals/sas-site/<slug>/prompts.jsonl`, outside the repository | The UserPromptSubmit hook. Never by you |
| Jev usage | `docs/lab-journal/<slug>/jev.jsonl`, committed | The digest and verify scripts |
| Screenshots taken along the way | `~/.claude/lab-journals/sas-site/<slug>/media/`, outside the repository | **You**, with `pnpm lab:journal shot` |

Never copy token counts or prompts into an entry by hand: the hooks have them exactly, and a hand copy goes stale.

## Commands

```sh
pnpm lab:journal start <slug> --title "<Title>"   # new journal, live on the current branch
pnpm lab:journal log --kind <kind> --title "<T>"  # append an entry, body on stdin (below)
pnpm lab:journal resume [slug]                    # live again, and on this branch too
pnpm lab:journal status                           # entries, sessions, token totals
pnpm lab:journal pause [slug]                     # stop capturing (the journal live on this branch by default)
pnpm lab:journal sync [session-id]                # recount sessions from their transcripts; an id adds one the hooks missed
pnpm lab:journal window --from <iso> --to <iso>   # this journal's share of the running session
pnpm lab:journal shot <file> --what "<what>"      # file a screenshot with the journal, outside the repository
pnpm lab:journal wrap [slug]                      # the feature is done
pnpm lab:journal:digest [slug]                    # Jev reads the raw record into a brief and a figure plan
pnpm lab:journal:verify [slug] --project <id>     # code and Jev hold the Lab Project draft against the record
```

A journal is live only on the branches it was started or resumed on, so work on another branch is never captured by accident. It is never live on `main`: `start` and `resume` refuse there. If the user asks for a journal on `main`, have them branch first.

`start` keeps the prompts of the session that ran it, so the conversation that led to the feature is part of the record.

## One journal per feature, even inside one session

A journal belongs to one feature, and a feature is what would be one Lab Project entry. Tooling built along the way, a refactor the work uncovered, or a second idea that grew out of the first is its own feature if it would be written up on its own. The first journal kept with this tooling mixed two, and had to be split.

When a session turns from one feature to another, stop and say so before logging anything more. Then:

```sh
pnpm lab:journal window --to <iso time of the prompt that changed the subject>   # closes this journal's share of the session
pnpm lab:journal pause
pnpm lab:journal start <other-slug> --title "<Title>"                          # or resume it
pnpm lab:journal window --from <the same iso time>
```

The window keeps the session's tokens and prompts from being counted into both journals; every recount, the prompt hook and the digest honor it. Find the time in `prompts.jsonl`. When it is not clear which feature an entry belongs to, ask Miles.

## Logging an entry

```sh
pnpm lab:journal log --kind decision --title "Prompts stay outside the repository" <<'EOF'
The repository is public, so a committed prompt file publishes everything typed.

Chose: prompts in the home directory, journal and token counts in the repository.
Rejected: one folder in the repository (simplest, and it travels with the branch, but it publishes raw prompts); a gitignored folder (a second workspace would not see it).
Cost: the prompt history does not survive a new machine.
EOF
```

It appends, stamps the time, the session and the branch. Do not open `journal.md` to add an entry, and never edit or delete an old one: a decision that was reversed gets a new entry that says so, because the reversal is part of the story.

Log **when it happens**, in the same turn, before moving on. A journal rebuilt from memory on the last day loses the rejected options and the dead ends, and those are what a reader came for. Context compaction also forgets them; the journal does not.

| Kind | Log it when | The body says |
| --- | --- | --- |
| `decision` | An approach, a tool, a data shape or a scope line is chosen, by you or by Miles | What was chosen, what was rejected and why, what it costs. Say whose call it was |
| `challenge` | Something failed, a plan met a wall, a bug took more than a few minutes | What happened, how the cause was found, the fix, and how long it cost if known |
| `insight` | Something was learned that outlives this feature | The finding and the evidence for it |
| `measurement` | A number was measured | The number, the unit, how it was measured, and what it is compared against. Never an estimate without the word "estimate" |
| `milestone` | A piece of the feature works, ships, or is abandoned | What now exists and how it was verified |
| `note` | Context a reader will need and nothing above fits | Keep it short |

Write for a reader who was not in the session: full sentences, names instead of "it", the file or command when it matters. Three to eight lines is the usual size. One entry per thing: two decisions are two entries.

When an entry is about something on a screen (an admin screen, a page, a terminal), take the screenshot in the same turn if you have browser tools, following "Screenshots and images" in the article-authoring skill, and file it with `pnpm lab:journal shot`. The screen will have changed by the time the feature is written up. It stays out of the repository and nothing is uploaded until the writer has looked at it.

Not worth an entry: routine edits, lint fixes, a command that simply worked, anything git history already says.

## What never goes in the journal

The repository is public and `journal.md` is committed.

- No secrets, keys, tokens, or connection strings, even partial.
- No visitor or client personal details, and nothing a client told the studio in confidence. Name a client only if the site already does.
- No verbatim prompt unless it is plainly harmless. Describe what Miles asked for instead; the writer quotes prompts from the private file, and Miles reviews the draft.

## A session

1. **Start of session.** If a SessionStart note says a journal is live, you are already in it: read the latest entries it lists and carry on. Conductor chats do not show the note even when the journal is live and its hooks run: there, when the user mentions a journal, run `pnpm lab:journal status`. If the user asks to start one, pick a short slug with them and run `start`. If they ask to pick one up on a new branch, run `resume <slug>`.
2. **During.** Log as things happen. When Miles makes a call, log it as his.
3. **End of session**, when the user says they are stopping or the work reaches a resting point: log a `milestone` with where things stand and what comes next, so the next session starts from the journal rather than from a recap.

Codex and Cursor have no hooks here. In those agents log entries the same way and add the model you are to the body of the session's first entry; token counts for those sessions are not captured, and the write-up has to say so.

## Wrapping up and writing the entry

1. Log the last `milestone`, then `pnpm lab:journal sync`.
2. `pnpm lab:journal:digest`. Jev sorts entries into story sections, picks the prompts worth quoting, holds back sensitive ones, plans which entries could carry a screenshot, a diagram, a listing or a chart, and lists agent messages that look like an unlogged decision, problem, measurement or lesson. It costs cents and saves the writer reading the raw transcripts. It sends redacted prompts, entries and agent prose to TypeSafe: if this feature's record holds something that must not leave the machine, skip it and tell the writer to read the raw record.
3. Read the digest's "moments that may be missing" list and log the ones that are real and absent.
4. Ask Miles to open Chrome (Claude Code started with `claude --chrome`) and sign in to the CMS admin, so the writer can take its screenshots there.
5. Hand over to the `lab-project-writer` agent with the slug. It drafts the words, the figures and the screenshots, checks the draft with `pnpm lab:journal:verify`, and never publishes. If it reports that it had no browser tools, take the shots from this session with the article-authoring skill and give it the media ids.
6. `pnpm lab:journal wrap` once a person has reviewed and published the Lab Project and Lab Page: corrections to the drafts are still part of the feature's record.
