# Figures and long-form authoring

Charts, diagrams and code-owned figures as CMS blocks an agent can write as validated text, plus Markdown input for prose and a media upload script. A team agent drafts over MCP; a person reviews in live preview and publishes.

Origin and rationale: [figures-authoring-plan.md](figures-authoring-plan.md). Agent-facing contract: the `article-authoring` skill (`.agents/skills/article-authoring`).

The principle: model the author's mental model, and the author is an LLM. It is reliable when it writes a constrained spec and a validator answers with precise errors. It is unreliable when it places pixels. So a spec says what, never where, and the renderer owns layout, palette, type and motion.

## Map

| Piece | File | Owns |
| --- | --- | --- |
| Spec schemas | `src/features/figures/spec/` | `chart.ts`, `diagram.ts` (zod), `limits.ts` (every ceiling, stated once), `read.ts` (the one parser), `json-schema.ts` (the same schemas as JSON Schema for the admin editor, `payload-types` and MCP) |
| Save-time layout | `src/features/figures/layout/` | `graph.ts` (ELK, flow and state), `sequence.ts` and `timeline.ts` (arithmetic, computed at render), `index.ts` (`LAYOUT_VERSION`, spec hash, budget, `currentLayout`) |
| Bespoke registry | `src/features/figures/registry/` | `definitions.ts` (ids, prop schemas, text alternatives: data only), `components.tsx` (the component per id) |
| Renderers | `src/features/figures/ui/` | `figure-frame.tsx` (shared shell), `canvas.ts` (how a drawing sizes to its frame), `text-lines.tsx` (the one way SVG type is set), `chart/` (model, table, legend, lazy canvas), `diagram/` (server SVG), `bespoke/` |
| Blocks | `src/blocks/figures/` | `chart`, `diagram`, `bespokeFigure` configs and components, `shared.ts` (frame fields), `spec-field.ts` |
| Document boundary | `src/plugins/figures/index.ts` | Validation that answers on drafts, save-time diagram geometry |
| Markdown input | `src/fields/markdownInput.ts` | The write-only `markdown` and `replace` pair |
| Code block | `src/blocks/Code/` | One config, offered inline in a post body and in the Section run; the listing itself is the `components/ui/code-block.tsx` surface, whose `code-block-languages.ts` adds GLSL and shell |
| Upload | `scripts/cms-upload.ts`, `src/endpoints/agentMedia.ts` | `pnpm cms:upload` with the MCP key; the endpoint decides what an upload becomes |
| Corpus | `src/features/figures/corpus.ts` | Eight charts and eight diagrams: fixtures for stories and tests |

Import the server-safe surface from `@/features/figures` (no React). Renderers import from `@/features/figures/ui/...` directly.

## Where the blocks are offered

Chart, Diagram, Bespoke figure (group: Figures) and Code (group: Text) sit in the shared Section-nestable run (`sectionNestableBlocks`), so Pages, Posts, Expertise, Who We Help and Lab Pages offer them inside a Section and at the top level. Work Pages build their run by hand and take the same four plain (no story copy, no media). Home holds them back: they are article grammar and would grow the global's schema for nothing.

They carry no story `source`, so the Lab mapping passes them through unchanged. A figure's attribution group is `dataSource`, not `source`, because `source` already means the story-copy select on this site and the MCP rules teach agents that meaning.

## The frame every figure shares

`title`, `textAlternative` (required), `caption`, `dataSource` (`label`, `href`, https only), `width` (`text`, `wide`, `full` on the 8-column grid), `theme`. The frame renders the `<figure>`, the title with its anchor link, the caption, and a native `<details>` holding the text alternative and the data view (a table for a chart, ordered lists for a diagram). All of it is server HTML.

`title`, `caption` and `textAlternative` are TEXT_KEYS in the content walk (`src/shared/content/extract.ts`), so a figure reaches search and Ask through its words. `spec` and `geometry` are skipped there: they are data and coordinates, not prose.

## Charts

