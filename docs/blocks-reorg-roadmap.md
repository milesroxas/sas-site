# Blocks reorg and Sections roadmap

Status: Phases A and B shipped to main (a06a1ea, 2026-09-02; CI applies migration `20260902_191423`). Phase B2 (collection coverage: the same run offered by all six composition surfaces, plus drawer group order) shipped 2026-09-02 (a472523, migration `20260902_201235_block_coverage`). Phase C is being done MANUALLY in admin (cheat sheet below; the script remains as fallback). Phase D remains future work. Agents: read this doc before any block naming/organizing task instead of re-exploring the block system.

Scope: Pages, Posts, WorkPages, LabPages, ExpertisePages, AudiencePages (Posts added in B2, 2026-09-02). Blocks not named below stay as they are for now. Home global is out of scope: it keeps the set it had before B2 (no Section, no Pair or Pair offset), so the global's schema does not grow for blocks it has never offered.

---

## 1. Ground truth (audited 2026-09-02)

### Production content inventory

Published and draft versions are identical for every doc. Only two documents use any in-scope block.

| Collection | Docs | In-scope block usage |
|---|---|---|
| Pages | 1 (`about-us`) | none (`content` only) |
| WorkPages | 5 | `adacore` and `vault-workforce-screening` carry all of it |
| LabPages | 0 | none |
| ExpertisePages | 5 | none (`content` only) |
| AudiencePages | 4 | none (`content` only) |

Per-block instance counts (all on the two work pages):

| Block slug | Count | Stored values that matter |
|---|---|---|
| `fullMedia` | 7 | all `width: contained`; aspect `16-9` x6, `21-9` x1; `showContent` true x4 (contentPosition left x1, right x3), false x3; theme light x6, neutral x1 |
| `splitContentNarrow` | 5 | imagePosition right x3, left x2; theme light x4, neutral x1 |
| `featureImageStatement` | 3 | textPosition right x2, left x1; textSize small x2, default x1; imageWidth contained x3; aspect `16-9` x2, `responsive` x1; theme light x2, neutral x1 |
| `caseStudyTransition` | 2 | layout `left` x1 (theme neutral), `centered` x1 (theme light) |
| `splitImageOffset` | 1 | captionPosition left; theme light |
| `imagePair` | 0 | free to change anything |
| `mediaBlock` | 0 | free to change anything |
| `featureHeadingOffset` | 0 | free to change anything |
| `labTransition` | 0 | LabPages empty |

Consequence: the real migration surface is 18 block instances on 2 documents. Three of the nine blocks have zero production data and can be reshaped freely.

### Code facts that shape the plan

- Groups come from one enum: `src/blocks/shared/groups.ts` (`BLOCK_GROUPS`). Drawer group order = first-appearance order in each block array (`src/fields/pageLayoutBlocks.ts`, `src/blocks/case-study/config.ts:228`, `src/blocks/lab/config.ts:122`). `BlocksDrawerTabs` reads group names from rendered DOM, so renaming groups needs no changes there.
- "Rich transition" is two blocks: `caseStudyTransition` (`wp_transition`) and `labTransition` (`lp_transition`), both built from `transitionFields()` in `src/blocks/shared/fields.ts`.
- The Composition field is `name: 'layout', type: 'blocks', label: 'Composition'` written inline per collection (Pages `src/collections/Pages/index.ts`, WorkPages `src/collections/WorkPages/index.ts`, LabPages `src/collections/LabPages/index.ts`, Expertise/Audience via `src/collections/segmentPage.ts`). The "Add Composition" button text comes from the field `labels`.
- Shared multi-collection blocks already use the function-form `dbName` (`({ tableName }) => ...`); `featureHeadingOffset` and `mediaBlock` have none, `mediaBlock` also has no `labels`.
- No nested `blocks` field exists anywhere yet. Postgres stores block rows in per-collection tables keyed by block slug with a `_path` column, so nesting an existing block under a Section should keep its table and only change `_path` values. Verify this locally before trusting it (Phase B checklist).
- Spacing is not authorable today. `Section` in `src/blocks/shared/section.tsx` owns `BAND_SPACING` (`none | normal | loose`) and `themeClasses` (`light | dark | neutral | brand`); each block hardcodes its spacing. The `bare` prop already exists as the seam for "shell owned by someone else".
- The same-slug-different-fields-per-collection pattern already exists (`withStoryBeatSource`), so a per-collection Section factory is idiomatic here.

