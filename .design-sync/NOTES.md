# design-sync notes — sas-site

## Repo shape

- Next.js 16 app (Payload CMS), NOT a packaged library — no `dist/`. The bundle
  compiles straight from source via `.design-sync/entry.ts` (barrel of all
  storied components), passed as `--entry`/`cfg.entry`.
- `publishConfig.types: ".design-sync/entry.ts"` was added to `package.json` so
  the converter's ts-morph export/props extraction finds the barrel (the app has
  no `types` field; `publishConfig` is inert for a never-published app).
- Storybook 10 (`.storybook/`, nextjs-vite builder), stories under `src/**`.
  Reference build: `npx storybook build -c .storybook -o .design-sync/sb-reference`.

## Fixes / gotchas

- `[GENERAL]` npm react 19.2 has no `ViewTransition` export; the app runs Next's
  vendored canary React (see `.storybook/main.ts` aliases). Fix:
  `.design-sync/vt-polyfill.ts` (entry's first import) patches
  `window.React.ViewTransition` to a children-passthrough. Affects Card/PostHero.
- `[GENERAL]` bundled Next client internals (next/link etc.) reference
  `process.env.*` at module scope/render → `process is not defined` in every
  preview, and "root empty" for components whose render died on it. Fix: same
  vt-polyfill defines `globalThis.process = {env:{}}` before any Next code
  evaluates. Verified by probe before rebuilding.
- `[GENERAL]` vt-polyfill also sets `data-theme="light"` on <html> when unset —
  the app's theming keys off that attribute (storybook sets it via
  withThemeByDataAttribute; the decorator chain doesn't bundle here, see below).
- Preview decorator bundle fails on `.woff2` (`.storybook/preview` imports
  `fonts.css` → geist woff2; decorator bundler has no font loaders). Deliberate:
  decorators are theme-attr-only, no provider chain — previews don't need them.
  `cfg.provider` left unset; theme default handled by vt-polyfill.
- `[GENERAL]` App Router context: FormBlock / RelatedPosts / PostCard call
  `useRouter` and threw "invariant expected app router to be mounted".
  `.design-sync/preview-provider.tsx` exports `PreviewAppRouter` (mock router +
  pathname), exported from the barrel and wired via `cfg.provider`. Storybook
  gets the same thing from `parameters.nextjs.appDirectory`.
- `[GENERAL]` `next/image` default import resolved to the module NAMESPACE
  (`{default, getImageProps}`), so React threw "Element type is invalid" inside
  `ImageMedia`. Cause: `next/image` has no package `exports` map → esbuild takes
  its CJS entry, and because this repo is `"type": "module"` esbuild applies
  Node CJS interop (default = module.exports). Fix:
  `.design-sync/next-image-shim.ts` unwraps to the real component, mapped in
  `.design-sync/tsconfig.json` (`cfg.tsconfig`) so ONLY the sync build sees it —
  the app's tsconfig and Next's bundler are untouched. Verified in-browser
  before rebuilding ($$typeof === react.forward_ref).
- Story imports of components whose file is `Component.tsx` (blocks) don't
  auto-shim to the bundle global (matcher keys on file/dir name), so they bundle
  from source and pull a PRIVATE next/navigation copy — a second AppRouterContext
  the provider can't reach. Fix: `cfg.storyImports.shim` lists those paths.
- Story title collision: `Components/Card` vs `UI/Card` both end in segment
  "Card" (titleMap keys on single segments) → renamed the story title to
  `Components/PostCard` in `src/components/Card/index.stories.tsx`, and the
  barrel exports the post card as `PostCard`. `cfg.storyImports.bundle:
  ["components/Card/index"]` keeps that story's relative import from mis-shimming
  to the shadcn `Card` global (dir-name match would hit first).
- `titleMap` keys are single title SEGMENTS, not full titles (Banner →
  BannerBlock, Tabs → FeatureTabsBlock, …).
- Full `package-build` is SLOW here (~30–40 min): 29 preview compiles, each
  bundling the app's heavy closure (richtext-lexical, next). No preview cache —
  batch every global fix before paying a rebuild. `--skip-dts` saves the dts
  stage but previews dominate.
- Story fixtures reference app-relative asset URLs (from `public/`) → preview
  pages 404 them (`ERR_FILE_NOT_FOUND` under file://). Media-bearing components
  need per-component handling or acceptance at grading.

- `[GENERAL]` Images: `next/image` routes every src through `/_next/image`,
  which doesn't exist on a static preview page → all images 404. Fix:
  vt-polyfill sets `process.env.__NEXT_IMAGE_OPTS = {...imageConfigDefault,
  unoptimized: true}` before next/image initialises, so the src is emitted
  as-is. The fixture URL must then be absolute — `src/blocks/fixtures.ts`
  points at `https://preview.suits-sandals.com/website-template-OG.webp`.
  That file is a static `public/` asset, NOT an uploaded Media doc, so it is
  NOT on `media.suits-sandals.com` (checked 2026-07-21: 404 there; `www` and
  apex don't serve it either). If the preview domain goes away, story images
  break in both Storybook and the synced previews.
- CSS + fonts: the converter's heuristic picked `view-transition.css` (3 KB) as
  the style entry, so previews rendered UNSTYLED while the sheets still
  "matched" nothing. The compiled Tailwind build only exists in the storybook
  output, so `.design-sync/compiled.css` is a COPY of the largest
  `sb-reference/assets/*.css` (content-hashed name, hence the copy) wired via
  `cfg.cssEntry`. **Re-sync step: refresh that copy whenever sb-reference is
  rebuilt** — `cp "$(ls -S .design-sync/sb-reference/assets/*.css | head -1)"
  .design-sync/compiled.css`. Geist ships via `cfg.extraFonts` →
  `.design-sync/fonts.css` + `.design-sync/fonts/*.woff2`.
- `cfg.tsconfig` → `.design-sync/tsconfig.json`. Setting it activates the
  converter's own paths plugin, which returns the first existing candidate and
  tries the bare path before `/index.*` — so every alias that names a DIRECTORY
  must be listed explicitly before the `@/*` wildcard. Regenerate that list by
  scanning `src` for alias imports that resolve to directories when new ones
  appear.

## Re-sync risks

- **First successful upload landed 2026-07-22** into project
  `7a2f1269-e2c4-4265-8d83-f31c7125ed90` (Suits & Sandals Design System). Prior
  runs built the bundle but never populated the project; it was EMPTY with no
  `_ds_sync.json` anchor at this run's start, so this was a full first-scope
  verify + atomic bulk upload. Future runs are anchored — expect fast, scoped
  re-syncs (`--remote`).
- **`[GRID_OVERFLOW] wide` on 10 components** — ContentBlock, PostCard,
  FeatureHeadingOffsetBlock, AskWidget, Bubble, Card, Field, InputGroup,
  Message, MessageScroller — their stories render wider than a grid cell and
  were cropped in the product card. Fixed with `cfg.overrides.<Name>.cardMode:
  "column"` (added to config alongside the pre-existing CodeBlock:column).
  Presentation-only → applied via targeted `preview-rebuild.mjs`, grades carry,
  sidecar renderHashes patched. If a NEW story is added to any of these that is
  itself over-wide, `column` still covers it (one story per row); only a
  fixed/portal `escape` flag would need `single` instead.
- **CDN-dependent story images** (carried from Fixes section): media-bearing
  stories reference `https://preview.suits-sandals.com/website-template-OG.webp`
  (a static `public/` asset, NOT on media.suits-sandals.com). If that preview
  domain goes away, MediaBlock/PostCard/RelatedPosts story images break on BOTH
  the storybook oracle and synced previews — grades would then be judged against
  broken images. Re-verify the domain resolves before trusting media-component
  grades on a re-sync.
- **compiled.css is a manual copy** of the largest `sb-reference/assets/*.css`
  (content-hashed name). MUST be refreshed whenever sb-reference is rebuilt:
  `cp "$(ls -S .design-sync/sb-reference/assets/*.css | head -1)"
  .design-sync/compiled.css`. Stale copy → previews render against old Tailwind
  output while grades still "match" nothing changed. Done this run.
- **Build is slow (~30–40 min)**: 29 preview compiles each pulling the heavy
  Next + richtext-lexical closure; no preview cache. Targeted `preview-rebuild
  --components` also pays ~1 min/component here (10 comps ≈ >2 min). Batch all
  config edits before paying a full rebuild.
- **Grades: all 29 components graded `match`** (cached grades carried; sb-ref
  rebuilt for the R2/video source change re-keyed nothing to mismatch). No
  `close`, no skips. render-check: 29 total, 0 bad / 0 thin / 0 variantsIdentical.
- **Concurrent git activity observed 2026-07-22**: HEAD moved mid-run
  (3687ff7 → ee273b8, migrations/docker commits) while the durable `.design-sync/`
  set stayed clean vs HEAD. The config (11 cardMode overrides), conventions.md,
  and compiled.css were already committed. Re-sync inputs are intact; just be
  aware the repo branch can shift under a long run.
