# MCP — internal agent authoring

The site runs an internal-team [Model Context Protocol](https://modelcontextprotocol.io) server
at **`/api/mcp`** so agents (Claude Code, Claude Desktop, custom tooling) can author and manage
CMS content through Payload's access-control layer instead of raw REST calls.

Implementation: [`src/plugins/mcp.ts`](../src/plugins/mcp.ts), built on
`@payloadcms/plugin-mcp` (pinned to the Payload release line, currently `3.85.1`).
It is registered in [`src/plugins/index.ts`](../src/plugins/index.ts).

## Authentication and the capability model

- Keys live in the admin panel under **System → API Keys** (collection
  `payload-mcp-api-keys`). Each key is linked to a team member from `users`; every tool call
  executes **as that user** with `overrideAccess: false`, so normal collection access rules
  always apply.
- Clients authenticate with `Authorization: Bearer <api-key>` over streamable HTTP.
- On top of user-level access control, every operation (find / create / update / delete, per
  collection or global) must **also** be enabled on the key itself. The checkboxes default to
  **off** — a freshly created key can do nothing until an admin grants it capabilities.
- The key collection itself is team-only (`authenticated` on read/create/update/delete). This
  override matters: without it, Payload's default `Boolean(req.user)` access would let an MCP
  key read other keys or escalate its own capabilities via REST API-key auth.

### Connecting a client

```bash
# Claude Code
claude mcp add sas-cms --transport http https://<site-url>/api/mcp \
  --header "Authorization: Bearer <api-key>"
```

Local dev serves the same endpoint at `http://localhost:3001/api/mcp`.

## What is exposed

| Group | Collections / globals | Capabilities offered |
| --- | --- | --- |
| Website surfaces | `pages`, `posts`, `work-pages`, `expertise-pages`, `audience-pages`, `lab-pages` (from `CONTENT_SURFACES`) | Full authoring (find, create, update, delete) |
| Content Hub | `case-studies`, `lab-projects`, `organizations`, `projects`, `testimonials` | Full authoring |
| Taxonomy | `capabilities`, `categories`, `industries`, `platforms` | Full authoring |
| Assets | `asset-libraries` | Full authoring (find, create, update, delete) |
| Assets | `media` | **Read-only** (find) |
| Globals | `header`, `footer`, `site-info` | Find + update |

"Offered" means the checkbox exists on the key — each key still gets only what an admin turns on.

Media is read-only by design: MCP tools cannot send binary uploads, and new media defaults to
the internal `usageStatus` gate anyway (see [architecture.md](architecture.md) access rules).
Agents reference existing media documents by id. Asset libraries are metadata (name, organization,
project, status) — creating one also creates its root folder via the collection hook.

**Deliberately excluded** (no MCP tools at all): `users`, `subscribers`, `newsletters`
(accounts, PII, send machinery), `forms` / `form-submissions`, `redirects`, `search` (derived
index), and `payload-mcp-api-keys` itself.

## Authoring rules baked into the server

The server's MCP instructions tell agents to:

- Author page and hub documents as **drafts** (`draft: true`); publish only on explicit request.
- Send rich text as **Lexical editor state JSON** — never markdown or HTML.
- Find a document first and edit from its current state before updating.
- Pass document **ids** for relationship fields (look them up with the relevant find tool).
- Never attempt media upload; reference existing media by id.
- Asset libraries require `organization` and `project` ids; omit `rootFolder` to auto-create one.

## Security: the REST-bypass rule

MCP API keys authenticate as `req.user` over Payload's **REST/GraphQL API too**, not just at
`/api/mcp`. Per-key capability checkboxes only gate the MCP endpoint. Two defenses keep keys
from gaining team-level REST access:

1. [`src/access/authenticated.ts`](../src/access/authenticated.ts) counts only
   `user.collection === 'users'` as authenticated, so MCP-key principals fail every
   team-only access rule.
2. Plugin-created collections that default to `Boolean(req.user)` writes (redirects, forms,
   search) are overridden to `authenticated` in
   [`src/plugins/index.ts`](../src/plugins/index.ts).

**Rule for new code:** any new collection, global, or plugin override whose access uses
"any logged-in user" semantics must use the `authenticated` helper (or an equally strict
check), never `Boolean(req.user)`.

## Vendored patch (remove when upstream fixes)

`@payloadcms/plugin-mcp@3.85.1` ships broken: `convertCollectionSchemaToZod` ran the generated
Zod code through `ts.transpileModule` (CommonJS), whose `"use strict";` prologue made the
`new Function` eval return the string `"use strict"` instead of a Zod schema — then
`.partial()` on that string threw inside handler setup and **every POST to `/api/mcp` hung
with no response**. See [payload#17125](https://github.com/payloadcms/payload/issues/17125).

`patches/@payloadcms__plugin-mcp.patch` (wired via `patchedDependencies` in
`pnpm-workspace.yaml`) fixes four things: evaluates the generated schema expression directly
(no transpile), guards `.partial()`/`.shape` against the permissive fallback, and stops
sending a body on GET/HEAD requests. Drop the patch when a fixed plugin version lands; retest
`/api/mcp` initialize + tools/list after removing it.

## Operational notes

- Capability checkboxes are schema fields — adding/removing exposed collections changes the
  `payload-mcp-api-keys` table. Follow the normal migration workflow (ask before
  `pnpm migrate:create`, prescribe create/rename answers, commit `.ts`+`.json`, CI applies).
  The initial capability schema landed in `20260722_183757_mcp_authoring_capabilities`.
- Adding a plugin (or changing its admin components) also requires `pnpm generate:types` and
  `pnpm generate:importmap`.
- A new public content surface added to `CONTENT_SURFACES` is exposed to MCP automatically —
  review whether that is intended when adding surfaces.
