# MCP — internal agent authoring

The site runs an internal-team [Model Context Protocol](https://modelcontextprotocol.io) server
at **`/api/mcp`** so agents (Claude Code, Claude Desktop, custom tooling) can author and manage
CMS content through Payload's access-control layer instead of raw REST calls.

Implementation: [`src/plugins/mcp.ts`](../src/plugins/mcp.ts), built on
`@payloadcms/plugin-mcp` (pinned to the Payload release line, currently `3.88.0`).
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
| Website surfaces | Every `CONTENT_SURFACES` collection: `pages`, `posts`, `work-pages`, `lab-pages`, `expertise-pages`, `audience-pages`, `contact-pages` | Full authoring (find, create, update, delete) |
| Content Hub | `case-studies`, `lab-projects`, `organizations`, `projects`, `testimonials` | Full authoring |
| Taxonomy | `capabilities`, `categories`, `industries`, `platforms` | Full authoring |
| Assets | `asset-libraries` | Full authoring (find, create, update, delete) |
| Assets | `media` | **Read-only** (find) |
| Inbox | `ask-questions` | **Read-only** (find) |
| Globals | `home`, `header`, `footer`, `site-info`, `insights-index`, `lab-index`, `works-index` | Find + update |

"Offered" means the checkbox exists on the key — each key still gets only what an admin turns on.

The index globals (`insights-index`, `lab-index`, `works-index`) carry hero and SEO only: the listings
themselves are code-owned, so an agent can edit the opening copy but not the set.

Media is read-only by design: MCP tools cannot send binary uploads, and new media defaults to
the internal `usageStatus` gate anyway (see [architecture.md](architecture.md) access rules).
Agents reference existing media documents by id. Asset libraries are metadata (name, organization,
project, status) — creating one also creates its root folder via the collection hook.

`ask-questions` is the one visitor-sourced collection exposed. Its text is redacted on write and rows
carry no IP or visitor id, and reading it (what prospects ask, what the site cannot answer) is the
analysis a team agent is for. Read-only, and off on every key until an admin grants it.

**Deliberately excluded** (no MCP tools at all): `users`, `inquiries`, `subscribers`, `newsletters`
(accounts, PII, send machinery), `forms` / `form-submissions`, `redirects`, `search` (derived
index), and `payload-mcp-api-keys` itself.

## Authoring rules baked into the server

The server's MCP instructions tell agents to:

- Author page and hub documents as **drafts** (`draft: true`); publish only on explicit request.
- Send rich text as **Lexical editor state JSON**, never markdown or HTML. The one exception is a
  rich text field with a write-only `markdown` sibling (a Rich text block's `body`, a story
  section's and a story beat's `body`): send Markdown there and the server converts it, refuses
  syntax the field cannot hold, and will not replace existing content without `replace: true`.
  See [figures.md](figures.md#markdown-input).
- Write charts and diagrams as `chart` and `diagram` blocks carrying a JSON `spec`; never send a
  diagram's `geometry` (computed on save). A save answers an invalid spec with every problem by
  path in the error message. See [figures.md](figures.md) and the `article-authoring` skill.
- Find a document first and edit from its current state before updating.
- Pass document **ids** for relationship fields (look them up with the relevant find tool).
- Never attempt media upload over MCP; reference existing media by id. New images go through
  `pnpm cms:upload`, which sends the same key to `POST /api/agent/media`. That endpoint needs the
  key's **Upload media** capability, acts as the key's linked team member, and always lands the
  file internal for a person to approve ([figures.md](figures.md#media-upload)). It is the one
  REST door open to an MCP key; every team-only rule stays closed to it.
- Asset libraries require `organization` and `project` ids; omit `rootFolder` to auto-create one.
- Case Study and Lab Project narrative is section-owned: `context`, `challenge`, `strategy`,
  `approach`, `outcomeSummary`, and `learnings` each contain `body` plus ordered `storyBeats`.
  Beat keys are stable and unique within their section. Work and Lab Page blocks reference a beat
  with the section in `source`, `storyScope: 'beat'`, and `storyBeatKey`; there is no global
  `story-beat` source.

## Known issue: an MCP edit does not refresh the rendered page

Found 2026-09-19 publishing the Privacy Policy. An `update*` call that publishes a document runs the collection's revalidation hook, and the log says so ("Revalidated Page at /privacy-policy"), but the CDN keeps serving the old prerender (`x-vercel-cache: HIT`, the age still counting from before the edit). Same on preview and production. The likely cause: `mcp-handler` answers over a stream and returns its `Response` before the tool has run, so Next has already flushed the request's pending revalidations by the time the hook calls `revalidatePath`, and the late call is dropped without an error. Saves from the admin are ordinary requests and are not affected.

Until it is fixed, a document published over MCP goes live on the next deployment (`vercel redeploy <deployment-url>` rebuilds the prerender from the database), or when someone re-saves it in the admin. A fix worth trying: have the hooks, on an MCP request, call a small secret-protected route that does the `revalidatePath` inside its own request.

The configured `sas-cms` server is **production** (`https://www.suits-sandals.com/api/mcp`), as of 2026-09-20. Authoring over MCP therefore writes production content; keep drafts as drafts and publish only on request. Preview is a separate database branch at `https://preview.suits-sandals.com/api/mcp` and the same key works there, so an edit meant for both has to be made twice. Preview is not registered by default: add it as `sas-cms-preview` when you need it.

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

`@payloadcms/plugin-mcp@3.88.0` still needs the vendored patch: `convertCollectionSchemaToZod` ran the generated
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
