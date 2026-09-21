---
name: article-authoring
description: How to author a long-form piece in the sas-site CMS over MCP as a team agent. Use when drafting or editing an article, essay, write-up or technical post on Pages, Posts, Lab Pages, Work Pages, Expertise or Who We Help pages; when composing or re-composing a Lab Page (Story beats, Prose section headings, one reading column); when adding a chart, diagram, code listing or bespoke figure to a page; when writing a chart or diagram spec; when sending Markdown to a rich text field; when a save comes back with a figure validation error; or when uploading a screenshot with pnpm cms:upload.
---

# Authoring long-form pieces in sas-site

You write drafts. A person reviews in live preview and publishes. Everything below serves that split. Deep reference: `docs/figures.md`. MCP setup and capability model: `docs/mcp.md`.

## Invariants

The sas-cms server's instructions are the ground rules. They arrive with every MCP session from `src/plugins/mcp-instructions.ts`, and this skill does not repeat them. On top of them:

- **Specs say what, never where.** No coordinates, colors, sizes or styling in a spec: those keys do not exist and are refused. If a figure needs something the spec cannot say, it is a bespoke figure (code), so ask.
- **A `textAlternative` says what the figure shows and the takeaway**, in plain sentences, for someone who cannot see it. It is what search and Ask index.

## Where a piece goes

