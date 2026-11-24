# Health refactor plan

Status: plan, nothing started. Baseline measured 2026-11-24 on `d38b33c` with fallow 3.39.0.

`fallow dead-code` and `biome check .` are at zero and stay there. This plan covers what is left: `fallow health` reports **142 functions** over its thresholds and `fallow dupes` reports **31 clone groups** (691 lines, 0.6% of the code). Health score is 88.1 (A). The only penalties are unit size (-10) and coupling (-1.9). These are warnings, not defects. The goal is to lower them where it buys maintainability, not to chase the number.

Thresholds are fallow's defaults plus this repo's `.fallowrc.jsonc`: cyclomatic 20, cognitive 15, unit size 60 lines, CRAP 110.

## How to read the 142

| Breached | Count | What it means |
|---|---|---|
| CRAP only | 42 | Under the cyclomatic and cognitive limits. Flagged only because no coverage report is wired, so fallow assumes 0% coverage. |
| Cognitive (+ CRAP) | 68 | Nesting and branching that is hard to read. The real refactor work. |
| Cyclomatic and cognitive (+ CRAP) | 27 | Long, branchy functions. The worst offenders. |
| Cyclomatic only (+ CRAP) | 5 | Many flat branches (lookup tables, switch-like mapping). Often a data-table rewrite. |

By area: product paths 28, CMS, plugins and admin 23, blocks, heros, footer and immersive 56, scripts and tooling 35.

## Phase 0: measure what is real (do first, no refactors)

1. **Wire coverage into CRAP.** Add `@vitest/coverage-v8` and run `vitest run --coverage --coverage.reporter=json`, then `fallow health --coverage coverage/coverage-final.json`. Expected: most of the 42 CRAP-only findings clear without touching code, and the repo's `maxCrap: 110` can step back toward the default 30 (the config comment already says so). Keep coverage out of CI until it is fast; CI runs no vitest today.
2. **Decide the scripts policy.** 35 findings live in `scripts/` (dev-tui, lab-journal, ask and MCP benches, seed, wrap-sections). These are operator tools, not shipped code. Pick one:
   - hold them to the same bar and refactor them in Phase 4, or
   - add a `thresholdOverrides` entry for `scripts/**` with a stated reason (looser unit size and cognitive limits). This is a policy, not a suppression, and must name why.
3. **Prune the stale override.** 8 of the 12 `chart.tsx` override matches are reported stale (`<arrow>` matches every anonymous function in the file). Pin it to the one tooltip renderer or accept the noise.
4. **Re-baseline.** Re-run `fallow health` and `fallow dupes` and update the counts at the top of this file. Every later phase states its before and after.

## Phase 1: product paths with high churn (28)

Worst first. These run on every page or every Ask turn and change often.

- **`src/endpoints/ask.ts` `handler`** (cyclomatic 77, cognitive 75, 534 lines, 23 commits, accelerating). Split into a pipeline of named steps: parse and validate the request, consent and rate gates, retrieval, the model call, the stream writer, persistence and analytics. Each step is a pure function with unit tests. The handler becomes a short composition. Highest value item in the plan.
- **`src/components/Card/index.tsx` `Card`** (cyclomatic 56, 19 commits, accelerating). The card branches on content type inside one render. Split per variant (post, work, lab) behind a thin dispatcher, keeping the props contract.
- **`src/Header/Menu/index.tsx` `TakeoverMenu`** (one 1,497-line function, cognitive 77, 42 commits). Extract the GSAP timelines and the dock or measure logic into hooks next to the existing `heroHandoff.ts` and `navCurtain.ts`, and the panels into components. Read the menu memories first: the dock-scale measure hazard, phone sub-views, iOS focus ring, and scroll subscription.
- **`src/features/cursor/CustomCursorProvider.tsx` `update`**, **`src/shared/content/lexicalToMarkdown.ts` `inlineText`**, **`src/shared/content/extract.ts` `renderSiteInfo`**: replace branch ladders with lookup tables keyed by node or variant type.
- **`src/features/ask/useAskChat.ts`**, **`messages.tsx` `TranscriptTurn`**: move the stream-event reducer out of the hook into a tested pure reducer.
- Remaining Phase 1 rows (route pages, `resolveWorkEntry`, `utilities/schema.ts`) are mostly CRAP-only or mapping functions. Re-check them after Phase 0.

