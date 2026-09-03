# Block layout grid roadmap

Status: contract defined, Phase 1 (Section heading) and Phase 2 (Media and content + Statement) shipped 2026-09-02. Phase 3 (Pair offset, Caption) pending. Zero schema: this is presentational only, no migrations, no admin changes. Chromatic baseline churn expected per phase. Agents: read this doc before any block layout/grid task instead of re-auditing the block system. Companion to [blocks-reorg-roadmap.md](blocks-reorg-roadmap.md), which owns taxonomy, Sections, and admin naming; this doc owns how the same blocks lay out horizontally.

Scope: the nine reorganized blocks (Section heading, Media and content, Media groups). Blocks outside the reorg (heroes, featured work, galleries, forms) keep their bespoke layouts until they enter the taxonomy.

---

## 1. Ground truth (audited 2026-09-02)

Before this work there was no shared horizontal system. Five competing truths across nine blocks:

| Truth | Blocks | Example |
|---|---|---|
| 12-column grid, `lg` mount | Standard (Split layout), Offset | `lg:grid-cols-12 lg:gap-24`, `col-span-6` + `col-span-4 col-start-9` (pattern duplicated verbatim in both files) |
| Bespoke fraction tracks | Standard (Left), Stacked, Pair, Pair offset | `md:grid-cols-[12.9%_minmax(0,61%)_1fr]` (Paper-frame pixels as percentages), `[1fr_1fr_0.5fr]`, `[2fr_1fr]`, `[minmax(0,1fr)_minmax(0,0.5fr)_minmax(0,0.25fr)]` |
| Fixed rem track | Split narrow | `md:grid-cols-[minmax(0,1fr)_17rem]` |
| Even halves + max-width clamp | Split | `md:grid-cols-2` with `max-w-xl` on the text cell |
| Flex + measure | Statement, Caption, Standard (Centered, Statement) | `flex justify-end` + `max-w-2xl`; `mx-auto max-w-3xl` |

Supporting symptoms of the same disease:

- Gap zoo: `gap-4`, `gap-6`, `gap-8`, `gap-12`, `gap-24`, mixed per breakpoint per block.
- Breakpoint zoo: side-by-side layout mounts at `md` in some blocks, `lg` in others.
- Width by three unrelated mechanisms: column spans, `max-w-*` clamps, and `w-4/5` fractions, sometimes two of them on the same element (Pair: `max-w-80 md:max-w-lg` inside a `1fr` track, plus `pr-8 md:pr-24` as air).
- Offsets by four mechanisms: spacer `<div aria-hidden>`, trailing phantom tracks (`0.5fr`, `0.25fr`), `ml-auto`, and padding.
- Container inconsistency: `Container` component (Standard, Stacked), raw `div.container` (Offset, Split, Split narrow, Pair, Caption), raw `px-gutter lg:pe-0` (Pair offset).
- `eyebrowClassName` restated locally in `RichTransition` instead of imported from `shared/typography` (tracking value differs: `0.2em` vs the shared one).

None of this is authorable; it is all presentational code, so it can change block by block with no schema or content impact.

---

## 2. The contract

One grid, stated once, everywhere:

- **`BlockGrid`** (`src/blocks/shared/grid.tsx`) is the only place the grid is defined: `grid grid-cols-1 gap-grid md:grid-cols-8`.
- **8 equal columns** (`minmax(0, 1fr)` via `grid-cols-8`), mounting at **`md`**; a single column stack below.
- **One gap value**: `--spacing-grid` in `globals.css` `@theme` (currently `2rem`), consumed as the `gap-grid` utility. It is both the column gap and the row/stack gap. Tune the token, never a call site.
- The grid sits **inside the page column** (`container`, 96rem + gutters), so column 1 begins at the page gutter. At the 1440px inner width a column is 152px.
- Blocks place children with plain Tailwind utilities: `md:col-start-*` and `md:col-span-*`. That is the whole API.

Division of labor (each concern has exactly one owner):

| Concern | Owner |
|---|---|
| Track list, column count, gap, mount breakpoint | `BlockGrid` + `--spacing-grid` |
| Horizontal width of a thing | its column span |
| Horizontal offset of a thing | its start column |
| Vertical rhythm inside a text cluster | `text-stack` (em ladder, globals.css) |
| Vertical rhythm between grid cells | the grid's row gap (same token) |
| Vertical rhythm of the block itself | `Section` / `SectionBand` (`BAND_SPACING`, blocks-reorg doc) |
| Reading measure of centered prose | `max-w-*` (allowed only where the layout is measure-based, not grid-based; see rules) |

Rules (Tailwind philosophy: utilities compose at call sites, systems live once):