---

## 2. Target taxonomy

### Block renames (labels and groups only; slugs do not change)

| Slug (unchanged) | Old group / label | New group | New label | Notes |
|---|---|---|---|---|
| `caseStudyTransition` | Narrative / Rich transition | Section heading | Standard | Work variant |
| `labTransition` | Narrative / Rich transition | Section heading | Standard | Lab variant, same label |
| `featureHeadingOffset` | Statements / Feature: heading offset | Section heading | Offset | gains Body size select |
| `fullMedia` | Media / Full media | Media and content | Stacked | see D1: existing instances all become Stacked |
| NEW `mediaContentSplit` | (new block) | Media and content | Split | net-new visual, additive |
| `splitContentNarrow` | Split layouts / Split content (narrow) | Media and content | Split narrow | |
| `imagePair` | Media / Image pair | Media and content | Pair | zero prod data |
| `splitImageOffset` | Media / Split image offset | Media and content | Pair offset | |
| `featureImageStatement` | Statements / Feature: image statement | Media | Statement | |
| `mediaBlock` | Media / (no labels, shows "Media Block") | Media | Caption | add `labels` |

Slugs, `dbName`s, and tables stay put. That is the single biggest risk reducer in this plan: admin naming is fully decoupled from storage, so the entire rename is a zero-schema change. Slug renames would cascade through tables, versions tables, payload-types, three renderers, and MCP-authored content for no editor-visible benefit.

