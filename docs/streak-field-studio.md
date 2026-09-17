# Streak Field Studio

Studio lives in Payload under **Assets > Streak Fields**. The plugin is registered in `src/plugins/index.ts`.

## Editorial workflow

1. Create a look and choose a built-in starter. Give it a title, folder, and tags.
2. Open the live preview. Tune composition, color, motion, relief, life, and interaction. Switch ground and placement, pause/restart, compare, undo, or reset a group. Native Payload autosave and Versions preserve draft history.
3. Click **Publish release**. This saves the current draft and queues exact-frame light and dark posters. You can close the browser. Recent renders shows progress, errors, cancellation, and retry.
4. Choose **Published Studio release** in any Streak Field visual slot, including heroes, blocks, tabs, and menu previews. This pins an immutable version. Existing built-in selections and slot overrides continue to work. Clear a slot seed to inherit the authored seed.
5. Open **Export artwork** for PNG, WebP, or filled JPEG. Logical width/height, 1x/2x output scale, ground, alpha, seed, and frame determine the result. Finished artwork is filed in Media's Streak Field Studio folder.

Archive hides a source from new selections. Referenced releases and their posters cannot be edited or deleted, so page version restoration stays valid. Unused drafts can be deleted; looks with release/render history should be archived. A release's Used by panel includes current content and retained page versions.

Publishing does not publish a page. If someone edits a look while its posters render, the completed release remains available and the newer draft stays untouched. Republishing identical settings reuses the completed release. Restoring and publishing older settings does not rewrite earlier releases.

## Single source of truth

- `features/immersive/ui/streak-field-tuning.ts`: effect defaults.
- `features/immersive/studio/recipe.ts`: authorable parameters, validation, production envelope, capture limits.
- `features/immersive/visual/placement.ts`: existing placement ceilings.
- `features/immersive/visual/posters.ts`: page and menu poster resolution.
- `plugins/streak-studio`: collections, authorization, publication, worker leases, and admin UI.

Drafts store versioned deltas. Releases store complete light/dark snapshots, a source hash, renderer version, capture build identity, and immutable poster manifests. Server resolution batches nested release references per document and deduplicates them in request context. Public pages receive a compact descriptor, never the library or editor. A server-loaded release renders through the existing poster-first lazy adapter and its admission, pause, visibility, reduced-motion, capability, and fallback behavior.

The initial authoring envelope fixes strokes at one segment and caps noise octaves, count, DPR, and high-overdraw combinations. Limits apply after creative overrides. Studio uses the same effective limits. This conservative envelope is a policy, not proof of 60 fps on every GPU; use the existing performance measurement runbook for target-device qualification. Software Chromium capture is not a real-device benchmark.

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

Preview deployments run on their own Neon branch. The Neon deployment action on the Vercel store connection is enabled for `production` and `preview`, so each git preview deployment (the `preview` branch) gets a Neon branch named `preview/<git-branch>` forked from the production branch, and the branch connection variables are injected at deploy time (they are not stored in Vercel env settings). The build then runs `payload migrate` against that branch, so the production ledger only changes on `main` deploys. The Vercel-managed Neon project is not visible to the local Neon CLI; manage branches from the Vercel Storage tab (Open in Neon) or with a Neon org API key.

Optional follow-latest selection, bulk page upgrades, and placement-specific poster generation remain outside this pinned-release workflow. Slot overrides and crop can differ from the library poster; use an exported still through the existing poster override when exact art direction matters.
