# Blocks reorg and Sections roadmap

Status: Phases A and B shipped to main (a06a1ea, 2026-09-02; CI applies migration `20260902_191423`). Phase B2 (collection coverage: the same run offered by all six composition surfaces, plus drawer group order) shipped 2026-09-02 (a472523, migration `20260902_201235_block_coverage`). The run then grew on 2026-09-03: the generic Standard (`richTransition`, replacing `labTransition`), Rich text (Text), Content nested in every Section, and Phase B3 (Interactive: the new FAQ block plus Carousel moved into the run; migration `20260904_012500_interactive_in_sections` committed with the code). Phase B4 (2026-09-04) opened the Lists group in the run with the new Insight list block (migration `20260904_031350_insight_list` committed with the code); the group label is now `Lists` (was `Lists & grids`). Phase B5 (2026-09-04) moved Tabs (`featureTabs`, was "Feature: tabs") into the run's Interactive group and onto the grid (code done, migration pending, see Phase B5 below). Phase C is being done MANUALLY in admin (cheat sheet below; the script remains as fallback). Phase D remains future work. Agents: read this doc before any block naming/organizing task instead of re-exploring the block system.

Scope: Pages, Posts, WorkPages, LabPages, ExpertisePages, AudiencePages (Posts added in B2, 2026-09-02). Blocks not named below stay as they are for now. Home global is half in scope: it does not adopt Sections and never takes the case-study grammar it has never offered (Pair, Pair offset, the generic Standard), but it consumes the Pages list otherwise, so every other block that joins the run (Split, Rich text, FAQ) reaches Home too.

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
| NEW `mediaContentSplit` | (new block) | Media and content | Split | net-new visual, additive. 2026-09-04: `body` uses the content-column editor `contentLexical` (`src/fields/contentLexical.ts`): h4 (muted), bulleted list (ruled), Eyebrow and Small text styles as rows of the format dropdown (in-repo `TextStyleFeature`, `src/fields/lexical/textStyle`, Lexical node state; classes in `components/RichText/text-styles.ts`), Actions toolbar block (`actions`, `RichTextActionsBlock`, one or two links as buttons, in the body JSON, no table), fixed and inline toolbars. Node treatment lives in `RichText` and the bare rich text rules in `globals.css` |
| `splitContentNarrow` | Split layouts / Split content (narrow) | Media and content | Split narrow | 2026-09-04: `body` uses `contentLexical` (see Split) |
| `imagePair` | Media / Image pair | Media and content | Pair | zero prod data |
| `splitImageOffset` | Media / Split image offset | Media and content | Pair offset | |
| `featureImageStatement` | Statements / Feature: image statement | Media | Statement | |
| `mediaBlock` | Media / (no labels, shows "Media Block") | Media | Caption | add `labels` |

Slugs, `dbName`s, and tables stay put. That is the single biggest risk reducer in this plan: admin naming is fully decoupled from storage, so the entire rename is a zero-schema change. Slug renames would cascade through tables, versions tables, payload-types, three renderers, and MCP-authored content for no editor-visible benefit.