New `BLOCK_GROUPS` entries: `sectionHeading: 'Section heading'`, `mediaContent: 'Media and content'` (matching the repo's sentence-case convention per `docs/cms-naming.md`; see D5 if you want Title Case instead). `Narrative`, `Statements`, `Split layouts` keep their remaining blocks.

### Standard select vocabulary

| Select | Options (stored value) | Default | Where |
|---|---|---|---|
| Layout | Left (`left`), Center (`center`, only where it exists), Right (`right`) | `left` | per block below |
| Body size | Small (`small`), Medium (`medium`), Large (`large`) | `medium` | Section heading blocks |
| Theme | Inherit (`inherit`), Secondary (`secondary`), Accent (`accent`), Inverted (`inverted`) | `inherit` | Section block only |
| Aspect ratio | 16:9 (`16-9`), 3:2 (`3-2`), 21:9 (`21-9`) | `16-9` | media blocks (matches existing values) |
| Spacing | Default (`default`), Tight (`tight`), Loose (`loose`), None (`none`) | `default` | Section block only |

Strategy for existing fields: **relabel, do not rename or re-value in the first pass.** A Payload select's `label` and per-option labels are free; the field `name` is a DB column and the option values are a PG enum. So `imagePosition` gets `label: 'Layout'` and keeps its name and values; `caseStudyTransition.layout` keeps value `centered` labeled "Center". Value normalization (`centered` to `center`, dropping `split`/`statement`/`responsive`) is deferred to Phase D where it gets the full enum-migration treatment.

Theme value mapping (Section stores the new values natively; existing block `theme` fields are untouched until Phase D):

| Section value | Renders as |
|---|---|
| `inherit` | no band override (transparent, page surface) |
| `secondary` | `themeClasses.neutral` |
| `accent` | `themeClasses.brand` |
| `inverted` | `themeClasses.dark` |

### Per-block select mapping

| Block | Field today | Admin label becomes | Values | Action |
|---|---|---|---|---|
| Standard (`*Transition`) | `layout` (left/centered/split/statement, default centered) | Layout | keep values, relabel; hide `split`/`statement` options from new picks in D | relabel now; default change to `left` is new-rows-only, safe |
| Offset | (none) | Body size | small/medium/large, default medium | new field, additive |
| Stacked (`fullMedia`) | `contentPosition` (left/right, default left) | Layout | keep | relabel |
| Split (new) | new `layout` | Layout | left/right | new block, native values |
| Split narrow | `imagePosition` (left/right, default right) | Layout | keep values; spec default is `left`, change affects new rows only | relabel |
| Pair | `portraitPosition`, `textPosition` (under-portrait/under-landscape) | Layout: primary media, Layout: content | zero prod rows: free to redesign as left/right (D6) | can rename fields safely, no data |
| Pair offset | `captionPosition` (left/right, default right) | Layout | keep | relabel |
| Statement | `textPosition` (right/left, default right) | Layout | keep; `textSize`/`imageWidth`/`aspectRatio` fate is D8 | relabel |
| Caption (`mediaBlock`) | `size` (full/inset/small) | see D7 | zero prod rows | decide in D7 |

### Collection coverage (B2, 2026-09-02)

The Section-nestable run is defined once in `src/blocks/shared/section-blocks.ts` (`sectionNestableBlocks`) and offered by every composition surface, nested inside that collection's Section instance and spread into its top-level drawer list. One array = nested and top-level offerings can never drift, and no collection can quietly fall behind the taxonomy.

| Block | Pages | Posts | Work | Lab | Expertise | Audience | Home |
|---|---|---|---|---|---|---|---|
| Section | PageSection | PageSection | WorkSection | LabSection | SegmentSection | SegmentSection | not yet |
| Standard (`richTransition`; Work: `caseStudyTransition`) | yes | yes | yes (story variant) | yes | yes | yes | held |
| Offset (`featureHeadingOffset`) | yes | yes | yes (story variant) | yes | yes | yes | yes |
| Stacked (`fullMedia`) | yes | yes | yes (story variant) | yes | yes | yes | yes |
| Split (`mediaContentSplit`) | yes | yes | yes (story variant) | yes | yes | yes | yes |
| Split narrow (`splitContentNarrow`) | yes | yes | yes (story variant) | yes | yes | yes | yes |
| Pair (`imagePair`) | yes | yes | yes (story variant) | yes | yes | yes | held |
| Pair offset (`splitImageOffset`) | yes | yes | yes (story variant) | yes | yes | yes | held |
| Statement (`featureImageStatement`) | yes | yes | yes (story variant) | yes | yes | yes | yes |
| Caption (`mediaBlock`) | yes | yes | yes | yes | yes | yes | yes |

Two things stay collection-owned on purpose:

- **Standard on Work** is its own block: `caseStudyTransition` (`wp_transition`, live in production) puts the same copy fields behind a canonical Case Study story picker. Everywhere else Standard is the generic `richTransition` (`src/blocks/rich-transition/config.ts`, per-parent `*_transition` tables) in the shared run, added 2026-09-03; it replaced the lab twin `labTransition` (`lp_transition`, zero production rows), which carried exactly these fields under a static `dbName`. Work builds its run by hand so it never offers both.
- **Work variants** are the `withStoryBeatSource` wrappers: same slug and table, extra story-beat fields. Caption carries no copy fields, so Work offers the plain block.

### Drawer group order

Every composition surface leads with the reorganized groups, then its legacy groups in the order they already had:

`Structure > Section heading > Media and content > Media > (legacy)`

| Surface | Full order |
|---|---|
| Pages, Expertise, Audience | Structure, Section heading, Media and content, Media, Text, Statements, Interactive, Lists & grids, Forms & CTAs, Custom |
| Posts | Structure, Section heading, Media and content, Media, Lists & grids |
| Work Pages | Structure, Section heading, Media and content, Media, Narrative, Statements, Interactive, Lists & grids |
| Lab Pages | Structure, Section heading, Media and content, Media, Narrative, Interactive, Lists & grids |
| Home (global, no Section) | Section heading, Media and content, Media, Text, Statements, Interactive, Lists & grids, Forms & CTAs, Custom |

Order comes only from each block array (`admin.group`, first appearance wins), so keep each group's blocks contiguous: Narrative (the story-section blocks) sits after the run, the column-builder `content` block closes every top-level list and every Section's nested list under `Custom` (added 2026-09-03 via `sectionChildBlocks`; Text now holds only Rich text, inside the run), and the legacy Media blocks (`caseStudyMediaShowcase`, `labMediaShowcase`, `scrollGallery`) stay inside the Media group beside Statement and Caption. `Structure` is still the group label for the Section block itself.

Rendering follows the same single-definition rule: `src/blocks/shared/content-block-renderer.tsx` owns the slug-to-component map (`sectionChildComponents`) and the entrance rules for the run. `RenderBlocks` (Pages, Posts, Home, segment pages) spreads that map into its own; `RenderLabBlocks` delegates to it for any block in the run; `RenderCaseStudyBlocks` keeps its own cases because it resolves story copy first.

---

## 3. Section block design

### Authoring model

Editor opens Composition tab, clicks **Add Section** (was "Add Composition"), optionally checks **Customize section** to reveal Theme and Spacing, then clicks **Add Block** inside the section. Payload's built-in per-instance `blockName` input covers naming a section in the sidebar; no custom label field needed.

### Config sketch

```ts
// src/blocks/section/config.ts
export const sectionBlock = (blocks: Block[], interfaceName: string): Block => ({
  slug: 'section',
  interfaceName,
  dbName: ({ tableName }) => `${tableName}_section`,
  labels: { singular: 'Section', plural: 'Sections' },
  fields: [
    { name: 'customize', type: 'checkbox', label: 'Customize section', defaultValue: false },
    {
      type: 'row',
      admin: { condition: (_, siblingData) => Boolean(siblingData?.customize) },
      fields: [
        { name: 'theme', type: 'select', defaultValue: 'inherit',
          options: ['inherit', 'secondary', 'accent', 'inverted'], admin: { width: '50%' } },
        { name: 'spacing', type: 'select', defaultValue: 'default',
          options: ['default', 'tight', 'loose', 'none'], admin: { width: '50%' } },
      ],
    },
    { name: 'blocks', type: 'blocks', labels: { singular: 'Block', plural: 'Blocks' }, blocks },
  ],
})
```

Per-collection instances (same slug, different nested lists and interfaces, mirroring `withStoryBeatSource`): `PageSection`, `WorkSection`, `LabSection`, `SegmentSection`. All four table shapes are identical, and the function `dbName` is mandatory since the slug lives in five collections (see the shared-block dbName hazard).

Initial nested `blocks` lists contain **only the nine reorganized blocks** (per collection availability). Rich text (`richText`, Text group, 2026-09-03) is the first block added to the run since: born on the Section and grid contracts, it joins `sectionNestableBlocks` directly, so every surface that spreads the run offers it (Work Pages build their run by hand and do not yet). The legacy `content` block joins the nested list on every Section (2026-09-03) through `sectionChildBlocks` = run + Content, kept out of the run so Custom closes the top-level drawer; on Posts, Lab, and Work it is nested-only. Everything else stays top-level for now; collections' top-level lists become `[Section, ...existing list unchanged]`. Full "sections only at top level" is a Phase E goal once every remaining block is section-ready (D4).

### Rendering contract

- Section renders the band: `BAND_SPACING` + theme class, one `<section>` (or `RevealSection` on WorkPages).
- Children inside a section always render `bare` (the seam already exists on `Section`, `RichTransition`, `FeatureImageStatement`, and the case-study section components; thread it through the rest of the nine).
- `BAND_SPACING` grows a `tight` tier and a `default` alias for `normal` at the type level; only the Section block reads `default`/`tight`. Suggested start: `tight: 'py-8 md:py-12'`, tune on the demo page.
- Internal rhythm between multiple children in one section: recommend `space-y-16 md:space-y-24` on the section inner wrapper as a starting point (D3).
- Renderer wiring: `RenderBlocks.tsx` gets a `section` branch that renders the shell then maps children through the existing component map with `bare`; `RenderCaseStudyBlocks.tsx` and `RenderLabBlocks.tsx` get a `case 'section'` that recurses into their own switch so story-beat copy resolution keeps working. Reveal behavior (`blockRevealVariants`) applies to children as today.
- `inherit` theme renders no surface classes at all so adjacent sections blend with the page, matching how `light` behaves today as the resolve-to default.

---

## 4. Rollout: expand, migrate, contract

Sequenced so that every deploy leaves production rendering identically until the explicit content-migration step, and nothing is dropped until content is verified on the new path.

### Phase 0: preflight

- [ ] Land or shelve the in-flight working-tree changes (case-study/lab block extraction, contact pages) so this work starts from a clean main.
- [ ] `pnpm db:backup` (local) and confirm the prod backup/restore path is current.
- [ ] Export a JSON snapshot of the 15 docs' `layout` fields (script or MCP) into a dated file; this is the content-level undo for the migration script.
- [ ] Visual baseline: Storybook screenshot pass (existing DB-free Playwright flow) plus full-page screenshots of `adacore` and `vault-workforce-screening`.

### Phase A: cosmetic reorg (zero schema, deploy any time) — DONE 2026-09-02

- [x] Added `structure`, `sectionHeading` and `mediaContent` to `BLOCK_GROUPS`; moved the nine blocks' `admin.group` per the taxonomy table.
- [x] Updated `labels` on all nine (including adding `labels: Caption` to `mediaBlock`).
- [x] Relabeled the position/layout selects (`label: 'Layout'` etc.) without touching names or values; new-row defaults now `left` where the spec says so (existing rows keep their stored values).
- [x] Reordered the four block arrays; the Section-nestable run is one shared array per collection, spread into the drawer list so nested and top-level offerings cannot drift.
- [x] Retitled Storybook stories (`Blocks/SectionHeading/Standard`, `Blocks/SectionHeading/Offset`, `Blocks/MediaAndContent/{Stacked,Split,SplitNarrow,Pair,PairOffset}`, `Blocks/Media/{Statement,Caption}`). Chromatic baseline reset expected.
- [x] `pnpm generate:types`, `tsc --noEmit`, `pnpm lint` all clean.

### Phase B: sections and new blocks (additive schema) — CODE + MIGRATION DONE 2026-09-02, deploy pending

- [x] Built `src/blocks/section/`: `config.ts` (per-collection `sectionBlock` factory), `shared.ts` (option values + theme/spacing maps, the SSOT), `SectionBand.tsx` (the one shell all three renderers use), `Section.stories.tsx`.
- [x] `BAND_SPACING` gained `tight` (`py-8 md:py-12`); Section themes map onto the existing band surfaces (`inherit→light`, `secondary→neutral`, `accent→brand`, `inverted→dark`).
- [x] New `mediaContentSplit` block (config + presentational + adapter + story), offered on Pages, Home, and WorkPages beside `fullMedia`.
- [x] `bodySize` select on `featureHeadingOffset` (additive column) with render mapping and stories.
- [x] Composition field `labels` = Section/Sections in the four call sites; the button now reads **Add Section**.
- [x] Section instances: `PageSection`, `SegmentSection`, `WorkSection` (nests the story-beat-wrapped variants), `LabSection`. Home explicitly filters Section out for now.
- [x] `bare` threading: `RevealSection.client` takes `bare` (keeps entrance, drops band); adapters forward `bare`; all three renderers render Section children bare inside `SectionBand`, with each child's usual reveal wrapper preserved. The Section shell itself never animates.
- [x] Verified against the adapter's drizzle table map: nesting adds ONLY `{pages,work_pages,lab_pages,expertise_pages,audience_pages}_section` (+ `_v`) and `*_media_split` tables; every child block table keeps its exact name (`work_pages_full_media`, `wp_transition`, `pages_blocks_media_block`, ...). No renames, no re-homing.
- [x] `pnpm generate:types && pnpm generate:importmap`, `tsc --noEmit`, `pnpm lint`, `pnpm storybook:build` all clean.
- [x] `pnpm migrate:create sections-and-media-content-split` ran 2026-09-02 with **no create/rename prompts**, as predicted. Generated `src/migrations/20260902_191423_sections_and_media_content_split.{ts,json}`: creates (section + media_split tables, `body_size` enums/columns), default flips to `left`, and safe enum recreates for `text_position` (the options reorder). Normalizing `UPDATE`s were added by hand before every `text_position` cast in both `up()` and `down()` per the enum-cast rule; `pnpm check:migrations`, `pnpm check:migrations:drift`, `tsc`, and lint all pass. Never run `payload migrate` locally; CI applies it.
- [x] Committed and pushed to main (a06a1ea, 2026-09-02); CI applies the migration on deploy. Site renders byte-identical; editors can author with Sections immediately.

### Phase B2: collection coverage (additive schema): DONE 2026-09-02 (a472523)

Every composition surface now offers the same run. Posts joined the scope here: its Composition tab (sections after the article body) previously offered only Featured work.

- [x] `src/blocks/shared/section-blocks.ts` defines `sectionNestableBlocks`, the run stated once (Offset, Stacked, Split, Split narrow, Pair, Pair offset, Statement, Caption), ordered by `admin.group`.
- [x] Pages and the segment pages (Expertise, Audience) consume it, so they gained Pair and Pair offset (segments also gained Stacked and Split).
- [x] Posts: `postLayoutBlocks` = Section + the run + Featured work, Composition field `labels` now Section/Sections.
- [x] Lab: `labSectionBlocks` = the lab Standard transition + the run (was Standard + Split narrow only). Superseded 2026-09-03: `labTransition` removed, Lab nests `sectionNestableBlocks` directly and gets Standard from the generic `richTransition`.
- [x] Work: Caption added to `workSectionBlocks` (no story-beat wrapper, since it carries no copy fields).
- [x] Home held at its pre-B2 set (`homeExcludedBlocks`): no Section, no Pair, no Pair offset. Home does not adopt Sections yet, so growing the global's schema for blocks it never offered buys nothing.
- [x] `src/blocks/shared/content-block-renderer.tsx`, extracted from `RenderBlocks` so the map and the entrance rules for the run live once; `RenderLabBlocks` delegates to it (its bespoke `splitContentNarrow` case is gone), `RenderBlocks` spreads it into its page-only components.
- [x] `imagePair` and `splitImageOffset` joined `blockRevealVariants` (`underMedia`, the variant the work renderer already hardcoded); both adapters/presentationals now type on the shared `ImagePairBlock` / `SplitImageOffsetBlock` interfaces and forward `bare`.
- [x] `pnpm generate:types`, `pnpm generate:importmap` (no new imports), `tsc --noEmit`, `pnpm lint` clean.
- [x] `pnpm check:migrations:drift` previews the pending migration: 54 `CREATE TABLE`, 122 FK constraints, 230 indexes, 200 new enum types, **all additive**, no drop and no rename-shaped statement, so `migrate:create` should not prompt. Table names stay per-parent (`audience_pages_image_pair`, `posts_section`, `lab_pages_blocks_media_block`), confirming again that nesting under a Section does not re-home child rows.
- [x] `pnpm migrate:create block-coverage` run 2026-09-02 with **no create/rename prompts**, as predicted. `src/migrations/20260902_201235_block_coverage.{ts,json}` matches the preview exactly (200 `CREATE TYPE`, 54 `CREATE TABLE`, 122 FK alters, 230 indexes, no drop and no `ADD VALUE`). `pnpm check:migrations`, `pnpm check:migrations:drift` pass. Committed with the code (a472523); CI applies it.

### Phase C: content migration (18 instances, 2 docs) — MANUAL in admin (decided 2026-09-02)

Miles wraps the existing prod content into Sections by hand. `scripts/wrap-sections.ts` (idempotent 1:1 wrap, `--dry-run`, snapshot + `--restore`) stays in the repo as fallback and as the reference for the mapping below; it was rehearsed successfully against a local prod copy but will not run against prod.

**Constraint that makes this re-authoring:** Payload admin cannot move a block between fields. Each wrap = Add Section, recreate the block inside it (re-pick media, copy rich text, re-set selects), delete the original, drag the Section into position. Work in draft, check live preview, publish once per page.

**Mapping (theme: light -> Inherit, neutral -> Secondary):**

| Section settings | Applies to |
|---|---|
| Customize ON, Spacing Loose, Theme Inherit | light media blocks: Stacked, Split narrow, Pair offset (and Pair, Caption if ever used) |
| Customize ON, Spacing Loose, Theme Secondary | the one neutral Stacked on vault |
| Customize OFF (defaults) | contained Statement blocks; light Standard transitions |
| Customize ON, Theme Secondary, Spacing Default | the neutral Standard transition on vault |

**Per-page inventory (prod audit 2026-09-02, drafts identical to published):**

- `adacore` (6 in scope): 3 Stacked, 2 Statement, 1 Split narrow, all light. Out of scope, leave top-level: story section, featured work.
- `vault-workforce-screening` (12 in scope): 5 Stacked (1 neutral), 4 Split narrow, 1 Pair offset, 1 Statement (neutral), 2 Standard transitions (1 neutral, 1 light). Leave top-level: carousel, featured work.
- Every other doc uses only `content`: nothing to do.

**Editorial improvements while wrapping (encouraged, not required):**

- Transitions render `pb-0` today, which a Section cannot restate. Put each transition in the SAME Section as the blocks it introduces (transition first). Fixes the padding and gives real structure.
- Blocks inside one Section sit closer (space-y-16 md:space-y-24) than adjacent Sections do. Grouping same-theme runs into one Section is the intended look; one block per Section reproduces today's looser rhythm.

- [ ] adacore wrapped and published
- [ ] vault-workforce-screening wrapped and published
- [ ] Old versions note: `_v` history keeps the flat shape; restorable until Phase D drops columns.

### Phase D: contract and normalize (separate, later, lowest urgency)

Do these one PR at a time, each with its own migration, only after C has soaked:

- [ ] Remove `themeField()` from the nine blocks (theme now lives on Section). Column drops; content already migrated. Restoring pre-C versions after this loses per-block theme, accepted.
- [ ] Enum normalization where wanted: `centered -> center` on the transition `layout`, drop `split`/`statement` (0 prod uses, verify again first), decide `responsive` on Statement (1 prod use, D8). Every one of these follows the text-to-enum hazard rules: normalize prod values with `UPDATE`s before any cast, never `ADD VALUE` plus use in one `up()`, `pnpm check:migrations` after each.
- [ ] Optional field renames for code cleanliness (`imagePosition -> layout`, Pair redesign per D6). Each is a column rename: migrate:create will prompt, answer **rename** (Appendix A pattern).
- [ ] Retire top-level availability of the nine blocks (drawer offers them only inside Sections). Config-only, no schema.

### Phase E (future, out of scope now)

Sections-only top level per collection once every remaining block is nestable or explicitly top-level-only (D4); Home global adoption; merging adjacent same-theme sections editorially.

---

## 5. Storybook plan

- Phase A: retitle the eight existing story files to the new group taxonomy; no story logic changes.
- Phase B adds: `Blocks/Section` (theme x spacing matrix, multi-child rhythm, customize on/off), `Blocks/Media And Content/Split`, Offset `bodySize` variants.
- Fixtures: add `sectionFixture(blocks, overrides)` builder to `src/blocks/fixtures.ts`; regenerated payload-types will type it for free.
- Chromatic: expect one baseline-reset PR (A) and one additive PR (B). TurboSnap runs on every push regardless.

---

## 6. Risk register

| Risk | Mitigation |
|---|---|
| Content loss during C | Additive-first sequencing; JSON snapshot + DB backup; dry-run diff; only 2 docs actually change; script idempotent |
| Nested blocks secretly re-table child rows (assumption in section 1 wrong) | Phase B local verification step before any migration is generated; if wrong, C becomes "script rewrites docs via API" anyway, which re-homes rows correctly by construction |
| Double band (section py + child py) | `bare` threading is part of the Phase B definition of done; section stories include multi-child case |
| migrate:create drift vs main (parallel workspaces) | `pnpm check:migrations:drift`; regenerate after rebase per conductor rules |
| Enum hazards in D | normalize-first UPDATEs, one enum change per migration, `check:migrations` gate |
| Version history restores after D drop columns | Accepted; documented above; keep snapshot file |
| Chromatic baseline churn | isolate retitles in one PR |
| Editors confused mid-transition (Section plus legacy top-level blocks) | Section listed first, button says Add Section; short Loom/notes for editors; Phase D removes the duplicates from the drawer |

---

## 7. Open decisions

| # | Decision | Recommendation |
|---|---|---|
| D1 | ~~Do all 7 `fullMedia` instances become **Stacked**?~~ | TAKEN: slug kept, relabeled Stacked, zero data movement. Split is net-new. Still review the 7 visually during the prod dry-run |
| D2 | ~~Split block spec~~ | TAKEN: even `md:grid-cols-2` grid, media one column at an editor-chosen aspect (16:9 / 3:2 / 21:9), content stack the other; `layout: left/right`; same `source` pull as siblings |
| D3 | ~~Rhythm inside one section~~ | TAKEN: `SECTION_CONTENT_CLASS = 'space-y-16 md:space-y-24'` in `src/blocks/section/shared.ts`; tune there only |
| D4 | Which blocks are permanently top-level-only | Likely `scrollGallery`, `caseStudyMediaShowcase`, `featuredWork` (pinned/full-bleed shells). Decide before Phase E |
| D5 | ~~Group name casing~~ | TAKEN: repo sentence case (`Section heading`, `Media and content`) |
| D6 | Pair select semantics (`textPosition` under-portrait/under-landscape vs Left/Right) | Zero prod rows: redesign freely in D to `primaryPosition: left/right` + `contentPosition: left/right` |
| D7 | Caption block: keep `size` (full/inset/small) or replace with Layout | Zero prod rows: replace with the standard vocabulary if the visual supports it, else keep `size` and skip Layout |
| D8 | Statement extras (`textSize`, `imageWidth`, `aspectRatio` incl. `responsive`, used once) | Keep all in A-C. In D, fold `textSize` into Body size vocabulary; decide `responsive` with a look at the vault instance |
| D9 | Block-level theme fields on out-of-scope blocks | Untouched until they become nestable (Phase E) |

---

## Appendix A: expected migrate:create answer sheets

### Phase B: `pnpm migrate:create sections-and-media-content-split` (do not run without asking)

Additive only; expected prompts and answers:

1. `pages_blocks_section` (or `pages_section` per dbName) table: **create** (brand-new block)
2. `work_pages_section`, `lab_pages_section`, `expertise_pages_section`, `audience_pages_section` and all `_v` counterparts: **create** (brand-new in each collection)
3. `*_media_content_split` tables: **create** (brand-new block)
4. `body_size` column + enum on `featureHeadingOffset` tables: **create** (brand-new field)
5. `section` nested `blocks` linkage: no prompt expected (child blocks keep existing tables; only `_path` semantics change at runtime)

If any prompt offers "rename" against an existing media/split table, stop: that means the dbName collided or nesting re-tabled children; abort and re-check the Phase B verification step.

### Phase B2: `pnpm migrate:create block-coverage` (do not run without asking)

Additive only: 54 new tables (block tables and their `_v` twins for Pages, Posts, Lab, Expertise, Audience, Work), their FK constraints, indexes and per-table enums. Nothing is dropped, nothing changes shape, so **no create/rename prompt is expected**.

If a prompt does appear offering "rename" against an existing block table, stop: that means a `dbName` collided or a block was re-homed. Re-run `pnpm check:migrations:drift` and compare its table list against the one above before answering.

### Phase D (per-PR, examples)

- Field rename `imagePosition -> layout` on `splitContentNarrow`: prompt "column renamed?": **rename** from `image_position` (preserve 5 rows).
- Enum `centered -> center`: no rename prompt; hand-check the generated SQL for normalize-before-cast and run `pnpm check:migrations`.
- Theme column drops: no prompts; drops appear plainly in the diff. Confirm C completed first.

## Appendix B: file touch list

| Area | Files |
|---|---|
| Groups/labels | `src/blocks/shared/groups.ts`, the nine block configs |
| Drawer order | `src/fields/pageLayoutBlocks.ts`, `src/blocks/case-study/config.ts`, `src/blocks/lab/config.ts` |
| Section | new `src/blocks/section/` (config, component, stories), `src/blocks/shared/section.tsx` (tight tier, theme map) |
| Compose field labels | `src/collections/Pages/index.ts`, `src/collections/WorkPages/index.ts`, `src/collections/LabPages/index.ts`, `src/collections/segmentPage.ts` |
| Renderers | `src/blocks/RenderBlocks.tsx`, `src/blocks/case-study/RenderCaseStudyBlocks.tsx`, `src/blocks/lab/RenderLabBlocks.tsx` |
| Stories/fixtures | eight existing `*.stories.tsx`, new Section/Split stories, `src/blocks/fixtures.ts` |
| Migration script | new `scripts/` content script (wrap-in-sections, dry-run, snapshot) |
| Docs | `AGENTS.md` block spacing bullet, `docs/cms-naming.md`, this file |
