# Streak Field Studio

Studio lives in Payload under **Assets > Streak Fields**. The plugin is registered in `src/plugins/index.ts`.

## Editorial workflow

A look opens as a design tool: the Inspector in the document sidebar, the stage on the Studio tab, and the document's own tabs for everything else.

1. **Studio tab.** The stage shows the live field at a placement (hero, block, menu, card) on a dark or light ground, with a budget line under it (particles, DPR, octaves, segments; amber when the placement cap bites). Starters load a shipped look into the draft. Versions lists the draft, a kept comparison and every release; Draft and Kept switch the stage between them. Seed and capture frame sit under the stage. Undo and redo hold fifty steps for the page (⌘Z, ⇧⌘Z). Space pauses, R randomizes the seed, C toggles the comparison while the stage has focus.
2. **Inspector (sidebar).** Look, Pointer and Export tabs. On the Look tab every section starts closed, on every document, so the panel opens as a contents page: each header carries the section's summary and a dot when something in it departs from the default. The double chevron at the right of the tab strip opens or closes them all. Pointer is a single group, so its rows are flat, with Reset beside the note above them. Every numeric parameter is a slider row: label, a track with an always-visible thumb, and a value field. The label's tooltip carries the parameter's meaning, range, step and default; a dot, blue fill and a tick at the default mark a changed value; option-click the label to reset it, or Reset a group from its header. A row that needs another setting (Flow speed under Drift) shows muted with the reason and a one-click fix. Min and max length share one track with two thumbs that cannot cross; only the fields can, and the server's message shows under the row.
3. **Publish release** saves the draft and queues exact-frame light and dark posters. Close the page if you like; the Renders tab shows progress, errors, cancellation and retry, and the Releases tab lists every immutable release with its posters.
4. **Details tab** holds title, description, tags, thumbnail, archive and authorship. Edits there never touch the recipe.
5. Choose **Published Studio release** in any Streak Field visual slot, including heroes, blocks, tabs, and menu previews. This pins an immutable version. Existing built-in selections and slot overrides continue to work. Clear a slot seed to inherit the authored seed.
6. **Export** (Inspector tab) renders a PNG, WebP, or filled JPEG still: logical size, 1x or 2x scale, ground and alpha. Finished artwork is filed in Media's Streak Field Studio folder and listed under Renders.

Archive hides a source from new selections. Referenced releases and their posters cannot be edited or deleted, so page version restoration stays valid. Unused drafts can be deleted; looks with release/render history should be archived. A release's Used by panel includes current content and retained page versions.

Publishing does not publish a page. If someone edits a look while its posters render, the completed release remains available and the newer draft stays untouched. Republishing identical settings reuses the completed release. Restoring and publishing older settings does not rewrite earlier releases.

### Admin UI stack

The Studio components (`src/plugins/streak-studio/components`) are built from the site's shadcn primitives in `src/components/ui` (Slider, Tabs, ToggleGroup, Tooltip, Select, Input, Kbd) and Payload's own `Collapsible`, `Button`, `Link` and `toast`. Tailwind reaches the admin through one plugin-owned entry, `components/studio.css`: utilities only (no preflight), sourced from the primitives and the plugin, with the shadcn tokens painted from Payload's `--theme-*` scale so the Studio follows the admin's light and dark toggle. The token map, state variants and press recipe are shared with the site through `src/styles/shadcn-theme.css`. Nothing overrides Payload's own classes, every hook is a public `@payloadcms/ui` export, and components are registered by import-map path, so a Payload upgrade changes nothing here beyond what it changes for any custom field.

## Single source of truth

- `features/immersive/ui/streak-field-tuning.ts`: effect defaults.
- `features/immersive/studio/recipe.ts`: authorable parameters, validation, production envelope, capture limits.
- `features/immersive/visual/placement.ts`: existing placement ceilings.
- `features/immersive/visual/posters.ts`: page and menu poster resolution.
- `plugins/streak-studio`: collections, authorization, publication, worker leases, and admin UI.

Drafts store versioned deltas. Releases store complete light/dark snapshots, a source hash, renderer version, capture build identity, and immutable poster manifests. Server resolution batches nested release references per document and deduplicates them in request context. Public pages receive a compact descriptor, never the library or editor. A server-loaded release renders through the existing poster-first lazy adapter and its admission, pause, visibility, reduced-motion, capability, and fallback behavior.

