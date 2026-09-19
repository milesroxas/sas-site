# Figures and agent authoring for long-form Lab content: plan

Status: proposal, 2026-09-19. Nothing here is implemented. No schema, dependency or content change has been made.

Origin: the Streak Field write-up drafted on 2026-09-19 (8 charts, 8 diagrams, 14 screenshots, about 4,500 words). It was produced as an Obsidian note because the CMS has no way to hold a chart or a diagram as anything but a flat image. This plan makes that kind of piece authorable in Payload, by a team agent over MCP, reviewed and published by a person.

Verified at the time of writing: Payload 3.88.0 and `@payloadcms/richtext-lexical` 3.88.0. `recharts`, `elkjs`, `mermaid`, `@xyflow/react` and `zod` are not dependencies. `src/components/ui` has no `chart` primitive. Recheck when implementation begins.

## Decision

Do not build a content-ingestion plugin. The `sas-cms` MCP server (`src/plugins/mcp.ts`, [mcp.md](mcp.md)) already gives a team agent draft authoring on `lab-pages` and `lab-projects` through access control. What is missing is content types an agent can express as validated text.

Build a small **figures** feature, packaged as a Payload plugin so blocks, validation and admin previews travel together:

1. **Chart block.** Data and encoding as a JSON spec, rendered by one code-owned component on the shadcn chart primitive.
2. **Diagram block.** A graph or sequence spec with no coordinates. Layout is computed on the server when the document is saved and stored with it. Rendered as server SVG bound to the site's tokens.
3. **Bespoke figure block.** A code-owned registry of one-off interactive figures, referenced by id with JSON props. The same pattern as shipped Streak Field looks.
4. **Authoring path.** Markdown in for prose, a media upload script, and a `lab-article` agent skill that carries the contracts.

The principle is the one the Streak Field Studio arrived at the hard way: model the author's mental model. Here the author is an LLM. It is reliable when it writes a constrained spec, a validator answers with precise errors, and the renderer owns layout, theme and motion. It is unreliable when it hand-places pixels, which is what the Obsidian charts required.

## Goals and non-goals

Goals

- An agent can create a complete long-form Lab draft over MCP: prose, code, charts, diagrams, media references.
- Every figure is responsive, follows the visitor's light and dark theme, respects reduced motion, and has a text alternative.
- Figures are data. A person can correct a number in the admin without touching code or re-exporting an image.
- One visual system. Palette, marks, type and motion are decided once in the renderer, not per figure.
- The agent never publishes and never makes media public.

Non-goals

- A general drawing tool, a whiteboard, or freeform node placement in the admin.
- Arbitrary HTML, SVG, CSS or JavaScript supplied through a spec.
- Expression evaluation. A function plot is sampled points, not a formula string.
- Dashboards or live data. Specs are static and versioned with the document.
- Replacing the Content Hub story model.

## Current findings

