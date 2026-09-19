---
name: article-authoring
description: How to author a long-form piece in the sas-site CMS over MCP as a team agent. Use when drafting or editing an article, essay, write-up or technical post on Pages, Posts, Lab Pages, Work Pages, Expertise or Who We Help pages; when adding a chart, diagram, code listing or bespoke figure to a page; when writing a chart or diagram spec; when sending Markdown to a rich text field; when a save comes back with a figure validation error; or when uploading a screenshot with pnpm cms:upload.
---

# Authoring long-form pieces in sas-site

You write drafts. A person reviews in live preview and publishes. Everything below serves that split. Deep reference: `docs/figures.md`. MCP setup and capability model: `docs/mcp.md`.

## Invariants

- **Drafts only.** Create and update with `draft: true`. Never publish, never set `_status: 'published'`, unless the user explicitly asks in this conversation.
- **Find first.** Read the document, edit from its current state, keep every block's `id`. A blocks array sent without ids replaces the rows wholesale, including a person's edits.
- **Never make media public.** Upload with `pnpm cms:upload` only. It lands internal; a person approves it. Do not set `usageStatus`.
- **Specs say what, never where.** No coordinates, colors, sizes or styling in a spec: those keys do not exist and are refused. If a figure needs something the spec cannot say, it is a bespoke figure (code), so ask.
- **Every figure needs a `textAlternative`**: what it shows and the takeaway, in plain sentences, for someone who cannot see it. It is what search and Ask index.
- **Voice rules from `AGENTS.md` apply to content**: no em dashes anywhere, including titles, captions and labels.

## Where a piece goes

| Piece | Collection | Notes |
| --- | --- | --- |
| Essay, technical write-up, opinion | `posts` | Article body is the `content` field (Lexical JSON). Figures and code go in `layout`, the full-width sections after the body |
| R&D project page | `lab-pages` | Requires a `lab-projects` record; story copy lives on that record |
| Client case study | `work-pages` | Requires a `case-studies` record. No Rich text block in its run |
| Standalone page | `pages`, `expertise-pages`, `audience-pages` | |

Ask which one when it is not obvious. The blocks below work the same on all six.

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

## Prose: send Markdown

A Rich text block's `body`, and a story section's or story beat's `body` on `lab-projects` and `case-studies`, accept a write-only `markdown` string. The server converts it and stores Lexical. Every other rich text field still takes Lexical JSON.

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

- Pick the kind from the data's job. Magnitude across categories: `bar` (`orientation: "horizontal"` for long labels). Change over an ordered x: `line`. Cumulative or share: `area`. Two measures against each other: `scatter` (x must be `number`). Above and below a baseline: `diverging-bar`.
- One y axis, always. Two measures on different scales are two charts.
- Series order is identity: color follows position. Never reorder series to restyle. A baseline, target or prior period is `role: "reference"` and draws neutral.
- Every row carries the x key plus a number or `null` per series key. A gap is `null`, never `0`. Column names must match exactly; an unknown column is an error, not ignored.
- `time` x values are `YYYY-MM-DD`. Rows under `line` and `area` run in increasing x order.
- `format: "percent"` reads values as fractions of 1: `0.42` is 42%.
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
- `sequence`: `actors` (`role: "person"` draws a pill) and `messages` in order. `style`: `call` (default), `reply` (dashed), `self` (needs `from` equal to `to`).
- `timeline`: `range`, optional `eras`, and `events` (`at`, `label`, optional short `ref`). Dates are `YYYY-MM-DD` and must sit inside `range`.
- Labels are short: a node wraps at about four words a line and is cut after three lines. The full label always survives in the figure's list view.
- Never send `geometry`. It is computed on save and anything you send is discarded.

## Bespoke figures

`{ "blockType": "bespokeFigure", "figure": "<id>", "props": { } }`. The ids and their props are listed in the field description and in `src/features/figures/registry/definitions.ts`. You cannot create one over MCP: it is code. Leave `textAlternative` empty to take the registry's.

## When a save is refused

A refused save names every problem by path in one message:

```
layout.0.blocks.2.spec (x.type: a scatter chart needs x.type number; rows[3].ms: a series value must be a number or null)
```

`layout.0.blocks.2.spec` is the block; what follows the colon is the path inside the spec and the fix. Correct exactly those and resend the same update. Do not restructure the document to get around an error.

## Screenshots and images

```bash
pnpm cms:upload ./shots/inspector.png --alt "The Studio inspector with the relief group open"
```

Prints the media id. Before uploading a screenshot of the admin or a terminal, look at it: no email addresses, keys, tokens or client names that are not public. Metadata is stripped for you; pixels are not. Reference the id in a media block. It will not render publicly until a person approves it, and that is correct: tell the user which ids are waiting.

## Checking your work

Open the draft's preview URL and look at it, at a desktop and a phone width. Check that every figure drew (a figure that says its drawing is missing has a spec problem), that labels did not collide, and that the text alternative still matches the data. Then tell the user what you drafted, which media ids need approval, and anything you could not source.