The initial authoring envelope fixes strokes at one segment and caps noise octaves, count, DPR, and high-overdraw combinations. Count is the one resource number the Inspector may set (Composition, 100 to 8000): it is what density reads as, and its range stops at the hero ceiling, so a recipe can ask for less than code allows and never for more. Limits apply after creative overrides. Studio uses the same effective limits. This conservative envelope is a policy, not proof of 60 fps on every GPU; use the existing performance measurement runbook for target-device qualification. Software Chromium capture is not a real-device benchmark.

## Rendering and operations

`/api/streak-render/run` is a dedicated Vercel function with a 300-second budget. It contains Chromium and Playwright; website routes do not. Publishing starts it via `after()`. It claims one durable `streak-renders` job, captures through `/streak-capture`, and sends results to the authenticated completion endpoint. Completion starts another invocation when queued work remains. The existing external Payload jobs workflow also drains the queue after this branch is merged to the default branch.

A transaction-scoped advisory lock serializes claims. Only one unexpired render lease is active across workers. Leases last ten minutes and retry at most three times. A stale or cancelled worker cannot commit. Finishing a release and marking its job complete share a database transaction. Published source promotion checks the latest draft under a parent-row lock, so it cannot replace newer work.

The capture harness mounts the shared `FieldScene`, advances fixed 1/60-second simulation steps with neutral pointer input, draws the final frame, and reads PNG pixels. Intermediate visible draws are skipped; flow simulation steps still run. Output scale changes pixel resolution without changing the logical layout. Generated files, rather than a promise of identical pixels across GPU drivers, are authoritative. Renderer compatibility changes require a version bump; unsupported website releases fall back to their preserved posters.

Required configuration:

- `CRON_SECRET` (existing) or `STREAK_WORKER_SECRET`: worker-only authorization. Team cookies and MCP keys cannot invoke worker endpoints.
- Vercel supplies `VERCEL_URL` for self-invocation and capture.
- `VERCEL_AUTOMATION_BYPASS_SECRET` is needed if deployment protection blocks worker requests.
- Existing R2 and Media configuration stores outputs.

Local or external runner:

```sh
STREAK_STUDIO_URL=http://localhost:55000 pnpm exec tsx --env-file=.env scripts/streak-studio-worker.ts
```

Install the Playwright browser first with `pnpm exec playwright install chromium`. For a deployed target, provide its matching worker secret through the environment. The runner handles up to five jobs per call. The GitHub workflow accepts a preview URL for manual runs; scheduled runs use `STREAK_STUDIO_URL` or the existing Payload jobs URL.

If a function is interrupted, another worker invocation reclaims its expired lease. Failed jobs can be retried from Studio. No rendering or image encoding runs inside a visitor page request.

## Database and rollout

`20260917_220809_streak_field_studio` adds looks, native versions, immutable releases, render jobs, and indexed release relationships across every existing visual slot and version table. Existing presets and content are retained. Local development uses Drizzle push; deployment CI applies the generated migration. No migrations are applied to the local push-managed database.

Preview deployments run on their own Neon branch. The Neon deployment action on the Vercel store connection is enabled for `production` and `preview`, so each git preview deployment (the `preview` branch) gets a Neon branch named `preview/<git-branch>` forked from the production branch, and the branch connection variables are injected at deploy time (they are not stored in Vercel env settings). The build then runs `payload migrate` against that branch, so the production ledger only changes on `main` deploys. The stored connection variables still resolve to production for every environment (the Neon action only fires when they do), so `pnpm ci` runs `scripts/guard-preview-db.ts` first: a non-production build that sees the `PRODUCTION_DB_ENDPOINT` host, or no `POSTGRES_URL` at all, aborts before `payload migrate` instead of touching production. The Vercel-managed Neon project is not visible to the local Neon CLI; manage branches from the Vercel Storage tab (Open in Neon) or with a Neon org API key.

Optional follow-latest selection, bulk page upgrades, and placement-specific poster generation remain outside this pinned-release workflow. Slot overrides and crop can differ from the library poster; use an exported still through the existing poster override when exact art direction matters.
