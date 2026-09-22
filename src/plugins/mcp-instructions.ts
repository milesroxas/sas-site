/**
 * The ground rules every MCP client receives when it connects to /api/mcp, and
 * the one place they live: the article-authoring skill and docs/mcp.md point
 * here instead of restating them.
 *
 * Only rules that cut across tools belong here. A rule for one collection is
 * that collection's `description` in `mcp.ts`, which the plugin turns into the
 * description of its tools, so it arrives with the tool.
 *
 * Claude Code keeps the first 2048 characters of server instructions and drops
 * the rest without a warning. Found 2026-09-21, when these ran to 3182 and the
 * delete, media, visitor data and house style rules had never reached Claude.
 * `mcp-instructions.test.ts` holds the limit.
 */
export const MCP_INSTRUCTIONS_LIMIT = 2048

export const MCP_INSTRUCTIONS = [
  'Content authoring server for the Suits & Sandals website and Content Hub.',
  'Author page and hub documents as drafts (draft: true); publish only when the user explicitly asks.',
  'Find a document before updating it and edit from its current state, keeping every block `id`: blocks sent without ids replace the rows.',
  'Relationship fields take document ids: look them up with the relevant find tool.',
  'Omit `slug`, `key` and `generateSlug`; if a create tool requires a slug or key, send a short URL-safe value, never an email.',
  "Rich text takes Lexical JSON, except a field with a write-only `markdown` sibling (a Rich text block's, a story section's or a beat's `body`): send Markdown there. It refuses syntax the field cannot hold and replaces existing content only with `replace: true`.",
  'Charts and diagrams are `chart` and `diagram` blocks with a JSON `spec` (see the tool schema); every figure needs a `textAlternative`. Never send `geometry`: it is computed on save. A refused save names each problem by path: fix those and resend.',
  "Case Study and Lab Project narrative is section-owned: `context`, `challenge`, `strategy`, `approach`, `outcomeSummary` and `learnings` each hold a `body` and ordered `storyBeats` with stable keys unique within the section. A Work or Lab Page block points at a beat with the section in `source`, `storyScope: 'beat'` and `storyBeatKey`.",
  "A visual slot's `studio` field takes a Studio look id: the streak-looks tools explain looks.",
  'Delete only when the user asks; prefer a reversible step (unpublish, or `archived` on a look). A delete takes two calls: do what the first one answers.',
  'Add new images with `pnpm cms:upload`; the article-authoring skill has the steps.',
  'Inquiries, form submissions, subscribers and Ask questions hold visitor contact details: read them for analysis and triage only, and never copy them into content or send them outside this workspace.',
  'House style for all copy (docs/editorial/voice.md): never an em dash, never its agency language. A save with either is refused, by path.',
].join(' ')
