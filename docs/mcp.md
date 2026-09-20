# MCP: internal agent authoring

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
  **off**: a freshly created key can do nothing until an admin grants it capabilities.
- The key collection itself is team-only (`authenticated` on read/create/update/delete). This
  override matters: without it, Payload's default `Boolean(req.user)` access would let an MCP
  key read other keys or escalate its own capabilities via REST API-key auth.

### Connecting a client

```bash
# Claude Code
claude mcp add sas-cms --transport http https://<site-url>/api/mcp \
  --header "Authorization: Bearer <api-key>"
```

Local dev serves the same endpoint at `http://localhost:3001/api/mcp` (in a Conductor workspace,
whichever port that workspace's own `pnpm dev` is on).

Cursor reads the project server from `.cursor/mcp.json`, which points at **production** and
takes the key from `SAS_CMS_MCP_KEY` ([agent-skills.md](agent-skills.md#mcp-servers)).
`pnpm cms:upload` reads the same key from `CMS_MCP_API_KEY`.

## What is exposed

The source of truth is [`src/plugins/mcp.ts`](../src/plugins/mcp.ts); this table mirrors it.

| Group | Collections / globals | Capabilities offered |
| --- | --- | --- |
| Website surfaces | Every `CONTENT_SURFACES` collection: `pages`, `posts`, `work-pages`, `lab-pages`, `expertise-pages`, `audience-pages`, `contact-pages` | Full authoring (find, create, update, delete) |
| Content Hub | `case-studies`, `lab-projects`, `organizations`, `projects`, `testimonials` | Full authoring |
| Taxonomy | `capabilities`, `categories`, `industries`, `platforms` | Full authoring |
| Operations | `forms`, `redirects` | Full authoring |
| Newsletter | `audiences`, `newsletters` | Full authoring. Sending is not reachable: see below |
| Assets | `asset-libraries` | Full authoring |
| Assets | `streak-looks` | Full authoring, **drafts only**: publishing a look happens in the Studio |
| Assets | `media` | **Read-only** (find) |
| Visitor records | `inquiries`, `form-submissions`, `subscribers`, `ask-questions` | **Read-only** (find) |
| Globals | `home`, `header`, `footer`, `site-info`, `insights-index`, `lab-index`, `works-index` | Find + update |

"Offered" means the checkbox exists on the key. Each key still gets only what an admin turns on,
and every call still runs through the linked team member's own access rules.

The index globals (`insights-index`, `lab-index`, `works-index`) carry hero and SEO only: the listings
themselves are code-owned, so an agent can edit the opening copy but not the set.

Media is read-only by design: MCP tools cannot send binary uploads, and new media defaults to
the internal `usageStatus` gate anyway (see [architecture.md](architecture.md) access rules).
Agents reference existing media documents by id. Asset libraries are metadata (name, organization,
project, status); creating one also creates its root folder via the collection hook.

Studio looks (`streak-looks`) are authorable as drafts. An agent can create one (a title, an
`effect` and a `recipe`), retune it, archive it, and delete it, and it can look one up to put its
id in a visual slot's `studio` field. It cannot publish one: a look is published from the Studio,
where the editor's browser renders its posters, and the collection's own hook refuses any other
publish ("Use Publish in Studio"). So the split is the same as for pages: the agent drafts, a
person looks at it on the stage and publishes. A page only publishes with a published look of the
slot's own effect ([streak-field.md](streak-field.md)).

Two things an agent drafting a look works without. It cannot see the result, so it tunes from the
numbers and the brief, and the server instructions tell it to say so and hand over to the Studio.
And a recipe's `deltas` depend on the look's `effect`, which JSON Schema cannot express, so the
tool schema carries every parameter and range as text, generated from the effect contracts
([`recipe-schema.ts`](../src/features/immersive/studio/recipe-schema.ts)); `validateRecipe`
refuses a bad name or value on save, drafts included. Defaults are left out of that text on
purpose (they move with every tuning pass): the `snapshot.dark` of a published look of the same
effect shows every resolved value.

Newsletters can be composed and targeted, never delivered. Sending runs through the send endpoint
and its job, and access control freezes sending and sent campaigns.

Visitor records are exposed for analysis and triage (what prospects ask, what the site cannot
answer, who is waiting on a reply), never for authoring. `inquiries`, `form-submissions` and
`subscribers` carry contact PII. `ask-questions` is redacted on write, carries no IP or visitor
id, and is deleted after the Ask retention window. All four are off on every key until an admin
grants them, and the server instructions forbid copying that PII into published content or
sending it anywhere outside the workspace. That rule is an instruction, not an enforced check.

The index globals (`insights-index`, `works-index`) carry hero and SEO only; the lists themselves
are code-owned.

**Deliberately excluded** (no MCP tools at all):

- `users` and `payload-mcp-api-keys`: the auth and capability control plane. A key that could
  write either could mint an admin or widen its own capabilities.
- `search`: a derived index rebuilt by plugin hooks, so writes would be clobbered.
- `streak-releases` and `streak-renders`: Studio machinery. Nothing reads a release any more,
  and a render row is a poster lease, not content.
- Payload internals: `payload-jobs`, `payload-kv`, `payload-folders`,
  `payload-locked-documents`, `payload-preferences`, `payload-migrations`.

## Deleting

Every delete over MCP takes explicit confirmation, on every collection that offers `delete`.

1. The first `delete*` call deletes nothing. It answers with the document it would delete (title,
   collection, id, status) and a confirmation token.
2. The agent shows the user that document and waits for an explicit yes in the conversation.
3. It calls again with the same `id` and the token in `confirm`, and the document is deleted.

The token is an HMAC of the collection, the id and the document's `updatedAt` under the Payload
secret, so it names one document in one state: it cannot be guessed, reused for another document,
or spent after the document has changed, and being stateless it holds across serverless
instances. A delete by `where` can never pass, because no one token fits several documents, so
cleanup is one confirmed document at a time. A collection's own guards run first, so a look or a
case study that is still in use answers "in use" without asking for a confirmation at all.

What is enforced and what is not. The server guarantees two deliberate calls and that the agent
has seen exactly what it is about to remove. It cannot prove a person said yes; nothing on the
server can. That half is the server instruction (never confirm on your own, prefer a reversible
step such as unpublishing or `archived` on a look) and the client's own approval prompt, which
the delete tools now ask for with the `destructiveHint` annotation. Keep delete tools out of any
client allowlist that skips prompts.

The rule lives in [`src/plugins/mcp-delete-confirmation.ts`](../src/plugins/mcp-delete-confirmation.ts),
a `beforeDelete` hook that only acts when `req.payloadAPI === 'MCP'`; deletes from the admin,
REST and the Local API are untouched. The `confirm` input and the annotation come from the
vendored patch below.

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
- Omit `slug`, `key` and `generateSlug` on create and update: slugs generate from the title or
  name, and any value sent is normalized to a URL-safe slug ([`src/fields/slug.ts`](../src/fields/slug.ts)).
- Reference a Studio look by id in a visual slot's `studio` field; find one with the
  `streak-looks` find tool. A look may be drafted, never published: hand it to a person to check
  in the Studio.
- Never delete without the user's explicit confirmation of each document by name; see
  [Deleting](#deleting).
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
- Treat visitor records as read-only PII: read them for analysis and triage, never copy them
  into published content or send them outside the workspace.
- Follow the house style in every piece of copy, titles, captions and labels included: no em
  dashes ([AGENTS.md](../AGENTS.md)).

Collection and global descriptions in `mcp.ts` are what an agent reads when choosing a tool, so
they follow the same style. The `article-authoring` skill is the long-form companion to these
rules.

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

## Versions and the vendored patch

Checked 2026-09-20. The plugin is pinned to the Payload release line (`3.88.0`, with
`@modelcontextprotocol/sdk` 1.30.0 and `mcp-handler` ^1.0.7 underneath); the newest release is
`3.90.1`. It moves with the rest of `@payloadcms/*` in one Payload upgrade, never on its own.

`@payloadcms/plugin-mcp@3.88.0` still needs the vendored patch: `convertCollectionSchemaToZod` ran the generated
Zod code through `ts.transpileModule` (CommonJS), whose `"use strict";` prologue made the
`new Function` eval return the string `"use strict"` instead of a Zod schema, then
`.partial()` on that string threw inside handler setup and **every POST to `/api/mcp` hung
with no response**. See [payload#17125](https://github.com/payloadcms/payload/issues/17125):
upstream closed it as not planned on 2026-07-10 and the fix PR
([#17132](https://github.com/payloadcms/payload/pull/17132)) was closed unmerged, so expect to
carry the patch across upgrades.

`patches/@payloadcms__plugin-mcp.patch` (wired via `patchedDependencies` in
`pnpm-workspace.yaml`) touches six files. Four are the fix: `convertCollectionSchemaToZod.js`
evaluates the generated schema expression directly (no transpile) and throws when the result is
not a Zod object; the `create` and `update` resource tools guard `.shape` and `.partial()` against
the permissive fallback; and `createRequest.js` stops sending a body on GET/HEAD requests. Two are
ours and would stay even if upstream fixed the rest: `schemas.js` adds the `confirm` input to the
delete tool and `resource/delete.js` hands it to the host app on `req.context.mcpDeleteConfirm`,
marks the tool `destructiveHint`, and describes it as a delete (it used to carry only the
collection's description). If that part of the patch is ever lost, deletes fail closed: the hook
still refuses, and no token can be sent. Edit the patch with `pnpm patch @payloadcms/plugin-mcp`
and `pnpm patch-commit`, never by hand. On a
Payload upgrade, re-apply the patch against the new version (pnpm fails the install when the
hunks no longer match) and retest `/api/mcp` initialize + tools/list.

## Operational notes

- Capability checkboxes are schema fields: adding/removing exposed collections changes the
  `payload-mcp-api-keys` table. Follow the normal migration workflow (ask before
  `pnpm migrate:create`, prescribe create/rename answers, commit `.ts`+`.json`, CI applies).
  The initial capability schema landed in `20260722_183757_mcp_authoring_capabilities`.
  `uploadMedia` is one more column on the same table.
- The key's admin screen is restyled by `withCapabilityControls` in `mcp.ts` (select-all per
  section, a toolbar with an enabled count). It matches the plugin's generated field shape, so
  after a Payload upgrade open a key and confirm the toolbar is still there: if the shape
  changed, the controls disappear without an error.
- Adding a plugin (or changing its admin components) also requires `pnpm generate:types` and
  `pnpm generate:importmap`.
- A new public content surface added to `CONTENT_SURFACES` is exposed to MCP automatically.
  Review whether that is intended when adding surfaces.
- Any other new collection or global is **not** exposed until it is listed in `mcp.ts`. When a
  feature adds one, either list it there or add it to the exclusions above with the reason, and
  update the table in this file.