Kinds: bar, line, area, scatter, diverging bar. The spec is data and encoding only. Read the schema for the fields, their descriptions and their limits; nothing here restates them.

Decided once in the renderer and not authorable: the four categorical colors in fixed order (never cycled), a neutral for `reference` series that does not use up a categorical slot, 2px lines, bars capped at 24px with a rounded data end and a square baseline (whichever way the bar points), a 10% area wash, 8px dots with a surface ring, a hairline solid grid, text in text tokens, one y axis. A legend appears for two or more series. Direct labels are selective: bar tips only for one series with few rows, line ends only while they sit far enough apart to read (`directLabels`).

Series are re-keyed to fixed slots (`s0`..`s3`) before they reach Recharts. An authored key never becomes a data key, a CSS variable or a class, so nothing from the CMS reaches a stylesheet.

The chart library is one lazy chunk, requested when the figure comes within a screen of the viewport (`lazy-chart.tsx`). The frame reserves the chart's box from its kind first, so loading never moves the page. A page with no chart downloads nothing.

### Palette record

Four slots, light and dark selected separately (`--figure-1..4`, `globals.css`). Dark follows the ground, not the site theme, so a chart on a dark band in the light theme takes the dark steps. Validated with the dataviz validator on every surface a figure can sit on:

```bash
V=<dataviz skill>/scripts/validate_palette.js
node $V "#2a78d6,#d95926,#15936a,#b57a00" --mode light --surface "#ffffff"   # page
node $V "#2a78d6,#d95926,#15936a,#b57a00" --mode light --surface "#f4f4f5"   # neutral band
node $V "#3987e5,#d95926,#199e70,#c98500" --mode dark  --surface "#0a0a0a"   # dark theme
node $V "#3987e5,#d95926,#199e70,#c98500" --mode dark  --surface "#1b1b1b"   # dark band, light theme
node $V "#3987e5,#d95926,#199e70,#c98500" --mode dark  --surface "#020202"   # dark band, dark theme
```

2026-09-19: every check passes on all five. Worst adjacent CVD separation 8.4 (target 8), worst normal-vision separation 18.1 (floor 15), every mark at or above 3:1 against its ground. Re-run before changing a value. A `brand` band is not in the record: avoid charts on it until it is.

## Diagrams

Kinds: flow, state, sequence, timeline. A spec has no coordinates; a position on a node is an unknown key and is refused.

Flow and state are laid out by ELK when the document is saved, and the result is stored in the block's hidden `geometry` field: node boxes with the wrapped lines they were sized for, routed edge points, label boxes, canvas size, the hash of the spec and `LAYOUT_VERSION`. A left-to-right graph also stores a top-down twin. Sequence and timeline are plain arithmetic and are computed where they render. No layout engine ever runs during a page render.

`geometry` is never read from the request. The plugin reuses the saved geometry when the spec hash and layout version still match and recomputes otherwise, so it cannot be forged or hand-placed. The page checks the same thing before drawing (`currentLayout`); a stale or unreadable layout falls back to the list view, which only happens in a draft preview between an autosave and the next full save.

Narrow frames: a figure with two forms shows whichever fits its own width, by container query (`TwoForms` in `diagram-figure.tsx`), so a `text`-width figure on a desktop gets the narrow form too. A left-to-right graph swaps to its stored top-down twin, a timeline to a stepped run down one rail, and a sequence to lifelines on a phone's pitch with each label run across the canvas above its arrow (four actors fit a 320px phone). A drawing fills its frame up to 1:1 and never shrinks below 80% (14px labels stay above 11px): `ui/canvas.ts`, which bespoke drawings use too. What still cannot fit (a top-down graph wider than a small phone, a sequence of five or more actors) scrolls sideways inside its frame, which is focusable and carries `scroll-fade-x`, so the cut edge reads as "more this way": the one accepted exception to no horizontal scroll.