1. Never restate `grid-cols-8`, the gap, or the breakpoint at a call site. If a block cannot express its layout on `BlockGrid`, that is a contract conversation (open decision below), not a local override.
2. No `max-w-*` on grid cells. A cell's width is its span. `max-w-*` survives only in measure-based layouts (centered stacks) and inside prose.
3. No spacer cells, phantom tracks, `ml-auto`, or padding-as-offset. Offsets are `col-start-*`.
4. No arbitrary track values (`grid-cols-[...]`) in the nine blocks.
5. Asymmetry is columns: a 2:1 split is span 5 + span 3 (media heavy) or span 4 + span 3 with a rest column, never `2fr/1fr`.
6. Vertical art direction (the Offset block's `md:pt-24` drop) stays a call-site utility; the grid does not own it.

### Section heading defaults

The default Standard arrangement (Layout: Left) on the 8-column grid:

- Heading cluster (eyebrow + heading): starts column 2, spans 4 (columns 2-5).
- Body: spans 3, under the heading, same start (columns 2-4).

---

## 3. Per-block migration map

| Block (admin name) | Component | Before | After (8-col) | Status |
|---|---|---|---|---|
| Standard, Left | `rich-transition/RichTransition.tsx` | `md:grid-cols-[12.9%_minmax(0,61%)_1fr]` + spacer div + `max-w-120` body inside `text-stack` | heading cols 2-5, body cols 2-4 as its own cell | DONE 2026-09-02 |
| Standard, Split | same file | `lg:grid-cols-12 lg:gap-24`, span 6 + span 4 start 9 | heading cols 1-4, body cols 6-8; mounts `md` (was `lg`) | DONE 2026-09-02 |
| Standard, Centered / Statement | same file | centered `text-stack` + reading measures (`max-w-3xl` / `max-w-160` / `max-w-xl`) | unchanged: measure-based by design, exempt per rule 2 | DONE (no change) |
| Offset | `feature/HeadingOffset/Component.tsx` | duplicated 12-col pattern, `lg` mount, `lg:pt-24` | heading cols 1-4, body cols 6-8 + `md:pt-24`; mounts `md` | DONE 2026-09-02 |
| Stacked (`fullMedia`) | `full-media/FullMedia.tsx` | content row `md:grid-cols-[1fr_1fr_0.5fr]` then `lg:max-w-3xl lg:grid-cols-2` + `lg:ml-auto` | heading cols 1-3, body cols 4-6 (right layout: heading 3-5, body 6-8); contained media spans all 8 on the same grid, full-width media stays edge to edge with the content re-entering the page column | DONE 2026-09-02 |
| Split (`mediaContentSplit`) | `media-content-split/MediaContentSplit.tsx` | `md:grid-cols-2` + `max-w-xl` text clamp | media cols 1-4, content cols 5-7 (mirrored for `layout: right`: media 5-8, content 2-4); content still vertically centered via `items-center` on the grid | DONE 2026-09-02 |
| Split narrow | `split-content/SplitContentNarrow.tsx` | `md:grid-cols-[minmax(0,1fr)_17rem]` | media spans 5 at `md` and 6 from `lg`, text takes the rest (3, then 2): the `lg` pair matches the old 17rem column at the design width, and holding 3 columns at `md` keeps the copy readable where 2 would be too tight | DONE 2026-09-02 |
| Pair (`imagePair`) | `image-pair/ImagePair.tsx` | `md:grid-cols-[2fr_1fr]` + `max-w-80`/`max-w-lg` + `pr-8 md:pr-24` | landscape 5 cols, portrait 3; text in row 2 spanning 3 from its figure's start column; `pr` and `max-w` air hacks gone | DONE 2026-09-02 |
| Pair offset (`splitImageOffset`) | `split-image-offset/SplitImageOffset.tsx` | `px-gutter lg:pe-0` + `[1fr_0.5fr_0.25fr]` tracks + `w-4/5` | hardest: right-bleed is a container concern (`container-bleed-e` family), not a grid concern; separate the bleed shell from an inner 8-col placement | Phase 3 |
| Statement | `feature/ImageStatement/Component.tsx` | flex `justify-start/end` + `max-w-2xl` | caption cols 1-4 (left) / 5-8 (right); contained media spans all 8 on the same grid, full-bleed media edge to edge with the caption re-entering the page column | DONE 2026-09-02 |
| Caption (`mediaBlock`) | `MediaBlock/Component.tsx` | `mx-auto max-w-3xl` / `max-w-md` per `size` | candidate to stay measure-based (centered figure); decide with D7 of the reorg doc (its `size` field redesign) | Phase 3 |

Phase 3 column proposals are starting points to be tuned visually per block, the same way Left was specified. The contract (section 2) is the fixed part; spans are art direction, and the shipped Phase 2 spans remain tunable per block.

Placement gotcha learned in Phase 2: auto-placement only moves forward. In a mirrored layout the media cell stays first in source order (mobile stacks media first) but sits in later columns, so the following cell would wrap to the next row. Pin both cells with `md:row-start-1` whenever a later-column cell precedes an earlier-column one.

---

## 4. Rollout

### Phase 1: system + Section heading. DONE 2026-09-02

- [x] `--spacing-grid: 2rem` token in `globals.css` `@theme` (single gap value, `gap-grid` utility).
- [x] `src/blocks/shared/grid.tsx`: `BlockGrid`, the one grid definition.
- [x] Standard Left rebuilt per the default spec (heading 2-5, body 2-4). Spacer div and `max-w-120` gone; body is a grid cell, so the heading-to-body gap is now the grid token instead of `text-stack`'s 1em step.
- [x] Standard Split and Offset mapped from 12-col to 8-col (4 + 3 with one rest column; proportions match the old 6/12 + 4/12 start 9). Mount moved `lg` to `md`.
- [x] Centered and Statement layouts left measure-based on purpose.

Visual deltas accepted in Phase 1: side-by-side from `md` instead of `lg` on Split/Offset; stack gap on mobile now `2rem` (was `3rem`); Left heading narrower per the new spec (spans 4 of 8, was 61%).

### Phase 2: Media and content + Statement. DONE 2026-09-02

- [x] Stacked, Split, Split narrow, Pair, Statement onto `BlockGrid` per the map above. Spans follow the proposals; tune visually per block as needed.
- [x] Container usage unified: all five now use the `Container` component (raw `div.container` gone from the seven grid-compliant blocks) and the local width/air hacks (`max-w-xl`, `max-w-3xl`, `max-w-2xl`, `max-w-80`/`max-w-lg`, `pr-8`/`pr-24`, `ml-auto`) are deleted.

Visual deltas accepted in Phase 2:

- Every gap standardized to the token: Split's `md` gap was 3rem, Pair's 1.5rem, Statement's media-to-caption 1.5rem, Stacked's mobile heading-to-body 1rem; all now 2rem.
- Pair figures no longer resolve to exactly equal heights: the old `2fr/1fr` tracks made 16:10 and 4:5 match; 5+3 columns approximate it and the portrait runs a little taller. If equal bottoms matter, that is a span/aspect tuning conversation, not a grid exception.
- Statement caption width is now span 4 (~656-704px in the page column) instead of `max-w-2xl` (672px); near-identical at the design width.
- Split narrow text column is wider at `md` (3 columns) than the old fixed 17rem, converging from `lg`.

### Phase 3: the holdouts

- [ ] Pair offset: split the right-bleed shell from the inner grid, then place on `BlockGrid`.
- [ ] Caption: decide grid vs measure with reorg D7.
- [ ] `RichTransition` local `eyebrowClassName` reconciled with `shared/typography` (one tracking value).

### Phase 4: enforcement (after all nine comply)

- [ ] Grep gate or lint rule: no `grid-cols-[` arbitrary tracks and no `grid-cols-12` inside `src/blocks/` for the nine block directories.
- [ ] Remove the `@source inline("lg:col-span-*")` safelist entries in `globals.css` if the 12-col consumers are gone (they exist for rich-text column embeds; verify before deleting).

---

## 5. Open decisions

| # | Decision | Recommendation |
|---|---|---|
| G1 | `--spacing-grid` value | `2rem` shipped. Revisit once against a media-heavy page; candidates are `1.5rem` (denser media grids) or `var(--spacing-gutter)` (locks gap to the page gutter, makes it responsive 1rem/3rem, but also makes the mobile stack gap 1rem, too tight) |
| G2 | Row gap = column gap | Shipped as one token both axes. If media rows need more air than columns, add `gap-y-*` at the call site per block (art direction), not a second token |
| G3 | Should Centered/Statement snap to the grid (e.g. span 6 centered = cols 2-7)? | No for now: centered prose is measure-driven; a 6-column span at 2xl is wider than the reading measure. Revisit only if the two systems visibly disagree on a page |
| G4 | Full-bleed media inside grid blocks (Stacked `width: full`, Statement `imageWidth: full`) | Bleed stays a container/shell concern; the grid only ever lives inside the page column. Media escapes the container, content re-enters it and the grid |
| G5 | Do blocks outside the nine adopt `BlockGrid`? | Only when they enter the taxonomy (reorg Phase E). Do not migrate heroes/galleries opportunistically |

---

## Appendix: how to lay out a block on the grid

```tsx
import { BlockGrid } from '@/blocks/shared/grid'

// inside the block's container:
<BlockGrid>
  <div className="text-stack md:col-span-4 md:col-start-2">
    {/* eyebrow + heading */}
  </div>
  <div className="md:col-span-3 md:col-start-2">
    {/* body */}
  </div>
</BlockGrid>
```

- Width = span. Offset = start. Nothing else.
- Below `md` cells stack in source order with the same gap; order cells for the mobile reading order and use `md:order-*` only if the desktop placement must differ.
- The block still owes its band to `Section` (spacing/theme) and its copy rhythm to `text-stack`; the grid owns only horizontal placement.