| Priority | Evidence | Required response |
| --- | --- | --- |
| High | `lab-pages` is presentation only. Canonical narrative lives on the related `lab-projects` record in story sections (`src/collections/story/narrative.ts`: context, challenge, strategy, approach, outcome-summary, learnings, each with reusable beats). | Decide where figure data lives before adding fields. See [Open decisions](#open-decisions), item 1. |
| High | Composition is `layout` blocks where editors add a Section and nest blocks from `sectionNestableBlocks` (`src/blocks/shared/section-blocks.ts`). Lab maps that run into story-aware variants (`labBlock` in `src/blocks/lab/config.ts`). | Figure blocks join the nestable run under a new `BLOCK_GROUPS` entry, and must pass through the Lab mapping unchanged (they carry no story `source`). |
| High | `Code` (`src/blocks/Code/config.ts`) is not Section-nestable and offers three languages. The write-up needs GLSL, TS, JSON and shell. | Make Code nestable and extend the language list. Small, do first. |
| High | Prose is Lexical. Lexical JSON is verbose and fragile for an agent to author, and inline `BlocksFeature` content is worse. | Accept Markdown as write-only input and convert on the server. Keep figures as composition blocks, never as inline Lexical blocks. |
| High | Media is read-only over MCP because tools cannot carry binaries, and new media defaults to the internal `usageStatus` gate. Public rendering requires `public-approved` plus alt text. | An upload script for the agent's screenshots that lands media as internal. A person approves. The gate stays intact. |
| Medium | MCP authoring rule: drafts only, publish on explicit request ([mcp.md](mcp.md)). Keys default to no capabilities. | A dedicated key for article authoring with find, create and update on `lab-pages` and `lab-projects`, find on `media`. No delete. |
| Medium | Every new visual UI ships with a Storybook story. Blocks place content on `BlockGrid` and never own vertical spacing. | Stories and fixtures per figure kind. Figures are cells on the 8 column grid with a width option, not free-width elements. |
| Medium | The RAG walk and AEO read the story model. A figure with no text is invisible to both. | Title, caption and a required text alternative on every figure, included in the walk. |
| Low | `src/features/immersive/studio/recipe.ts` hand-rolls validation for the Studio. | Figures have deeper, nested specs. Pick a schema library once (see Open decisions, item 2) rather than hand-rolling three more validators. |

## Architecture

```
agent (Claude Code)
  ├─ MCP create/update draft ──► Payload field validate (spec schema) ──► precise errors back to the agent
  ├─ pnpm cms:upload ─────────► media (internal, alt required)
  └─ preview URL + screenshot ─► self-review loop

Payload beforeChange
  └─ diagram spec ─► layout engine (server, pure JS) ─► positions stored beside the spec

Frontend (server components first)
  ├─ Chart: server HTML table fallback + lazy client chart near the viewport
  ├─ Diagram: server SVG from stored layout, CSS-only motion, optional client enhancement
  └─ Bespoke: registry lookup by id, lazy client component, static fallback
```

Single source of truth, in one direction: spec types → validator → JSON Schema → field descriptions and the agent skill. Nothing restates a limit or an enum by hand.

### Chart spec (v1)

```ts
type ChartSpec = {
  specVersion: 1
  kind: 'bar' | 'line' | 'area' | 'scatter' | 'diverging-bar'
  orientation?: 'horizontal' | 'vertical'
  x: { key: string; label?: string; type: 'category' | 'number' | 'time' }
  y: { label?: string; format?: 'number' | 'percent' | 'compact'; domain?: [number, number] }
  series: { key: string; label: string; role?: 'primary' | 'reference' }[] // max 4, order is identity
  rows: Record<string, number | string | null>[]                           // max 500
  annotations?: { x?: number | string; y?: number; label: string }[]       // max 6
}
```

Renderer rules, decided once and not authorable: categorical colors assigned in fixed order from validated tokens, light and dark steps selected separately, a `reference` series always neutral, 2px lines, bars capped at 24px with rounded data ends, hairline grid, legend for two or more series, selective direct labels, tooltips on hover and focus, text in text tokens and never in the series color. One y axis, always. The palette is validated with the dataviz validator against both surfaces before it ships.

### Diagram spec (v1)

```ts
type DiagramSpec =
  | { specVersion: 1; kind: 'flow' | 'state'; direction: 'LR' | 'TD'
      nodes: { id: string; label: string; shape?: 'step' | 'decision' | 'terminal'; group?: string; emphasis?: boolean }[] // max 40
      edges: { from: string; to: string; label?: string; style?: 'solid' | 'dashed'; animated?: boolean }[]             // max 80
      groups?: { id: string; label: string }[] }
  | { specVersion: 1; kind: 'sequence'
      actors: { id: string; label: string; role?: 'person' | 'system' }[]                                                // max 8
      messages: { from: string; to: string; label: string; style?: 'call' | 'reply' | 'self' }[] }                      // max 30
  | { specVersion: 1; kind: 'timeline'
      range: { start: string; end: string }
      eras?: { start: string; end: string; label: string }[]
      events: { at: string; label: string; ref?: string }[] }                                                            // max 20
```

Flow and state share one graph renderer. Layout runs in a `beforeChange` hook and is stored in a hidden sibling field (`layout`: node boxes, edge paths, canvas size, and the hash of the spec it was computed from). Rendering never runs a layout engine, on the server or the client. Sequence and timeline layouts are arithmetic and need no library.

This is the Studio's poster lesson applied again: compute once on save, render cheaply, no worker and no headless browser. It also makes layout deterministic, so a diagram does not shift between deploys.

Motion is CSS only: edge dashes via `stroke-dashoffset`, a staggered reveal on first view, both disabled under `prefers-reduced-motion`. A client enhancement for hover highlighting of connected nodes is optional and lazy.

Narrow screens: `LR` flows re-lay out as `TD` from a second stored layout, rather than scaling text below a readable size. Sequence diagrams scroll horizontally inside their frame, the one accepted exception to the no horizontal scroll rule, contained and keyboard reachable.

### Bespoke figure registry

`src/features/figures/registry.ts` maps a stable id (`streak-dash-anatomy-v1`) to a lazy component, a props validator, a static fallback and a text alternative. The CMS stores the id and props. Removing an entry is a content change, exactly as for Streak Field looks: keep the id until no document uses it.

### Shared figure frame

Every figure kind is wrapped by one block shell with: `title`, `caption` (plain text), `textAlternative` (required, plain text, what the figure shows and the takeaway), `source` (optional), `width` (`text` | `wide` | `full` on the block grid), `theme` follows the Section band. The shell owns the `<figure>`, `<figcaption>`, the accessible table or list view, and the copy-link anchor.

### Prose ingestion

A write-only, virtual `markdown` field on `RichTextBlock` and on `NarrativeSection.body` owners. A `beforeValidate` hook converts it to Lexical with the package's Markdown converter and clears it. Lexical stays the only stored form, so there is never a second source of truth. Sending `markdown` to a block that already has edited Lexical content requires `replace: true`, so an agent cannot silently overwrite a person's edits. Verify the converter's API and node coverage on 3.88.0 during Phase 0.

### Media upload

`pnpm cms:upload <file> --alt "<text>" [--library <id>] [--caption "<text>"]`. Uses REST with a team key, never the Local API with access bypass. Requires alt text. Always creates media as internal. Prints the id. A person reviews and sets `public-approved`. The script refuses files over a size ceiling and strips EXIF. Screenshots of the admin must be checked for email addresses and keys before upload; the skill says so explicitly.

## Security and integrity

- Specs are data. Labels are plain text, rendered as text nodes. No HTML, no SVG fragments, no URLs except a validated `source.href` (https only).
- Hard ceilings on rows, nodes, edges, string lengths and nesting are part of the schema, so a spec cannot become a denial-of-service on layout or render.
- Layout runs under a time budget. On timeout the save fails with a clear message; it never stores a partial layout.
- Team-only access uses `authenticated` from `src/access/authenticated.ts`, never `Boolean(req.user)`, because MCP keys authenticate as `req.user`.
- The authoring key cannot delete, cannot touch media beyond find, and cannot publish. Publishing stays a human action in the admin with live preview.
- `specVersion` on every spec. The renderer supports every version that exists in stored content; a version is only retired after a content migration.

## Accessibility and performance gates

- Each figure exposes a text alternative and a data view (table for charts, ordered list of steps or messages for diagrams) in server HTML. This is also what the RAG walk and AEO read.
- Color is never the only channel: legend plus direct labels, shapes for decisions, line style for edge kinds.
- Tooltips reachable by keyboard focus. Focus order follows reading order.
- Contrast for marks at least 3:1 against both surfaces; text uses text tokens.
- No layout shift: the frame reserves its aspect ratio from the stored layout or the chart kind.
- The chart library loads lazily, near the viewport, in its own chunk. A page with no chart pays nothing. Diagrams ship no JavaScript by default.
- Budget: a long article with 8 charts and 8 diagrams stays inside the existing page performance targets in [performance-measurement.md](performance-measurement.md). Measure with that runbook, do not estimate.

## Phases and exit gates

Each phase ends with something usable and a written check. Do not start a phase while the previous gate is open.

**Phase 0. Decisions and corpus (no schema).**
- Settle the Open decisions below.
- Freeze an acceptance corpus from the 2026-09-19 write-up: its 8 charts and 8 diagrams re-expressed as specs, plus prose samples. These become fixtures and stories.
- Spike the layout engine on the corpus diagrams (see Open decisions, item 3). Spike the Markdown converter on the corpus prose.
- Gate: decisions recorded in this file, corpus committed as fixtures, both spikes written up with numbers.

**Phase 1. Prose and code.**
- Markdown ingestion on `RichTextBlock` and narrative bodies. Code block nestable, more languages.
- `lab-article` skill, first version: collection map, draft rule, block contracts, voice rules from `AGENTS.md`.
- Gate: an agent creates a text-and-code-only Lab draft over MCP from a fixture, a person edits it in the admin, a second agent update does not overwrite those edits without `replace`.

**Phase 2. Chart block.**
- Add the shadcn chart primitive with its story. Chart spec, validator, block, renderer, fallback table, stories for every kind on light and dark bands.
- Palette validated on both surfaces and recorded.
- Gate: all 8 corpus charts render from specs, pass the dataviz anti-pattern checklist, and match on mobile. Validation errors for five deliberately broken specs are specific enough that an agent fixes each in one retry.

**Phase 3. Diagram block.**
- Diagram spec, validator, save-time layout with stored result, graph renderer, sequence and timeline renderers, narrow-screen layouts, CSS motion, list fallback, stories.
- Gate: all 8 corpus diagrams render from specs with no overlapping labels at 360, 768 and 1440 wide. Save-time layout stays inside its time budget for the largest allowed spec. Zero client JavaScript on a diagram-only page.

**Phase 4. Media path and bespoke registry.**
- `cms:upload` script. Registry with the first two bespoke figures from the write-up (dash anatomy, curl versus gradient).
- Gate: an agent uploads a screenshot, references it in a draft, and it does not render publicly until a person approves it.

**Phase 5. The acceptance article.**
- Author the Streak Field write-up as a real Lab entry through the agent path, end to end, as a draft. A person reviews in live preview and publishes.
- Gate: published page passes the performance runbook and an accessibility pass. Time from brief to reviewable draft is recorded as the baseline for the next piece.
- Then write `docs/figures.md` (usage guide) and add one row to the "Where to look" table in `AGENTS.md`.

## Open decisions

1. **Where figure data lives.** Option A: figure blocks on the Lab Page composition only. Option B: a `figures` array on the Content Hub record, keyed like story beats, referenced from page blocks. Recommendation: **A for v1.** It is additive, it matches how media already works in composition, and nothing else consumes figures yet. Revisit B when a figure needs to appear on two surfaces or when the RAG walk should cite figures from the hub record. Designing B first would repeat the Studio v1 mistake of building the distribution model before anyone has used the thing.
2. **Schema library.** Recommendation: **zod**, because it yields TypeScript types, runtime validation with path-accurate messages, and JSON Schema for the MCP field descriptions from one definition. Accept the dependency, confine it to the figures feature and server code.
3. **Layout engine.** Candidates: `elkjs` (layered layout, orthogonal routing, groups, heavier) and `dagre` (smaller, simpler, weaker on groups and edge labels). It runs on the server at save time only, so client bundle size is not a factor. Recommendation: decide in the Phase 0 spike on the corpus; default to `elkjs` if both pass, for groups and label placement.
4. **Mermaid stopgap.** A lazy client Mermaid block would unblock the article sooner, at the cost of off-brand output, a heavy chunk and a block type that has to be migrated away. Recommendation: **skip it.** The article is not time-bound and the corpus diagrams are simple. Reconsider only if Phase 3 slips past two weeks.
5. **Is this piece a Lab entry or a Post?** Lab Pages require a Lab Project and present a story model built for projects. A technical essay may fit Posts better, with the Lab Project for the Studio linking to it. Figure blocks should be nestable on both so the choice stays editorial. Decide before Phase 5.

## Migration notes

Schema lands in Phases 1 to 4 and is additive throughout: new block tables, a JSON column per spec, a JSON column for stored layout, virtual fields (no column). Follow the repo rules: push in dev, ask before `pnpm migrate:create`, one migration covering every field in the branch, run `pnpm check:migrations`.

Expected `migrate:create` prompts, to be confirmed against the real diff when each phase is built:

1. New block tables for chart, diagram and bespoke figure, and their `_v` version twins, under every parent that nests the Section run: **create table** (brand new).
2. New enum types for `kind`, `width`: **create** (brand new). No existing enum is altered, so the `ALTER TYPE ... ADD VALUE` transaction rule is not triggered.
3. Code block `language` gains options. This alters an existing enum. **Split into its own migration** and do not use a new value in the same `up()`, per the rule in `AGENTS.md`.

No renames are expected. If a prompt offers a rename for any figures table, the answer is create.

## Risks

| Risk | Mitigation |
| --- | --- |
| Diagram layout quality is worse than a hand-drawn figure | Corpus-driven spike before committing; `emphasis`, groups and direction give the author enough control; the bespoke registry is the escape hatch. |
| Spec surface grows until it is a drawing tool | Every new option needs two real figures that require it. Otherwise it is a bespoke figure. |
| Agent overwrites human edits | `replace` flag on Markdown ingestion, drafts only, Payload versions as the undo. |
| Chart library weight | Lazy chunk near viewport, server table fallback, measured against the runbook. |
| Converter loses Markdown features | Phase 0 spike lists unsupported nodes; the skill tells the agent which syntax is allowed. |
| Stored layout goes stale after a renderer change | Layout stores the spec hash and a layout version; a mismatch recomputes on next save, and a one-off script can recompute all. |

## Related

- [mcp.md](mcp.md): agent authoring, keys, capability model.
- [streak-field-studio.md](streak-field-studio.md): the compute on publish, render cheaply pattern this plan reuses.
- [blocks-reorg-roadmap.md](blocks-reorg-roadmap.md) and [block-grid-roadmap.md](block-grid-roadmap.md): Section and grid contracts figure blocks must follow.
- [editorial/content-hub.md](editorial/content-hub.md): the story model behind Open decision 1.
- [performance-measurement.md](performance-measurement.md): the capture runbook for the Phase 5 gate.