SVG type goes through `TextLines` (`ui/text-lines.tsx`): pre-wrapped lines centred on a point with an explicit `dy`. Do not centre with `dominant-baseline`: WebKit does not pass it from a `<text>` to its `<tspan>`s, so wrapped labels sit high in Safari and on every iOS browser.

Bump `LAYOUT_VERSION` when node metrics, spacing or routing change. Stored geometry from the old version stops drawing (list view) until the document is next saved.

Budget: the largest legal graph (every node and edge slot used, every edge labelled) lays out in about 40ms; the budget is 2000ms. ELK runs in-process and cannot be interrupted, so the spec ceilings are what bound the work. The budget is a tripwire: over it, the save fails and nothing is stored.

## Bespoke figures

For anything a spec should not grow to express. The CMS stores `figure` (an id) and `props` (a small JSON object); everything else is code. Shipped: `streak-dash-anatomy-v1`, `streak-curl-vs-gradient-v1`.

Adding one:

1. Add the id, label, prop schema and text alternative to `registry/definitions.ts`. Ids end in a version and are permanent: a changed figure is a new id.
2. Add the component to `registry/components.tsx`. The `satisfies` check fails the build if an id has no component or the props disagree.
3. Build it as a client component whose server render at the starting props is a complete drawing: that render is the static fallback. Put its controls in the first render so hydration never moves the page.
4. Draw it on a canvas a phone can hold (about 340 units wide) and size it with `canvasStyle`, so its labels are the page's own small type at every width instead of scaling with the drawing. Set labels with `TextLines`, and check that no slider position pushes a label past the canvas or into another label. Controls are `FigureControl` rows, which stack on a phone so the track gets the full width.
5. Add a story, and look at it at 320, 390 and desktop widths in WebKit as well as Chromium.

Removing an id is a content change: keep it until no document uses it, or the block renders nothing. `figure` is validated text, not a select, so a new figure is not a migration.

Every new spec option needs two real figures that require it. Otherwise it is a bespoke figure.

## Markdown input

A rich text field with `...markdownInputFields('body')` spread before it accepts a write-only `markdown` string, converted to Lexical on save with the field's own editor config. The fields are virtual: Markdown is never stored, Lexical stays the only form. Wired on the Rich text block's `body` and on every story section and story beat `body`.

What converts follows the target editor, not a list here. The Rich text block enables `##`, `###`, lists, inline code, bold, italic and links. Story bodies enable bold, italic, underline and links only. Syntax the field cannot hold is refused with what to use instead (fenced code, tables, images and raw HTML always; lists, quotes, inline code and heading levels by editor feature), rather than stored as literal text.

Sending `markdown` to a field that already has content needs `replace: true` beside it (409 otherwise), so an agent cannot silently overwrite a person's edits. The limit: a client that resends a blocks array without row ids is creating new rows, which no field check can tell from intent. The MCP rules (find first, edit from current state) and Payload versions cover that.

### Vendored patch: `@payloadcms/drizzle`

`patches/@payloadcms__drizzle.patch` (wired through `patchedDependencies` in `pnpm-workspace.yaml`) makes one change: `validateExistingBlockIsIdentical` skips virtual fields. Unpatched, Payload 3.88.0 treats a virtual field as a column that is missing from the block's table. A block that carries one and is offered twice in a collection (the Rich text block: top level and inside a Section) fails that check and is given a second table, `<table>_rich_text_2`, and the Section rich text already in `<table>_rich_text` stops being read. The write-only `markdown` and `replace` fields are the only virtual fields in a block here.

Upstream `main` had the same code on 2026-09-19, so there is no fixed version to move to yet. `tests/int/figures.int.spec.ts` asserts that no suffixed rich text table exists, and `pnpm check:migrations:drift` fails if the schema forks, so a dropped patch is loud. On a Payload bump: re-create the patch for the new version (`pnpm patch @payloadcms/drizzle`), or drop it once upstream skips virtual fields, then run both.

## Validation

Payload skips field `validate` on a draft save, and a draft is the only thing an agent writes. So `figuresPlugin` checks every figure at the document boundary on every full save, draft or not, and throws one `ValidationError` naming every problem by path, for example:

```
The following fields are invalid: layout.0.blocks.2.spec (x.type: a scatter chart needs x.type number; rows[3].ms: a series value must be a number or null)
```

The detail is in the message itself because the MCP tools relay `error.message` and nothing else. Autosave is exempt: a person mid-edit in the JSON editor passes through states that parse but do not validate, and failing a save every 800ms would fight them. The page parses every stored spec again before drawing, so an autosaved bad spec shows its words and says the drawing is missing.

## Motion

- Diagram entrance is explanatory: nodes surface in reading order (the order listed in the spec) and each solid edge draws from its source, 40ms apart, capped so a 40-node graph lands inside a second. Nodes only fade, because the block's own reveal already travels. It keys off `.reveal-section[data-visible]`, so outside a reveal shell nothing is hidden.
- `animated` edges march toward the arrowhead, linear, for six cycles after the reveal and again while the pointer is over the figure, then rest. A loop that never stops repaints a figure nobody is looking at.
- Chart marks do not animate in: the chunk mounts before the chart is on screen. The canvas fades over its placeholder instead. The tooltip tracks the pointer with no easing.
- Bespoke sliders drive the drawing 1:1.
- All of it sits under `prefers-reduced-motion: no-preference`. With reduced motion nothing is hidden, drawn or marched.

Rules live in `globals.css` under "Figures".

## Media upload

```bash
pnpm cms:upload <file> --alt "<text>" --library <id> [--caption "<text>"] [--local]
```

MCP cannot carry a binary, so this is the one way an agent adds media. It posts to `POST /api/agent/media` with the MCP API key the agent already has, and prints the media id.

The target has to be the site the agent's MCP server drafts on, because a media id only exists in one database. So [`scripts/cms-target.ts`](../scripts/cms-target.ts) reads the site and the key from the `sas-cms` server in Claude Code's config (`~/.claude.json`), and with Claude Code there is nothing to set. Env overrides it for CI and other agents: `CMS_MCP_API_KEY` (else `SAS_CMS_MCP_KEY`) and `CMS_UPLOAD_SERVER`. With a key in env and no site it falls back to `NEXT_PUBLIC_SERVER_URL`, a workspace's dev server, and refuses it unless `--local` is passed (right only when the MCP client points at that dev server too). How an agent takes the screenshot in the first place, through the person's own Chrome, is in the article-authoring skill.

An MCP key fails every team-only REST rule by design, so plain `POST /api/media` stays closed to it. The endpoint is the narrow door instead of a wider rule. It acts as the team member the key is linked to, with access control on, and needs the key's own **Upload media** capability (System, API Keys), off by default like every other capability.

[`src/endpoints/agentMedia.ts`](../src/endpoints/agentMedia.ts) decides everything about the stored file: what is required, which images it accepts, how it encodes them and the usage status they land with. Read it there; this page does not restate it. The request carries only `alt`, `caption` and `assetLibrary`, so a client cannot choose any of the rest.

## The MCP key for article authoring

Any key works, and an existing authoring key needs nothing new for figures or Markdown: the blocks live inside collections it already covers. Tick **Upload media** on it to let `pnpm cms:upload` use it. For least privilege, a key for article work wants find, create and update on the surface being authored and on `lab-projects` or `case-studies` when the piece has a story record, find on `media` and `asset-libraries`, and no delete. Publishing stays a human action.

## Acceptance corpus and what is still open

`corpus.ts` holds eight charts and eight diagrams shaped like the Streak Field write-up's figures. The shapes are real and cover the whole spec surface; the numbers are illustrative. Phase 5 of the plan (author the real article through this path, measure it with [performance-measurement.md](performance-measurement.md), run an accessibility pass) has not been done and needs the real data.

AEO: `llms-full.txt` and the `.md` export serialize a post's `content` field only, so composition blocks (figures included) on any surface do not reach them. The Ask index does read them.