| Piece | Collection | Notes |
| --- | --- | --- |
| Essay, technical write-up, opinion | `posts` | Article body is the `content` field (Lexical JSON). Figures and code go in `layout`, the full-width sections after the body |
| R&D project page | `lab-pages` | Requires a `lab-projects` record; story copy lives on that record. Composed as an editorial article: see [Lab pages](#lab-pages-one-reading-column) |
| Client case study | `work-pages` | Requires a `case-studies` record. No Rich text block in its run |
| Standalone page | `pages`, `expertise-pages`, `audience-pages` | |

Ask which one when it is not obvious. The blocks below work the same on all six. Lab Pages add one rule set on top, below.

## Composing the layout

`layout` is a list of blocks. Add a `section` first and nest content blocks in its `blocks`; the Section owns the band and spacing.

```json
{
  "layout": [
    {
      "blockType": "section",
      "blocks": [
        { "blockType": "richText", "markdown": "## Why the field is cheap\n\nEach streak is one quad." },
        { "blockType": "code", "language": "glsl", "code": "float h = fbm(p * uScale);" },
        { "blockType": "chart", "title": "...", "textAlternative": "...", "spec": { } },
        { "blockType": "diagram", "title": "...", "textAlternative": "...", "spec": { } }
      ]
    }
  ]
}
```

Every figure block also takes `caption`, `dataSource` (`label`, `href`, https only) and `width`: `text` (the reading column), `wide` (default), `full`.

## Lab pages: one reading column

A Lab Page reads as an editorial article: every heading and every passage sits on the same reading column (columns 3-6) from the first section to the last. The copy never steps sideways between blocks. These are the defaults; leave them only when the user names a different block, layout or surface in this conversation.

### The rules

- **Narrative copy is always a `storyBeats` block.** It prints the Lab Project's canonical story on the reading column and has no layout of its own to vary. Leave `variant` and `theme` unset.
- **Every Section opens with one Standard heading in the Prose layout**: `{ "blockType": "richTransition", "layout": "prose" }`. Prose puts the heading on the Story beats column. Exactly one per Section, always the first block.
- **Never change a band.** Send every Section with `customize: false` and no `theme`, `spacing` or `stack`. Leave `theme` off every nested block. No alternating surfaces, no contrasted bands for emphasis. On a re-compose, a Section saved with `customize: true` goes back to `false`.
- **Not on a Lab Page unless asked**: `featureHeadingOffset`, any other `richTransition` layout (`offset`, `left`, `centered`, `split`, `statement`), copy carried by a media block (`mediaContentSplit`, `splitContentNarrow`, `imagePair`, `splitImageOffset`, `fullMedia` with `showContent`), `featureStatementGrid`, `featureTabs`, `content`, and the legacy `labStorySection`. Each moves the copy off the column.
- **What joins the column**: figures (`chart`, `diagram`, `bespokeFigure`), `code`, and media with no copy attached (`mediaBlock`, `youtube`, `fullMedia` with `showContent: false`), placed directly after the beat that discusses them. Keep figure `width` at the default; use `text` for a small chart and nothing else for variety.
- **`richText` is the exception, not the body.** Use it only for a passage a story body cannot hold (a `###` subheading, a list, inline code) or a short bridge that belongs to this page alone, such as the lines around a code listing. It sits on the same column. New narrative goes on the Lab Project as a beat, then onto the page as `storyBeats`.
- If the tool schema does not list `prose` under the Standard heading's `layout`, or has no `storyBeats` block, stop and tell the user: the server you are connected to predates them. Do not fall back to another layout.

### Read the story first

Find the `lab-projects` record (the page's `labProject` id). Its six sections are `context`, `challenge`, `strategy`, `approach`, `outcomeSummary`, `learnings`; each has an overview `body` and ordered `storyBeats` with a stable `key`, a `label` and an optional `heading`. List every beat key before composing. A block points at the story with `source` (the section: `context`, `challenge`, `strategy`, `approach`, `outcome-summary`, `learnings`), `storyScope` (`overview`, `section`, `beat`) and, for a beat, `storyBeatKey`. Never rename a key.

### One Section per idea

Separate the page into Sections a person can scan in the admin, in the order the story is read:

- One Section per story part. A long part (usually `approach`) splits into several Sections, one per idea: its heading, its beats, and the figures and code that belong to those beats. A figure never sits in a different Section from the beat that explains it.
- Give every Section a `blockName` that says what it holds ("Try two: pinned releases"). It is the label editors see on the collapsed row.
- Inside a Section the order is always: Prose heading, then beats, each followed by its own figures or code.
- Use every beat on the record exactly once, in an order that reads. If you leave a beat out, tell the user which one and why.
- `labFacts` and `labRelatedProjects` are top-level blocks: keep them after the last Section, in that order.

### The Prose heading

Always write `heading` yourself (a beat's `heading` is a good source). An empty heading under a story source prints the bare section name ("Approach"). `eyebrow` is optional and short. For the standfirst under the heading, pick one:

- `source: "<section>"`, `storyScope: "overview"`, `body` empty: the section's overview becomes the standfirst. Use it on the first Section of a story part when the overview has copy.
- `source: "custom"`, `body` empty: heading only. Use it on every other Section, and whenever the beats below use `storyScope: "section"` (that scope already includes the overview, so the other option would print it twice).

`headingLevel` sets the outline level and the type size, and only the Prose layout shows it: `h2` (default, opens a section), `h3` (a subsection inside the same idea), `h4` (a short passage). Leave it unset for the Sections that carry the story's parts; step down only when a Section sits inside the idea above it. The sizes are set against the article body, so a lower level is a smaller heading, not a quieter colour.

Never give the heading `storyScope: "beat"` or `"section"` with an empty body: it prints the whole passage at standfirst size and repeats the Story beats block under it.

### The beats

- One `storyBeats` block per beat (`storyScope: "beat"`, `storyBeatKey`) when a figure, a listing or media sits between beats. This is the usual case.
- One `storyBeats` block with `storyScope: "section"` when a story part runs with nothing between its beats.
- The block prints no heading. A beat that needs a visible heading gets its own Section with a Prose heading, not a bigger block.
- Do not write `body` or `markdown` on a `storyBeats` block to change what the page says: that is a website-only override and the record stays wrong. Fix the beat on the Lab Project. `source: "custom"` with `markdown` is for a passage that is page-only by nature and needs nothing `richText` adds.

```json
{
  "layout": [
    {
      "blockType": "section",
      "blockName": "The flow field",
      "customize": false,
      "blocks": [
        { "blockType": "richTransition", "layout": "prose", "source": "custom", "eyebrow": "The field", "heading": "One field, three jobs" },
        { "blockType": "storyBeats", "source": "approach", "storyScope": "beat", "storyBeatKey": "one-field-three-jobs" },
        { "blockType": "bespokeFigure", "figure": "streak-curl-vs-gradient-v1", "title": "...", "textAlternative": "..." },
        { "blockType": "storyBeats", "source": "approach", "storyScope": "beat", "storyBeatKey": "pointer-and-polarity" }
      ]
    },
    { "blockType": "labFacts" },
    { "blockType": "labRelatedProjects" }
  ]
}
```

### Re-composing an existing Lab Page

Re-composing changes presentation, not words. Find the page and the project, then:

1. Map every existing block to the rules above. A `featureHeadingOffset` or non-Prose `richTransition` that carried a beat becomes a Prose heading plus a `storyBeats` block for the same `source` and `storyBeatKey`; keep its `eyebrow` and any written `heading`.
2. Keep every figure, `code` and `richText` block as it is, with its `id` and its copy, in the same place relative to its beat. Strip `geometry` from each diagram before resending.
3. A block that changes `blockType` is a new row: send it without an `id`. A block that stays keeps its `id`. Sections keep their `id`.
4. Send the whole `layout` in one update with `draft: true`, then check the preview against the record: every beat present once, no copy lost, no band changed.
5. Report what moved, anything that did not fit the rules and why you left it, and any copy that now lives only in a `richText` block and would be better as a beat. Do not move it yourself unless asked.

## Prose: send Markdown

A Rich text block's `body`, a Story beats block's `body`, and a story section's or story beat's `body` on `lab-projects` and `case-studies`, accept a write-only `markdown` string. The server converts it and stores Lexical. Every other rich text field still takes Lexical JSON.

- In a Rich text block: `##` and `###` headings, paragraphs, bold, italic, links, bulleted and numbered lists, inline code.
- In a story body: paragraphs, bold, italic, links. Nothing else.
- Never in Markdown: fenced code (use a `code` block), tables (use a `chart` block or prose), images (use a media block by id), raw HTML, `#` or `####` headings.
- The server refuses what the field cannot hold and says what to use instead. Fix that and resend.
- A field that already has content refuses `markdown` with a 409. That content may be a person's edit. Only send `"replace": true` beside `markdown` when the user asked you to rewrite that passage.

## Code

`{ "blockType": "code", "language": "...", "code": "..." }`. Languages: the tool schema lists them (TypeScript, TSX, JavaScript, CSS, JSON, GLSL, shell). Keep a listing to what the prose discusses.

## Charts

The MCP tool schema documents every field of `spec`, with descriptions and limits. The shape:

```json
{
  "specVersion": 1,
  "kind": "line",
  "x": { "key": "count", "label": "Streaks", "type": "number" },
  "y": { "label": "Frame time (ms)" },
  "series": [
    { "key": "instanced", "label": "Instanced" },
    { "key": "budget", "label": "60fps budget", "role": "reference" }
  ],
  "rows": [
    { "count": 1000, "instanced": 2.1, "budget": 16.7 },
    { "count": 2000, "instanced": 2.6, "budget": 16.7 }
  ],
  "annotations": [{ "x": 2000, "label": "Default" }]
}
```

Choosing well:

- Pick the kind from the data's job. Magnitude across categories: `bar` (`orientation: "horizontal"` for long category labels or more than about six categories, which a phone cannot label standing up). Change over an ordered x: `line`. Cumulative or share: `area`. Two measures against each other: `scatter` (x must be `number`). Above and below a baseline: `diverging-bar`.
- One y axis, always. Two measures on different scales are two charts.
- Series order is identity: color follows position. Never reorder series to restyle. A baseline, target or prior period is `role: "reference"` and draws neutral.
- Every row carries the x key plus a number or `null` per series key. A gap is `null`, never `0`. Column names must match exactly; an unknown column is an error, not ignored.
- `time` x values are `YYYY-MM-DD`. Rows under `line` and `area` run in increasing x order.
- `format: "percent"` reads values as fractions of 1: `0.42` is 42%.
- An annotation label sits inside the plot: two or three words.
- Put the unit in `y.label`. Use real numbers from a named source and say where they came from in `dataSource` or `caption`. Never invent data; if you do not have the numbers, ask.

## Diagrams

```json
{
  "specVersion": 1,
  "kind": "flow",
  "direction": "LR",
  "nodes": [
    { "id": "slot", "label": "Visual slot", "shape": "terminal" },
    { "id": "admit", "label": "Device can run it?", "shape": "decision", "emphasis": true },
    { "id": "live", "label": "Live field", "shape": "terminal" }
  ],
  "edges": [
    { "from": "slot", "to": "admit" },
    { "from": "admit", "to": "live", "label": "yes" }
  ]
}
```

- `flow` and `state`: list nodes and edges in reading order; that order drives both the layout and the entrance. `shape`: `step` (default), `decision`, `terminal`. `emphasis` on the one or two nodes the figure is about. `style: "dashed"` for optional or async. `animated: true` only for a live data path. `groups` plus a node's `group` frame a cluster. A state may return to itself; a flow edge may not.
- Direction decides how a graph meets a phone. `LR` is stored with a top-down twin and always fits. `TD` has no twin: three or more nodes side by side, or wide groups, scroll sideways on a phone. Use `LR` for a chain, and split a `TD` figure that fans out rather than letting it scroll.
- `sequence`: `actors` (`role: "person"` draws a pill) and `messages` in order. `style`: `call` (default), `reply` (dashed), `self` (needs `from` equal to `to`). Keep it to four actors: that many hold their lifelines on a phone, and a fifth makes the figure scroll sideways there. More participants is two figures.
- `timeline`: `range`, optional `eras`, and `events` (`at`, `label`, optional short `ref`). Dates are `YYYY-MM-DD` and must sit inside `range`.
- Every label is short, not only a node's: an edge label is a word or two on one line, an actor is one to three short words, a message or an event is a phrase. Each wraps to a few lines and is then cut with an ellipsis; the schema descriptions say how much room each gets. The full label survives in the figure's list view, but that is the fallback, not the plan: an ellipsis in the drawing means shorten the label.

## Bespoke figures

`{ "blockType": "bespokeFigure", "figure": "<id>", "props": { } }`. The ids and their props are listed in the field description and in `src/features/figures/registry/definitions.ts`. You cannot create one over MCP: it is code. Leave `textAlternative` empty to take the registry's. When the user asks a coding agent for a new one, the steps are "Adding one" in `docs/figures.md`, including the phone-width canvas rule.

## When a save is refused

A refused save names every problem by path in one message:

```
layout.0.blocks.2.spec (x.type: a scatter chart needs x.type number; rows[3].ms: a series value must be a number or null)
```

`layout.0.blocks.2.spec` is the block; what follows the colon is the path inside the spec and the fix. Correct exactly those and resend the same update. Do not restructure the document to get around an error.

## Screenshots and images

A page about software wants to show the software. The published Lab Pages carry a screenshot beside most beats that describe a screen, each with alt text that names what is on it and a one-line caption.

### Taking them: the person's own Chrome

You take screenshots through the Claude in Chrome extension, in the browser window the person is already signed into. That is the whole login story: you never ask for a password, never store one, and never sign in yourself.

1. **Check you have a browser.** The tools come from the `claude-in-chrome` MCP server (`/mcp` lists them). If you have none, stop and ask the person to start Claude Code with `claude --chrome` (or run `/chrome` and reconnect), then open Chrome. A subagent that finds no browser tools says so in its report, and the session that called it takes the shots instead and hands it the media ids.
2. **Ask the person to sign in first** to whatever sits behind a login: the CMS admin at the site's `/admin`, or any other account. If a page sends you to a login or a CAPTCHA, stop and ask. A public reference site needs nothing.
3. **Agree a shot list before the first capture**: for each shot, the URL, what it frames, and the beat it goes beside. A shot shows one thing. Open the group, scroll the field into view, close the panels that are not the subject.
4. **Keep one window size for the set** (resize once, about 1600 by 900), so the shots read as one series. Let the page settle: no spinner, no toast, no half-drawn preview.
5. **Hide what must not be published, before the capture, not after.** Read the page's text first. A client name the site does not already publish, a person's email, a visitor's details, an API key, a draft of someone else's: blur the element with a style set from the page's JavaScript, for example `element.style.filter = 'blur(6px)'`, and end the file's name in `-REDACTED`. Better, pick a record that needs no hiding. Never capture Inquiries, form submissions, subscribers or Ask questions with their contact details showing.
6. **Save the capture to disk** (the screenshot tool's save option), then move it out of the repository, numbered in reading order: `~/.claude/lab-journals/sas-site/<slug>/media/03-story-beats.png` for a lab journal, the workspace's `.context/` otherwise. An unreviewed screenshot never goes in a public repository.
7. **Look at every file with Read before uploading it.** Check the blur covers what it should, nothing private sits at the edges (an avatar, a second tab's title, a bookmarks bar), and the subject is legible. The server cleans the file, not what it shows. Hold back anything you are unsure of and show it to the person.

### Uploading

```bash
pnpm cms:upload ~/.claude/lab-journals/sas-site/<slug>/media/03-story-beats.png --library 12 \
  --alt "Vault's case study in the admin: the Approach overview, then the first Story Beat with its key, label and heading." \
  --caption "Vault's Approach: an overview, then Story Beats with stable keys."
```

It prints the media id: reference it in a `mediaBlock` directly after the beat the shot illustrates. **The upload has to land on the site your MCP server drafts on**, or the id points at nothing. In Claude Code that is automatic: `scripts/cms-target.ts` reads the site and the key from the same `sas-cms` config entry your MCP tools use, and prints the site on stderr. Elsewhere set `CMS_MCP_API_KEY` and `CMS_UPLOAD_SERVER`; a local site is refused unless you pass `--local`, which is only right when your MCP client points at that dev server too. Find the Asset Library for `--library` with the `asset-libraries` find tool (the piece's project usually has one; ask before creating one). If the upload is refused, pass the error on to the person and do not look for another way in. What the server does with the file is `src/endpoints/agentMedia.ts`.

- `--alt` says what is on the screen for someone who cannot see it: which screen, which record, the fields or rows that matter, and that something is blurred when it is.
- `--caption` is one short sentence on why the reader is looking at it. No em dash in either.

## Checking your work

Open the draft's preview URL and look at it at a desktop width and at two phone widths, 390 and 320. With the Chrome tools above, resize the window and screenshot the page yourself; Chrome is not WebKit, which is what every iPhone runs and is stricter about SVG text than Chromium, so say in your report that the Safari check is still the person's. For every figure:

- It drew. A figure that says its drawing is missing has a spec problem.
- It does not scroll sideways on the phone. If it does, it has too many actors or fans out too wide: split it or turn a `TD` graph to `LR`.
- No label ends in an ellipsis and no two labels touch. Shorten the label; do not leave it to the list view.
- The text alternative still matches the data.

Then tell the user what you drafted, which media ids you uploaded, and anything you could not source.