New `BLOCK_GROUPS` entries: `sectionHeading: 'Section heading'`, `mediaContent: 'Media and content'` (matching the repo's sentence-case convention per `docs/cms-naming.md`; see D5 if you want Title Case instead). `Narrative`, `Statements`, `Split layouts` keep their remaining blocks.

### Blocks that joined the run after Phase B (all additive, slugs and tables untouched)

| Slug | Group / label | Added | Notes |
|---|---|---|---|
| `richTransition` | Section heading / Standard | 2026-09-03 | Generic Standard for every surface but Work; replaced `labTransition` (zero rows) |
| `richText` | Text / Rich text | 2026-09-03 | Born on the Section and grid contracts; Text now holds only this block. 2026-09-04: the editor toolbar's block menu adds Insights (Lexical block `insights`, `RichTextInsightsBlock`, stored in the body JSON, no table); each item is the Insight list item (`insight-list/Insight.tsx`, `insightItemFields`), and Pill list (Lexical block `pillList`, `RichTextPillListBlock`, eyebrow plus wrapping mono pills, Paper "Chip List") |
| `content` | Custom / Content | 2026-09-03 | Nested in every Section via `sectionChildBlocks`; not in the run so Custom still closes the top-level drawer |
| NEW `faq` | Interactive / FAQ | 2026-09-03 (B3) | Two-column accordion from the Paper frame `Block=FAQ, Layout=Compact`; per-parent `*_faq` + `*_faq_items` tables |
| `carousel` | Interactive / Carousel | 2026-09-03 (B3) | Moved from the legacy top-level lists into the run; keeps its bespoke embla layout and its existing tables (`*_blocks_carousel`), only Posts gains it as new |
| NEW `insightList` | Lists / Insight list | 2026-09-04 (B4) | Numbered run of SVG-marked statements beside or above a heading, from the Paper frames "featureStatementGrid v2 proposal"; per-parent `*_insight_list` + `*_insight_list_items` tables |
| `featureTabs` | Interactive / Tabs | 2026-09-04 (B5) | Moved from the legacy top-level Interactive list (label was "Feature: tabs"); keeps its default per-parent `*_blocks_feature_tabs` tables (+ `_tabs`, `_tabs_items`), only Posts and Lab gain it as new. Work nests the story-beat variant (`WorkFeatureTabsBlock`) since each tab pulls story copy |

Interactive is the first legacy group to enter the run. Tabs followed in B5 (it only needed `bare` and the grid). The remaining Interactive blocks (audience and industry shells, marquee) stay top-level-only because they own pinned or full-viewport shells (D4). Lists followed in B4 with Insight list; the legacy Lists blocks (Archive, Featured work, the case-study and lab lists) stay top-level-only for now and share the group tab, which Payload assembles by label regardless of array position.

### Standard select vocabulary

| Select | Options (stored value) | Default | Where |
|---|---|---|---|
| Layout | Left (`left`), Center (`center`, only where it exists), Right (`right`) | `left` | per block below |
| Layout (arrangement) | Side by side (`side`), Stacked (`stacked`) | `side` | Insight list only, where the choice is heading beside vs above (D11) |
| Mark size | Small (`small`), Medium (`medium`), Large (`large`) | `medium` | Insight list (`markSize`) |
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
| Standard (`*Transition`) | `layout` (left/centered/split/statement, default centered) | Layout | keep values, relabel; hide `split`/`statement` options from new picks in D | relabel now; default change to `left` is new-rows-only, safe. 2026-09-04: `left` became `offset` (same rendering, rows migrated) and a new flush `left` was added, default `offset` |
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
| Rich text (`richText`) | yes | yes | no (hand-built run) | yes | yes | yes | yes |
| FAQ (`faq`) | yes | yes | yes (plain) | yes | yes | yes | yes |
| Carousel (`carousel`) | yes | yes (new in B3) | yes (plain) | yes | yes | yes | yes |
| Insight list (`insightList`) | yes | yes | yes (plain) | yes | yes | yes | yes |
| Tabs (`featureTabs`) | yes | yes (new in B5) | yes (story variant) | yes (new in B5) | yes | yes | yes |
| Content (`content`) | yes | nested only | nested only | nested only | yes | yes | yes |

Two things stay collection-owned on purpose:

- **Standard on Work** is its own block: `caseStudyTransition` (`wp_transition`, live in production) puts the same copy fields behind a canonical Case Study story picker. Everywhere else Standard is the generic `richTransition` (`src/blocks/rich-transition/config.ts`, per-parent `*_transition` tables) in the shared run, added 2026-09-03; it replaced the lab twin `labTransition` (`lp_transition`, zero production rows), which carried exactly these fields under a static `dbName`. Work builds its run by hand so it never offers both.
- **Work variants** are the `withStoryBeatSource` wrappers: same slug and table, extra story-beat fields. Caption carries no copy fields, so Work offers the plain block; FAQ, Carousel and Insight list are offered plain too (their headings and items are the block's own copy, not story beats), so `RenderCaseStudyBlocks` renders them without resolving anything against the study. Tabs is the exception in the Interactive group: every tab row carries a `source`, so Work nests `WorkFeatureTabs` and resolves each tab's heading and body against the study as before.

### Drawer group order

Every composition surface leads with the reorganized groups, then its legacy groups in the order they already had:

`Structure > Section heading > Media and content > Media > Text > Interactive > Lists > (legacy)`

| Surface | Full order (2026-09-04, after B4) |
|---|---|
| Pages, Expertise, Audience | Structure, Section heading, Media and content, Media, Text, Interactive, Lists, Statements, Forms & CTAs, Custom |
| Posts | Structure, Section heading, Media and content, Media, Text, Interactive, Lists |
| Work Pages | Structure, Section heading, Media and content, Media, Interactive, Lists, Narrative, Statements |
| Lab Pages | Structure, Section heading, Media and content, Media, Text, Interactive, Lists, Narrative |
| Home (global, no Section) | Section heading, Media and content, Media, Text, Interactive, Lists, Statements, Forms & CTAs, Custom |

Lists moved up with B4: the run carries Insight list, so the group now appears at the run's position and the legacy list blocks (later in each array) join that tab. Payload groups the drawer by label, so a group's blocks need not be contiguous in the array; the convention below keeps them contiguous where it costs nothing.

Interactive moved ahead of Statements in B3 because the run now carries FAQ and Carousel, and the run is spread before every legacy group; the legacy Interactive blocks sit directly after the run in each array so the group stays contiguous (FAQ, Carousel, Tabs since B5, then the bespoke shells).

Order comes only from each block array (`admin.group`, first appearance wins), so keep each group's blocks contiguous: Narrative (the story-section blocks) sits after the run, the column-builder `content` block closes every top-level list and every Section's nested list under `Custom` (added 2026-09-03 via `sectionChildBlocks`; Text now holds only Rich text, inside the run), and the legacy Media blocks (`caseStudyMediaShowcase`, `labMediaShowcase`, `scrollGallery`) stay inside the Media group beside Statement and Caption. `Structure` is still the group label for the Section block itself. A block may appear only once per `blocks` field, so a block that joins the run must leave every top-level list that spreads the run (Carousel did in B3).

Rendering follows the same single-definition rule: `src/blocks/shared/content-block-renderer.tsx` owns the slug-to-component map (`sectionChildComponents`, which since B3 also carries `carousel` and `faq`, since B4 `insightList`, and since B5 `featureTabs`) and the entrance rules for the run. `RenderBlocks` (Pages, Posts, Home, segment pages) spreads that map into its own; `RenderLabBlocks` delegates to it for any block in the run (its bespoke `carousel` case went with B3); `RenderCaseStudyBlocks` keeps its own cases because it resolves story copy first, and forwards `bare` to Carousel and FAQ like every other nested block. Entrances live once in `src/blocks/shared/reveal-variants.ts` (FAQ, Insight list and Tabs play `intro`; Carousel carries no markers and takes the CSS block reveal).

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

Initial nested `blocks` lists contained **only the nine reorganized blocks** (per collection availability). Rich text (`richText`, Text group, 2026-09-03) was the first block added to the run since: born on the Section and grid contracts, it joins `sectionNestableBlocks` directly, so every surface that spreads the run offers it (Work Pages build their run by hand and do not yet). The legacy `content` block joins the nested list on every Section (2026-09-03) through `sectionChildBlocks` = run + Content, kept out of the run so Custom closes the top-level drawer; on Posts, Lab, and Work it is nested-only. Phase B3 (2026-09-03) added the Interactive pair, FAQ (new, born on the contracts) and Carousel (moved; it keeps its own loose band at the top level and renders `bare` inside a Section), to the run and to the hand-built Work run. B5 (2026-09-04) moved Tabs the same way. Everything else stays top-level for now; collections' top-level lists become `[Section, ...existing list unchanged]`. Full "sections only at top level" is a Phase E goal once every remaining block is section-ready (D4).

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

### Phase B: sections and new blocks (additive schema): DONE 2026-09-02 (a06a1ea)

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

### Phase B3: Interactive joins the run (FAQ + Carousel, additive schema): DONE 2026-09-03 (44d76c7)

The first legacy group to enter the run, and the first new block designed straight onto both contracts (Section band + `BlockGrid`).

- [x] `src/blocks/faq/`: `config.ts` (slug `faq`, function `dbName` to `*_faq`, `interfaceName: 'FaqBlock'`, group Interactive; eyebrow + heading row, `items[]` of `question` + rich-text `answer` (both TEXT_KEYS names), an `enableLink` toggle with `prompt` + `link()` for the "ask us" line, `themeField()`), `Component.tsx` (server adapter: band, header row on the grid, contact link via `CMSLink`), `Component.client.tsx` (Radix `Accordion`, single open item, first open by default; answers collapse on the shared `disclosure-body` track and go `inert` while closed; plus-to-minus glyph rotates on the site ease), `Component.stories.tsx` (`Blocks/Interactive/FAQ`).
- [x] `disclosure-body` in `globals.css` is the renamed `form-step-body` (one rule, two consumers: form steps and FAQ answers); `docs/animations.md` and `docs/inquiries.md` follow.
- [x] `sectionNestableBlocks` gains `// Interactive: Faq, Carousel`; `workSectionBlocks` gains both plain; the standalone `Carousel` entries left `pageLayoutBlocks`, `segmentPageBlocks`, `caseStudyBlocks`, `labBlocks`, and the legacy Interactive blocks now follow the run directly in each array.
- [x] `CarouselBlock` takes `bare` (skips its loose band inside a Section); `sectionChildComponents` maps `carousel` and `faq`; `RenderBlocks` and `RenderLabBlocks` dropped their own carousel entries; `RenderCaseStudyBlocks` forwards `bare` to Carousel and renders FAQ through `RevealSection` with the shared `intro` variant; `blockRevealVariants.faq = 'intro'`.
- [x] Storybook: Carousel retitled `Blocks/Interactive/Carousel` (Chromatic baseline reset for that story expected).
- [x] `pnpm generate:types`, `pnpm generate:importmap` (no new imports), `tsc --noEmit`, `pnpm lint`, Carousel and form-steps vitest suites all clean.
- [x] `pnpm check:migrations:drift` previews the pending migration: 48 `CREATE TYPE`, 32 `CREATE TABLE`, 34 FK constraints, 82 indexes, **all additive**, no drop, no rename-shaped statement, no `ADD VALUE`. Tables: `{pages,posts,work_pages,lab_pages,expertise_pages,audience_pages,home}_faq` + `_faq_items` and their `_v` twins, plus `posts_blocks_carousel` + `_slides` (+ `_v`), the only surface that had never offered Carousel. Every existing Carousel table keeps its name, confirming again that moving a block into the run does not re-home rows.
- [x] `pnpm migrate:create interactive-in-sections` generated `src/migrations/20260904_012500_interactive_in_sections.{ts,json}` with no create/rename prompts; committed with the code (44d76c7). CI applies it.

### Phase B4: Lists joins the run (Insight list, additive schema): DONE 2026-09-04

The second legacy group to enter the run, with a new block designed straight onto both contracts and the first to use a `BlockGrid` subgrid (grid doc, G7).

- [x] `src/blocks/insight-list/`: `config.ts` (slug `insightList`, function `dbName` to `*_insight_list`, `interfaceName: 'InsightListBlock'`, group Lists; eyebrow + heading row, `summary` textarea, `layout` (`side` / `stacked`) + `markSize` (`small` / `medium` / `large`) row, `items[]` of SVG `media` (picker filtered to `image/svg+xml`) + `title` + `description`, `themeField()`), `Component.tsx` (server: band, heading cluster and the list on one `BlockGrid`, marks painted as a CSS mask over the text color so one upload reads on every band), `Component.stories.tsx` (`Blocks/Lists/InsightList`: both frames, mark sizes, no marks, five items, dark).
- [x] `BLOCK_GROUPS.lists` relabeled `Lists` (was `Lists & grids`); label only, no schema.
- [x] `src/blocks/shared/numbering.ts` (`ordinalLabel`) is the one two-digit index formatter; FAQ's local copy now imports it.
- [x] `publicApprovedMediaWhere` exported from `src/fields/caseStudyScopedMedia.ts` so the SVG picker filter composes the same public gate as every other picker.
- [x] `sectionNestableBlocks` gains `// Lists: InsightList`; `workSectionBlocks` gains it plain; `sectionChildComponents` maps `insightList`; `RenderCaseStudyBlocks` renders it through `RevealSection` with the shared `intro` variant; `blockRevealVariants.insightList = 'intro'`.
- [x] `pnpm generate:types`, `pnpm generate:importmap` (no new imports), `tsc --noEmit`, `pnpm lint` clean.
- [x] `pnpm check:migrations:drift` previews the pending migration: 42 `CREATE TYPE`, 28 `CREATE TABLE`, 42 FK constraints, 84 indexes, **all additive**, no drop, no rename-shaped statement, no `ADD VALUE`. Tables: `{pages,posts,work_pages,lab_pages,expertise_pages,audience_pages,home}_insight_list` + `_insight_list_items` and their `_v` twins.
- [x] `pnpm migrate:create insight-list` generated `src/migrations/20260904_031350_insight_list.{ts,json}` with no create/rename prompts; committed with the code. CI applies it.

### Phase B5: Tabs joins the run (additive schema): CODE DONE 2026-09-04, migration pending

The second legacy Interactive block to move (after Carousel in B3), and the first moved block to be rebuilt on `BlockGrid` in the same change (grid doc, migration map).

- [x] `src/blocks/feature/Tabs/config.ts`: `labels` now `Tabs` (was `Feature: tabs`); slug, fields, group and default `dbName` untouched.
- [x] `sectionNestableBlocks` gains `FeatureTabs` after Carousel; `workSectionBlocks` gains `WorkFeatureTabs` (the story-beat variant, since each tab row carries `source`); the standalone entries left `pageLayoutBlocks`, `segmentPageBlocks` and `caseStudyBlocks`. Home keeps it through the run (it was never in `homeExcludedBlocks`); Posts and Lab offer it for the first time.
- [x] `sectionChildComponents` maps `featureTabs`; `RenderBlocks` dropped its own entry; `RenderCaseStudyBlocks` forwards `bare` into `FeatureTabsSection` like FAQ and Insight list. `blockRevealVariants.featureTabs` was already `intro`.
- [x] `src/blocks/feature/Tabs/Component.tsx` rebuilt on the grid: from `lg` copy column cols 1-3 and media plate cols 4-8 at 16:9, both cells full-width and stacked at `md` with a 3:2 plate (was `lg:grid-cols-3` + `min-h-[390px]` fill); `Container` component; the strip and panels stack on `space-y-12 md:space-y-16`; the caption card's `max-w-[283px]` is now `max-w-72`.
- [x] Storybook: retitled `Blocks/Interactive/Tabs` (Chromatic baseline reset for that story expected).
- [x] `pnpm generate:types`, `pnpm generate:importmap` (no new imports), `tsc --noEmit`, `pnpm lint` clean.
- [x] `pnpm check:migrations:drift` previews the pending migration: 8 `CREATE TYPE`, 12 `CREATE TABLE`, 16 FK constraints, 32 indexes, **all additive**, no drop, no rename-shaped statement, no `ADD VALUE`. Tables: `{posts,lab_pages}_blocks_feature_tabs` + `_tabs` + `_tabs_items` and their `_v` twins. Every existing `*_blocks_feature_tabs` table keeps its name.
- [ ] `pnpm migrate:create tabs-in-sections` (ask first; answer sheet in Appendix A), then `pnpm check:migrations`, `pnpm check:migrations:drift`, commit code + migration together.

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
- 2026-09-03 adds: `Blocks/Text/RichText`; B3 adds `Blocks/Interactive/FAQ` (Paper frame, no contact link, five questions, single question, dark) and retitles Carousel to `Blocks/Interactive/Carousel`.
- 2026-09-04 adds to `Blocks/Text/RichText`: one insight, two insights, many insights, insights between copy, pill list, pill list no eyebrow, pill list with insights, dark (the Paper one-, two- and many-insight frames and the "Chip List" frame).
- B4 (2026-09-04) adds `Blocks/Lists/InsightList` (side by side, stacked, small and large marks, no marks, five insights, dark); the six Paper marks are data-URL SVG fixtures (`insightMarkFixtures`).
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
| D4 | Which blocks are permanently top-level-only | Likely `scrollGallery`, `caseStudyMediaShowcase`, `featuredWork` (pinned/full-bleed shells), plus the Interactive shells that own a pin or a full viewport (`industryWork`, `audienceTabs`, `featuredWork`). Carousel proved nestable in B3 (it only needed `bare`), Tabs in B5. Decide the rest before Phase E |
| D5 | ~~Group name casing~~ | TAKEN: repo sentence case (`Section heading`, `Media and content`) |
| D6 | Pair select semantics (`textPosition` under-portrait/under-landscape vs Left/Right) | Zero prod rows: redesign freely in D to `primaryPosition: left/right` + `contentPosition: left/right` |
| D7 | Caption block: keep `size` (full/inset/small) or replace with Layout | Zero prod rows: replace with the standard vocabulary if the visual supports it, else keep `size` and skip Layout |
| D8 | Statement extras (`textSize`, `imageWidth`, `aspectRatio` incl. `responsive`, used once) | Keep all in A-C. In D, fold `textSize` into Body size vocabulary; decide `responsive` with a look at the vault instance |
| D9 | Block-level theme fields on out-of-scope blocks | Untouched until they become nestable (Phase E) |
| D10 | FAQ layout select | The Paper frame is named `Layout=Compact` but only that layout exists, so the block ships without a `layout` select rather than inventing options. Add the standard Layout vocabulary (additive enum) once a second frame is designed |
| D11 | Insight list layout vocabulary | TAKEN: `side` / `stacked` rather than Left/Right. The two frames differ in whether the heading sits beside or above the list, not in which side it takes, and Left/Right would promise a mirrored arrangement nobody designed. Stacked reuses the word the Media and content group already uses for "heading above" |

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

### Phase B3: `pnpm migrate:create interactive-in-sections` (do not run without asking)

Additive only: 32 new tables (`*_faq`, `*_faq_items`, `posts_blocks_carousel`, `posts_blocks_carousel_slides` and their `_v` twins), 48 enums, 34 FK constraints, 82 indexes. Nothing is dropped, nothing changes shape, so **no create/rename prompt is expected**.

If a prompt does appear offering "rename" against an existing `*_blocks_carousel` table, stop: that means Carousel was re-homed rather than re-offered. Re-run `pnpm check:migrations:drift` and compare its table list against the one in Phase B3 before answering.

### Phase B4: `pnpm migrate:create insight-list` (do not run without asking)

Additive only: 28 new tables (`*_insight_list`, `*_insight_list_items` and their `_v` twins for Pages, Posts, Work, Lab, Expertise, Audience, Home), 42 enums, 42 FK constraints, 84 indexes. Nothing is dropped, nothing changes shape, so **no create/rename prompt is expected**.

If a prompt does appear offering "rename" against any existing table, stop: a `dbName` collided. Re-run `pnpm check:migrations:drift` and compare its table list against the one in Phase B4 before answering.

### Phase B5: `pnpm migrate:create tabs-in-sections` (do not run without asking)

Additive only: 12 new tables (`posts_blocks_feature_tabs`, `lab_pages_blocks_feature_tabs`, their `_tabs` and `_tabs_items` children, and the `_v` twins), 8 enums, 16 FK constraints, 32 indexes. Nothing is dropped, nothing changes shape, so **no create/rename prompt is expected**.

If a prompt does appear offering "rename" against an existing `*_blocks_feature_tabs` table, stop: that means Tabs was re-homed rather than re-offered. Re-run `pnpm check:migrations:drift` and compare its table list against the one in Phase B5 before answering.

### Phase D (per-PR, examples)

- Field rename `imagePosition -> layout` on `splitContentNarrow`: prompt "column renamed?": **rename** from `image_position` (preserve 5 rows).
- Enum `centered -> center`: no rename prompt; hand-check the generated SQL for normalize-before-cast and run `pnpm check:migrations`.
- Theme column drops: no prompts; drops appear plainly in the diff. Confirm C completed first.

## Appendix B: file touch list

| Area | Files |
|---|---|
| Groups/labels | `src/blocks/shared/groups.ts`, the nine block configs |
| The run | `src/blocks/shared/section-blocks.ts` (`sectionNestableBlocks`, `sectionChildBlocks`), `src/blocks/shared/content-block-renderer.tsx` (`sectionChildComponents`), `src/blocks/shared/reveal-variants.ts` |
| FAQ (B3) | `src/blocks/faq/{config,Component,Component.client,Component.stories}.tsx`, `disclosure-body` in `globals.css` |
| Insight list (B4) | `src/blocks/insight-list/{config,Component,Component.stories}.tsx`, `src/blocks/shared/numbering.ts`, `src/blocks/shared/grid.tsx` (`subgrid`, `as`), `src/fields/caseStudyScopedMedia.ts` (`publicApprovedMediaWhere`), `insightMarkFixtures` in `src/blocks/fixtures.ts` |
| Tabs in the run (B5) | `src/blocks/feature/Tabs/{config,Component,Component.stories}.tsx`, the run, the three block arrays and three renderers above |
| Carousel in the run (B3) | `src/blocks/Carousel/Component.tsx` (`bare`), `Component.stories.tsx` (retitle), the five block arrays and three renderers above |
| Drawer order | `src/fields/pageLayoutBlocks.ts`, `src/blocks/case-study/config.ts`, `src/blocks/lab/config.ts` |
| Section | new `src/blocks/section/` (config, component, stories), `src/blocks/shared/section.tsx` (tight tier, theme map) |
| Compose field labels | `src/collections/Pages/index.ts`, `src/collections/WorkPages/index.ts`, `src/collections/LabPages/index.ts`, `src/collections/segmentPage.ts` |
| Renderers | `src/blocks/RenderBlocks.tsx`, `src/blocks/case-study/RenderCaseStudyBlocks.tsx`, `src/blocks/lab/RenderLabBlocks.tsx` |
| Stories/fixtures | eight existing `*.stories.tsx`, new Section/Split stories, `src/blocks/fixtures.ts` |
| Migration script | new `scripts/` content script (wrap-in-sections, dry-run, snapshot) |
| Docs | `AGENTS.md` block spacing bullet, `docs/cms-naming.md`, this file |