Verify: unit tests for every extracted step, Playwright e2e (`pnpm test:e2e`), Storybook visual pass on Menu and Card stories (reduced-motion and motion-on, per the Storybook verification recipe), and an Ask session on preview before main.

## Phase 2: CMS, plugins and admin (23)

- **Streak Studio**: `Stage` (cyclomatic 47, 572 lines), `Inspector`, `ParameterRow`, `collections.ts` `beforeChange`, `usage.ts` `lookUsage`. Pull state transitions into the existing `store.ts` and `look-store.ts`, and make `beforeChange` a list of small validators. Read `docs/studio-effects.md` first.
- **Inquiries and newsletter endpoints** (`Inquiries/endpoints.ts` `handler` cyclomatic 31, `endpoints/newsletter.ts` `handler` 27): share one request-validation and response helper (they are also clone group #14 below).
- **`InquiryActions`**, **`posthog-insights` `TrendChart`**, **`MediaFilenameCell`**, **`hooks/generateVideoPoster.ts`**: extract branches into named helpers.

Verify: admin flows by hand on a local DB (save a look, publish, triage an inquiry), plus `pnpm generate:importmap` after any admin component moves.

## Phase 3: blocks, heros, footer, immersive and widgets (56)

- **`FeaturedWorkList`** (413-line component, its GSAP `activate` at 106 lines) and **`IndustryWorkClient`** / **`IndustryWorkMedia`**: move the GSAP choreography into hooks, render stays declarative.
- **`CtaBandBlock`** (cognitive 24): split the layout variants into small components.
- **Heros and footer**: `LabHero`, `HomeHero`, `PostHero`, `VideoMedia`, `ClosingAsk`, `FooterClosing`, `ContactPageTemplate`.
- **Immersive**: `streak-field-scene`, `chroma-split-text`, `use-live-visual` (cognitive 42), `StreakVisual`, `GlobalCanvas`. Tuning must stay in `*_DEFAULTS` and presets (`docs/immersive-effects.md`). Verify WebGL offscreen with pixel diffs, not a single screenshot.
- `form-steps.client.tsx`, `StandardView`, the transition-demo widgets.

Verify: every touched block's Storybook stories, both passes, plus the block grid checks (`pnpm check:blocks`).

## Phase 4: scripts and tooling (35, depends on the Phase 0 policy)

`scripts/dev-tui/App.tsx` `handleAction`, `scripts/lab-journal/verify.ts` `main` (cyclomatic 41), `cli.ts`, `digest.ts`, `ask-bench.ts` `askTurn` (cognitive 76), `ask-judge-eval.ts`, `wrap-sections.ts` `run`, `seed/index.ts` `run` (996 lines), the MCP bench and eval. If Phase 0 chooses to refactor them, start with the shared helpers the duplication list below already names.

## Duplication (31 groups)

Fix these alongside the phase that touches the file. The larger ones:

| Lines | Where | Consolidation |
|---|---|---|
| 29 | `sections/LabBrowse/queries.ts` and `sections/WorksBrowse/queries.ts` | One shared browse query helper in `sections/Browse/` |
| 29 | `plugins/figures/index.ts` and `plugins/house-style/index.ts` | Shared save-hook walker for the two save gates |
| 21 | `mcp-bench.ts` and `mcp-locate-eval.ts` (`target()`, `flag()`) | `scripts/lib/cli-args.ts`, also used by `ask-bench.ts` |
| 21 | Browse story fixtures (Insights, Lab, Works) | One fixture builder in `sections/Browse/` |
| 19 + 8 | `LabBrowse/index.tsx` and `WorksBrowse/index.tsx` (list markup, imports) | A `BrowseList` component that takes a row renderer |
| 18 | Mount wrapper in `light-leak.tsx`, `scroll-gallery.tsx`, `streak-field.tsx` | One immersive mount hook |
| 15 | `StandardView.tsx` (two copies of one subtree) | Local component |
| 13 | `utilities/publishedSlugs.ts` and `slugRoute.ts` | Shared query |
| 12 | `expertise/[slug]` and `who-we-help/[slug]` pages | Shared segment page helper (also flagged as hidden coupling) |
| 11 | Inquiries and newsletter endpoints | Shared validation and response helper (Phase 2) |

The remaining 21 groups are 5 to 11 lines each (story args, small parsers, Menu list items). `fallow dupes` lists them.

## Rules for every phase

- One logical commit per function or clone group, behavior unchanged, tests and stories green before and after.
- No `fallow-ignore` comments to make a number move. An override needs a written reason in `.fallowrc.jsonc`.
- Re-run `fallow health`, `fallow dupes`, `fallow dead-code`, `biome check .` and `tsc --noEmit` at the end of each phase and record the delta here.
- Ship each phase through `preview` before `main`.

## Appendix: all 142 findings by phase

Generated from `fallow health --format json` on `d38b33c`. Within a phase, rows are ordered by cyclomatic complexity weighted by six months of churn.

### Phase 1, product paths (28)

| File | Function | Cyclomatic | Cognitive | Lines | Breached | Churn (6 mo) |
|---|---|---|---|---|---|---|
| `src/endpoints/ask.ts:288` | `handler` | 77 | 75 | 534 | all | 23 commits, accelerating |
| `src/endpoints/ask.ts:428` | `report` | 37 | 29 | 84 | all | 23 commits, accelerating |
| `src/components/Card/index.tsx:75` | `Card` | 56 | 49 | 278 | all | 19 commits, accelerating |
| `src/Header/Menu/index.tsx:1323` | `<arrow>` | 25 | 39 | 167 | all | 42 commits, cooling |
| `src/Header/Menu/index.tsx:616` | `TakeoverMenu` | 22 | 77 | 1497 | both | 42 commits, cooling |
| `src/Header/Menu/index.tsx:1079` | `buildTimeline` | 17 | 23 | 178 | cognitive | 42 commits, cooling |
| `src/Header/Menu/index.tsx:1606` | `handleChatViewChange` | 17 | 18 | 73 | cognitive | 42 commits, cooling |
| `src/features/cursor/CustomCursorProvider.tsx:593` | `update` | 24 | 19 | 51 | all | 12 commits, cooling |
| `src/shared/content/lexicalToMarkdown.ts:36` | `inlineText` | 20 | 24 | 29 | cognitive | 6 commits, accelerating |
| `src/shared/content/extract.ts:398` | `renderSiteInfo` | 24 | 14 | 37 | cyclomatic + crap | 6 commits, stable |
| `src/features/ask/messages.tsx:158` | `TranscriptTurn` | 21 | 16 | 66 | all | 10 commits, accelerating |
| `src/shared/content/lexicalToMarkdown.ts:88` | `blockToMarkdown` | 16 | 22 | 79 | cognitive | 6 commits, accelerating |
| `src/blocks/shared/resolve-work-entry.ts:39` | `resolveWorkEntry` | 20 | 7 | 34 | crap | 5 commits, cooling |
| `src/shared/content/extract.ts:140` | `walkValue` | 20 | 27 | 47 | cognitive | 6 commits, stable |
| `src/features/ask/useAskChat.ts:52` | `useAskChat` | 17 | 25 | 143 | cognitive | 10 commits, stable |
| `src/features/cursor/CustomCursorProvider.tsx:500` | `scanTargets` | 16 | 22 | 72 | cognitive | 12 commits, cooling |
| `src/utilities/schema.ts:40` | `organizationSchema` | 26 | 16 | 37 | both | 3 commits, cooling |
| `src/endpoints/newsletter.ts:67` | `handler` | 27 | 26 | 132 | all | 3 commits, accelerating |
| `src/shared/content/extract.ts:311` | `renderParts` | 13 | 25 | 50 | cognitive | 6 commits, stable |
| `src/app/(frontend)/works/[slug]/page.tsx:52` | `WorkPageRoute` | 10 | 6 | 39 | crap | 14 commits, cooling |
| `src/app/(frontend)/lab/[slug]/page.tsx:56` | `LabPageRoute` | 10 | 6 | 45 | crap | 12 commits, stable |
| `src/features/ask/usage.ts:127` | `buildUsageReport` | 19 | 25 | 94 | cognitive | none |
| `src/features/ask/MenuAsk.tsx:127` | `MenuAsk` | 6 | 16 | 282 | cognitive | 17 commits, stable |
| `src/features/ask/chunk.ts:85` | `chunkMarkdown` | 12 | 17 | 36 | cognitive | none |
| `src/features/ask/HandoffPanel.tsx:129` | `Handoff` | 7 | 27 | 139 | cognitive | 4 commits, stable |
| `src/features/ask/history.ts:23` | `askHistory` | 11 | 18 | 24 | cognitive | none |
| `src/features/ask/usage.ts:223` | `fetchAllBuckets` | 10 | 18 | 37 | cognitive | none |
| `src/features/ask/admin/UsagePanel.tsx:98` | `UsagePanel` | 8 | 16 | 101 | cognitive | none |

### Phase 2, CMS, plugins and admin (23)

| File | Function | Cyclomatic | Cognitive | Lines | Breached | Churn (6 mo) |
|---|---|---|---|---|---|---|
| `src/plugins/streak-studio/components/Stage.tsx:102` | `Stage` | 47 | 60 | 572 | all | 8 commits, cooling |
| `src/collections/Inquiries/endpoints.ts:107` | `handler` | 31 | 17 | 117 | all | 7 commits, cooling |
| `src/plugins/streak-studio/collections.ts:68` | `beforeChange` | 24 | 17 | 42 | all | 9 commits, cooling |
| `src/collections/ContactPages/ui/ContactTemplate.tsx:30` | `ContactPageTemplate` | 16 | 13 | 50 | crap | 5 commits, cooling |
| `src/collections/Inquiries/components/InquiryActions.tsx:40` | `InquiryActions` | 17 | 25 | 99 | cognitive + crap | 4 commits, accelerating |
| `src/components/MediaFilenameCell/index.tsx:20` | `MediaFilenameCell` | 22 | 15 | 109 | cyclomatic + crap | 3 commits, accelerating |
| `src/plugins/streak-studio/components/Inspector.tsx:66` | `Inspector` | 12 | 13 | 212 | crap | 10 commits, cooling |
| `src/hooks/generateVideoPoster.ts:80` | `generateVideoPoster` | 29 | 13 | 65 | cyclomatic | none |
| `src/plugins/streak-studio/components/ParameterRow.tsx:267` | `ParameterRow` | 13 | 20 | 180 | cognitive + crap | 6 commits, cooling |
| `src/plugins/streak-studio/usage.ts:23` | `lookUsage` | 28 | 37 | 81 | both | none |
| `src/plugins/posthog-insights/components/TrendChart.tsx:62` | `TrendChart` | 25 | 23 | 249 | all | none |
| `src/plugins/story-headings/index.ts:155` | `<arrow>` | 23 | 30 | 93 | all | none |
| `src/plugins/mcp-write-checks.ts:99` | `walk` | 22 | 32 | 29 | all | none |
| `src/plugins/streak-studio/components/FieldPicker.tsx:112` | `FieldPicker` | 22 | 37 | 224 | all | none |
| `src/plugins/streak-studio/components/ParameterRow.tsx:117` | `ParameterTooltip` | 10 | 15 | 57 | crap | 6 commits, cooling |
| `src/plugins/streak-studio/components/Thumbnail.tsx:13` | `Thumbnail` | 10 | 9 | 41 | crap | 4 commits, cooling |
| `src/collections/Newsletters/components/SendPanel.tsx:14` | `SendPanel` | 19 | 42 | 136 | cognitive + crap | none |
| `src/collections/ContactPages/ui/ContactTemplate.client.tsx:101` | `ContactTemplate` | 7 | 20 | 123 | cognitive | 8 commits, cooling |
| `src/plugins/streak-studio/components/PublishButton.tsx:15` | `PublishButton` | 8 | 18 | 60 | cognitive | 5 commits, stable |
| `src/plugins/streak-studio/components/look-store.ts:75` | `load` | 13 | 9 | 27 | crap | none |
| `src/plugins/posthog-insights/components/TrafficPanel.tsx:35` | `TrafficPanel` | 12 | 19 | 88 | cognitive + crap | none |
| `src/hooks/populateAuthors.ts:8` | `populateAuthors` | 11 | 16 | 30 | cognitive | none |
| `src/plugins/story-headings/index.ts:113` | `storyRelationship` | 11 | 17 | 20 | cognitive | none |

### Phase 3, blocks, heros, footer, immersive and widgets (56)

| File | Function | Cyclomatic | Cognitive | Lines | Breached | Churn (6 mo) |
|---|---|---|---|---|---|---|
| `src/heros/LabHero.tsx:64` | `LabHero` | 17 | 9 | 68 | crap | 10 commits, stable |
| `src/components/Media/VideoMedia/index.tsx:89` | `VideoMedia` | 17 | 19 | 70 | cognitive | 8 commits, cooling |
| `src/Home/hero/index.tsx:99` | `HomeHero` | 13 | 13 | 78 | crap | 17 commits, cooling |
| `src/heros/PostHero/index.tsx:32` | `PostHero` | 12 | 9 | 96 | crap | 19 commits, cooling |
| `src/Footer/Closing/ClosingAsk.tsx:59` | `ClosingAsk` | 17 | 24 | 284 | cognitive + crap | 12 commits, cooling |
| `src/features/immersive/ui/streak-field-scene.tsx:492` | `<arrow>` | 25 | 29 | 166 | all | 3 commits, cooling |
| `src/lib/webgl/components/global-canvas/index.tsx:38` | `GlobalCanvas` | 18 | 25 | 109 | cognitive + crap | 5 commits, stable |
| `src/features/immersive/ui/chroma-split-text.tsx:157` | `<arrow>` | 22 | 19 | 46 | all | 4 commits, cooling |
| `src/blocks/shared/form/submit.ts:29` | `toInquiry` | 11 | 13 | 30 | crap | 6 commits, stable |
| `src/features/immersive/visual/streak-visual.tsx:59` | `StreakVisual` | 12 | 25 | 101 | cognitive | 8 commits, cooling |
| `src/Footer/Closing/FooterClosing.tsx:151` | `FooterClosing` | 11 | 11 | 97 | crap | 12 commits, cooling |
| `src/features/immersive/visual/use-live-visual.ts:73` | `useLiveVisual` | 27 | 42 | 109 | both | none |
| `src/widgets/transition-demo/ui/use-sim-navigation.ts:141` | `navigate` | 16 | 17 | 46 | cognitive + crap | 3 commits, accelerating |
| `src/shared/testing/shadcn-helpers/ai-sdk/parts.ts:200` | `eventsFromParts` | 24 | 54 | 182 | both | none |
| `src/widgets/transition-demo/ui/mock-site.tsx:409` | `MockPage` | 10 | 11 | 15 | crap | 10 commits, cooling |
| `src/blocks/shared/heading-dropdown.tsx:323` | `runScramble` | 11 | 7 | 49 | crap | 10 commits, cooling |
| `src/shared/testing/shadcn-helpers/ai-sdk/parts.ts:60` | `materializeParts` | 23 | 21 | 138 | both | none |
| `src/components/StoryBeatSelect/index.tsx:52` | `StoryBeatSelect` | 11 | 17 | 97 | cognitive + crap | 3 commits, cooling |
| `src/shared/testing/shadcn-helpers/ai-sdk/format.ts:94` | `encodeChunk` | 22 | 1 | 135 | cyclomatic + crap | none |
| `src/features/contents/ContentsButton.tsx:109` | `ContentsButton` | 13 | 26 | 171 | cognitive + crap | 3 commits, cooling |
| `src/shared/ui/scramble-text/ScrambleText.tsx:182` | `onUpdate` | 13 | 16 | 26 | cognitive | 4 commits, cooling |
| `src/shared/testing/shadcn-helpers/core/lower.ts:68` | `lowerEvents` | 21 | 7 | 202 | cyclomatic | none |
| `src/providers/Analytics/PostHog.tsx:83` | `<arrow>` | 10 | 9 | 92 | crap | 5 commits, accelerating |
| `src/components/PageRange/index.tsx:25` | `PageRange` | 19 | 15 | 33 | crap | none |
| `src/features/contents/use-contents-tracking.ts:105` | `apply` | 11 | 10 | 29 | crap | 3 commits, cooling |
| `src/Footer/Closing/resolve.ts:7` | `resolveClosing` | 18 | 7 | 19 | crap | none |
| `src/features/immersive/studio/effect.ts:153` | `parameterError` | 17 | 19 | 27 | cognitive | none |
| `src/features/immersive/visual/leak-visual.tsx:149` | `LeakVisual` | 11 | 21 | 60 | cognitive | 3 commits, cooling |
| `src/blocks/shared/form/form-steps.client.tsx:73` | `<arrow>` | 10 | 9 | 35 | crap | 3 commits, cooling |
| `src/blocks/forms-and-ctas/cta-band/Component.tsx:48` | `CtaBandBlock` | 16 | 24 | 104 | cognitive + crap | none |
| `src/blocks/media-and-content/stacked/StackedView.tsx:34` | `StackedView` | 16 | 16 | 86 | cognitive + crap | none |
| `src/widgets/transition-demo/ui/transition-simulator.tsx:199` | `TransitionSimulator` | 11 | 22 | 206 | cognitive + crap | 4 commits, stable |
| `src/blocks/interactive/industry-work/Component.client.tsx:120` | `IndustryWorkMedia` | 14 | 16 | 83 | cognitive + crap | none |
| `src/jobs/newsletterSend.ts:100` | `handler` | 14 | 17 | 121 | cognitive | none |
| `src/search/beforeSync.ts:3` | `beforeSyncWithSearch` | 14 | 16 | 58 | cognitive | none |
| `src/components/ui/slider.tsx:67` | `Slider` | 7 | 21 | 174 | cognitive | 4 commits, cooling |
| `src/features/immersive/visual/leak-visual.tsx:66` | `LeakLayer` | 9 | 20 | 82 | cognitive | 3 commits, cooling |
| `src/blocks/interactive/audience-tabs/AudienceTabs.tsx:49` | `AudienceTabs` | 13 | 17 | 187 | cognitive + crap | none |
| `src/blocks/media/caption/Component.tsx:31` | `CaptionBlock` | 13 | 11 | 74 | crap | none |
| `src/features/immersive/ui/streak-field-runtime.tsx:104` | `StreakFieldRuntime` | 6 | 18 | 75 | cognitive | 5 commits, cooling |
| `src/blocks/interactive/industry-work/Component.client.tsx:318` | `IndustryWorkClient` | 12 | 15 | 189 | crap | none |
| `src/blocks/render/RenderWorkBlocks.tsx:86` | `renderWorkBlock` | 12 | 9 | 52 | crap | none |
| `src/features/contents/use-sheet-drag.ts:35` | `release` | 12 | 9 | 29 | crap | none |
| `src/blocks/interactive/industry-work/Component.tsx:26` | `panels` | 11 | 9 | 22 | crap | none |
| `src/blocks/lists/featured-work/FeaturedWorkList.client.tsx:234` | `<arrow>` | 11 | 21 | 70 | cognitive + crap | none |
| `src/shared/testing/shadcn-helpers/core/stream.ts:23` | `start` | 11 | 16 | 82 | cognitive | none |
| `src/blocks/forms-and-ctas/download/DownloadView.tsx:40` | `resolveDownload` | 10 | 8 | 25 | crap | none |
| `src/blocks/interactive/faq/Component.tsx:50` | `FaqBlock` | 10 | 14 | 57 | crap | none |
| `src/blocks/lists/featured-work/FeaturedWorkList.client.tsx:186` | `<arrow>` | 10 | 9 | 174 | crap | none |
| `src/blocks/lists/poster-list/PosterList.client.tsx:247` | `<arrow>` | 10 | 9 | 24 | crap | none |
| `src/sections/LabBrowse/item.ts:39` | `toLabBrowseItem` | 10 | 7 | 23 | crap | none |
| `src/features/immersive/ui/scroll-gallery.tsx:605` | `ScrollGallery` | 6 | 18 | 73 | cognitive | 3 commits, cooling |
| `src/widgets/transition-demo/ui/hero-landing-playground.tsx:93` | `HeroLandingPlayground` | 5 | 20 | 145 | cognitive | none |
| `src/features/immersive/ui/dispersion-media.tsx:109` | `DispersionScene` | 2 | 29 | 134 | cognitive | 6 commits, stable |
| `src/features/immersive/ui/refraction-media.tsx:777` | `RefractionScene` | 2 | 17 | 176 | cognitive | 9 commits, accelerating |
| `src/features/immersive/ui/streak-field-scene.tsx:308` | `FieldScene` | 1 | 21 | 387 | cognitive | 3 commits, cooling |

### Phase 4, scripts and tooling (35)

| File | Function | Cyclomatic | Cognitive | Lines | Breached | Churn (6 mo) |
|---|---|---|---|---|---|---|
| `scripts/lab-journal/verify.ts:225` | `main` | 41 | 53 | 251 | all | 5 commits, cooling |
| `scripts/dev-tui/App.tsx:249` | `handleAction` | 34 | 16 | 182 | all | 5 commits, cooling |
| `scripts/wrap-sections.ts:278` | `run` | 22 | 36 | 121 | all | 4 commits, stable |
| `scripts/lab-journal/cli.ts:158` | `setStatus` | 17 | 19 | 29 | cognitive + crap | 7 commits, cooling |
| `scripts/ask-judge-eval.ts:190` | `evalPassages` | 17 | 16 | 38 | cognitive + crap | 5 commits, stable |
| `scripts/ask-judge-eval.ts:230` | `evalFromDb` | 17 | 23 | 49 | cognitive + crap | 5 commits, stable |
| `scripts/ask-judge-eval.ts:143` | `evalJourney` | 16 | 22 | 46 | cognitive + crap | 5 commits, stable |
| `scripts/wrap-sections.ts:198` | `transformLayout` | 18 | 17 | 55 | cognitive + crap | 4 commits, stable |
| `scripts/ask-judge-eval.ts:310` | `evalNextPage` | 14 | 17 | 29 | cognitive + crap | 5 commits, stable |
| `scripts/ask-judge-eval.ts:91` | `evalTurns` | 13 | 19 | 45 | cognitive + crap | 5 commits, stable |
| `scripts/ask-judge-eval.ts:350` | `evalScope` | 13 | 17 | 27 | cognitive + crap | 5 commits, stable |
| `scripts/ask-judge-eval.ts:285` | `evalSend` | 12 | 14 | 19 | crap | 5 commits, stable |
| `scripts/dev-tui/App.tsx:434` | `<arrow>` | 18 | 21 | 46 | cognitive + crap | 5 commits, cooling |
| `scripts/ask-bench.ts:101` | `askTurn` | 33 | 76 | 92 | all | none |
| `scripts/seed/index.ts:279` | `run` | 19 | 18 | 996 | cognitive + crap | 12 commits, stable |
| `scripts/lab-journal/digest.ts:219` | `main` | 14 | 15 | 205 | crap | 6 commits, cooling |
| `scripts/wrap-sections.ts:138` | `findField` | 10 | 19 | 16 | cognitive + crap | 4 commits, stable |
| `scripts/cms-upload.ts:85` | `upload` | 10 | 11 | 31 | crap | 5 commits, cooling |
| `scripts/editorial/passages.ts:102` | `passagesOf` | 22 | 25 | 43 | both | none |
| `scripts/lab-journal/narrative.ts:57` | `walk` | 20 | 28 | 50 | cognitive | none |
| `scripts/mcp-bench.ts:122` | `captureCase` | 20 | 19 | 73 | cognitive + crap | none |
| `scripts/mcp-locate-eval.ts:69` | `evalCase` | 18 | 16 | 54 | cognitive + crap | none |
| `scripts/lab-journal/hook.ts:43` | `run` | 17 | 20 | 53 | cognitive + crap | none |
| `scripts/mcp-bench.ts:253` | `compare` | 16 | 21 | 64 | cognitive + crap | none |
| `scripts/ask-bench.ts:216` | `capture` | 15 | 11 | 59 | crap | none |
| `scripts/editorial/voice.ts:218` | `voiceReport` | 14 | 13 | 119 | crap | none |
| `scripts/dev-tui/App.tsx:126` | `App` | 7 | 24 | 426 | cognitive | 5 commits, cooling |
| `scripts/ask-bench.ts:354` | `compare` | 13 | 19 | 112 | cognitive + crap | none |
| `scripts/cms-target.ts:40` | `fromClaudeConfig` | 13 | 7 | 21 | crap | none |
| `scripts/editorial/voice-check.ts:39` | `main` | 13 | 14 | 61 | crap | none |
| `scripts/ask-eval.ts:28` | `ask` | 12 | 14 | 32 | crap | none |
| `scripts/cms-fetch.ts:10` | `fetchDocument` | 12 | 8 | 33 | crap | none |
| `scripts/cms-target.ts:63` | `cmsTarget` | 11 | 7 | 19 | crap | none |
| `scripts/mcp-locate-eval.ts:124` | `main` | 11 | 13 | 34 | crap | none |
| `scripts/dev-tui/env.ts:8` | `parseEnvValue` | 10 | 13 | 16 | crap | none |
