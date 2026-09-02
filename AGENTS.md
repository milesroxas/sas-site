# sas-site — Agent instructions

Canonical always-on rules for **Cursor, Claude Code, and OpenAI Codex**.

Keep this file short. Deep Payload reference lives in skills and `.cursor/rules/` (see [Where to look](#where-to-look)).

## Non-negotiables

- Solve only what was asked. Prefer existing patterns. Use **pnpm** and project import aliases.
- Never use em dashes in prose. Applies to chat replies, code comments, commit messages, docs, PR bodies, UI copy, and design/placeholder content. Recast with a comma, colon, parentheses, or a period. Exception: numeric figures and ranges may use an em or en dash (50—100K, 1–3 months).
- TypeScript-first; import types from `@/payload-types` after schema work.
- After schema changes you may run `pnpm generate:types` and `pnpm generate:importmap` without asking.
- Validate with `tsc --noEmit` when you change types/config meaningfully.
- Generate import maps after creating or modifying admin components.

## Database & migrations

**Push in dev, migrations in CI.** Human docs: [README.md](README.md#database--migrations). Cursor mirror: `.cursor/rules/database-migrations.mdc`.

### Hard prohibitions

- **Do not** run `pnpm migrate:create` / `payload migrate:create` unless the user explicitly asks in this conversation. Say a migration is needed and wait.
- **Never** run `payload migrate` (or CI’s migrate step) locally — mixing push and migrations corrupts the ledger.
- **Never** run raw `payload migrate:status` against local. Use `pnpm migrate:status` only for the **production** ledger (needs `.env.production.pulled`).

### Workflow

1. Change Payload config / collections / globals / fields / blocks.
2. Local schema syncs via Drizzle **push** when `pnpm dev` runs (`push` on unless `PAYLOAD_DB_PUSH=false`).
3. Regenerate types/import maps if needed (allowed without asking).
4. Ask before `pnpm migrate:create`. On approval, review and commit `.ts` + `.json` together. CI (`pnpm ci`) applies to production.
5. Prefer `migrate:create` (after approval) over hand-written schema migrations.
6. After generating/editing a migration, run `pnpm check:migrations`. **Never ship** `ALTER TYPE ... ADD VALUE 'x'` plus use of `'x'` (e.g. `SET DEFAULT`) in the same `up()` — Payload runs migrations in a transaction and Postgres rejects that (`unsafe use of new value`). Recreate the enum in one migration, or split ADD VALUE and use across two migrations. Details: `.cursor/rules/database-migrations.mdc`.
7. **Converting `text` → `select` (enum):** the generated `USING col::enum` cast fails in CI on any production value outside the enum — including `''`. Check real production values first (sas-cms MCP `find*` tools), then add normalizing `UPDATE`s before the cast (lower/trim; NULL anything not in the enum). `pnpm check:migrations` enforces this.
8. **Migration must cover every schema change in the branch.** Adding a field after a migration was generated leaves prod missing the column — local build passes (dev push syncs it), prod prerender dies with `column does not exist`. Before commit, diff the migration's columns against the fields you added; if a field came later, regenerate the migration (ask first).
9. **Parallel workspaces (Conductor):** each workspace has its own push-synced DB — no DB-level conflicts. But `migrate:create` diffs against the newest snapshot **file**, not a DB: if `main` gained a migration after yours was generated, rebase, delete your `.ts` + `.json`, regenerate (ask first). `pnpm check:migrations:drift` verifies; the pre-push hook runs it. See [docs/conductor.md](docs/conductor.md).

### Required: create / rename prompt answers

`migrate:create` may ask whether each new table/column is a **create** or a **rename**. Wrong answers can drop data.

**Whenever your completed work would trigger those prompts, end with an answer sheet** — even if you do not run `migrate:create`.

Include:

1. Suggested command: `pnpm migrate:create <short-name>` (do not run unless asked).
2. Numbered expected prompts with **exactly which option to choose**.
3. One-line reason each (preserve data vs brand-new).

Heuristics: renamed logical entity (field / collection slug / block slug / its generated table) → **rename** from the old name; brand-new entity → **create**; unsure → safer option for data and say what to verify. If additive-only and you expect **no** such prompts, say so.

```md
### migrate:create prompt answers
Run when ready: `pnpm migrate:create home-global`

1. `home` table — **create table** (new global; no prior table)
2. Is `pages_blocks_foo` created or renamed? — **rename** from `pages_blocks_bar` (block slug `bar` → `foo`; keep rows)
```

## Security (Payload)

- Local API **bypasses access control by default**. When passing `user`, always set `overrideAccess: false`.
- Always pass `req` into nested Local API calls inside hooks (transactions).
- Prevent hook loops with `req.context` / `context` flags.
- Field-level access returns **boolean only** (no query constraints).
- Ensure roles exist when changing collection/global access controls.

### Never `Boolean(req.user)` for team-only access

This repo’s MCP plugin authenticates API keys as `req.user` on REST/GraphQL too. `Boolean(req.user)` would grant MCP keys team access. Use `authenticated` from `src/access/authenticated.ts` (`user.collection === 'users'`) for team-only rules — including plugin-created collections. See [docs/mcp.md](docs/mcp.md).

## Stack conventions

- Prefer server components; client components only for state/effects/browser APIs.
- **Every new visual UI ships with a Storybook story** — blocks, `components/ui` primitives (including shadcn installs), and visual shared components. Server blocks that fetch (Payload Local API) story their client piece with fixtures from `src/blocks/fixtures.ts` / `richTextFixture`. Admin-only and non-visual components are exempt.
- Admin custom components: file paths relative to importMap `baseDir` (not direct imports in config).
- Drafts: use `versions.drafts` / `_status`; don’t invent a parallel publish `status` field unless the codebase already has one for that collection.
- Typography: headings/lead body use the fluid type-scale tokens (`text-display`, `text-heading-1..3`, `text-lead` — defined in `globals.css` `@theme`), never raw `text-4xl md:text-6xl` stacks. Tokens own size/leading/tracking/weight; call sites own layout (max-w, alignment, spacing, color) and may override weight/leading for art direction.
- Block spacing: every composition block's root is `Section` (or the work-page `RevealSection`), which owns the vertical rhythm via `spacing` — `normal` (default) / `loose` (media-forward) / `none` (block owns a pinned shell). Blocks never write their own `py-*`/`my-*`, renderers never add margin, and theme never changes spacing. Full-viewport height (`fullViewportSectionClassName`) is for page-level sections only, never a composition block.
- Immersive effects: import from `@/features/immersive` (barrel only). Tuning lives once — exported `*_DEFAULTS` per effect, delta-only presets in `src/features/immersive/presets.ts`; never restate defaults; second usage of a tuning → promote to a named preset. See [docs/immersive-effects.md](docs/immersive-effects.md).

## Where to look

| Need | Location |
|------|----------|
| DB / migrate:create (Cursor always-on) | `.cursor/rules/database-migrations.mdc` |
| Payload how-to (collections, fields, hooks, queries, …) | `.agents/skills/payload` — use the **payload** skill |
| CMS content migration from another system | `.agents/skills/cms-migration` |
| WebGL / shaders / R3F / TSL / motion physics | `.agents/skills/creative-webgl-shaders` — use the **creative-webgl-shaders** skill |
| Immersive effects — usage, defaults/presets contract | [docs/immersive-effects.md](docs/immersive-effects.md); Cursor rule `.cursor/rules/immersive-effects.mdc` |
| Animations — reveals, route transitions, tuning workflow | [docs/animations.md](docs/animations.md) |
| CMS admin naming (tabs, groups, overrides, blocks) | [docs/cms-naming.md](docs/cms-naming.md) |
| Cursor topic rules (security, fields, hooks, …) | `.cursor/rules/` |
| Human DB docs | [README.md](README.md#database--migrations) |
| Conductor — parallel workspaces, per-workspace DBs, schema changes across branches | [docs/conductor.md](docs/conductor.md) |
| Architecture | [docs/architecture.md](docs/architecture.md) |
| MCP authoring | [docs/mcp.md](docs/mcp.md) |

Claude Code loads this file via root `CLAUDE.md` (`@AGENTS.md`). Codex loads this file natively. Cursor loads this file and always-apply `.cursor/rules/*.mdc`.
