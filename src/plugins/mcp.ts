import { type MCPPluginConfig, mcpPlugin } from '@payloadcms/plugin-mcp'
import type { CollectionSlug, Field, GroupField, Plugin } from 'payload'
import { authenticated } from '@/access/authenticated'
import { AGENT_UPLOAD_STATUS } from '@/endpoints/agentMedia'
import { ASK_QUESTION_RETENTION_DAYS } from '@/features/ask/retention'
import { withMcpDeleteConfirmation } from '@/plugins/mcp-delete-confirmation'
import { MCP_INSTRUCTIONS } from '@/plugins/mcp-instructions'
import { CONTENT_SURFACES } from '@/shared/content/surfaces'

/**
 * Internal-team MCP server at /api/mcp.
 *
 * Agents authenticate with per-key Bearer tokens (admin → System → API Keys).
 * Every tool call runs through Payload access control (`overrideAccess: false`)
 * as the team user linked to the key, and each operation below must ALSO be
 * switched on per key — the checkboxes default to off, so a new key can do
 * nothing until an admin grants it capabilities.
 *
 * Every authorable collection and global in the config is listed below. The
 * exceptions are structural, not oversights:
 *
 * - `users` and the MCP API-keys collection — the auth and capability control
 *   plane. A key that could write either would be able to mint an admin or
 *   widen its own capabilities.
 * - `search` (rebuilt by plugin hooks, so writes are clobbered) and Payload's
 *   internals (`payload-jobs`, `payload-kv`, `payload-folders`,
 *   `payload-locked-documents`, `payload-preferences`, `payload-migrations`):
 *   infrastructure, and the migration ledger is CI's.
 * - `streak-releases` and `streak-renders`: Studio machinery. Nothing reads a
 *   release any more, and a render row is a poster lease, not content.
 *
 * Studio looks (`streak-looks`) are authorable as drafts only. A look is
 * published from the Studio, where the editor's browser renders its posters,
 * and the collection's own hook refuses any other publish. So an agent drafts
 * and tidies looks, and a person looks at the result and publishes it.
 *
 * Deletes are never one call: `mcp-delete-confirmation.ts` makes every
 * delete-enabled collection below answer the first call with what it would
 * delete and a token, and only the second call, carrying the token, deletes.
 *
 * Visitor-sourced rows are exposed read-only, never for authoring: they carry
 * contact PII (`inquiries`, `form-submissions`, `subscribers`) or visitor
 * questions (`ask-questions`, redacted on write with no IP or visitor id).
 * Analysing them — what prospects ask, what the site cannot answer, who is
 * waiting on a reply — is exactly the job a team agent is for. Like everything
 * here, a key still needs the capability ticked before it can read them.
 */

type McpCollectionEntry = NonNullable<NonNullable<MCPPluginConfig['collections']>[CollectionSlug]>

/** Full authoring: agents may draft, edit, and (when granted) delete. */
const AUTHORING = { create: true, delete: true, find: true, update: true } as const

/** Reference data agents may read but never mutate. */
const READ_ONLY = { find: true } as const

/** Canonical, channel-agnostic source material rendered by website surfaces. */
const CONTENT_HUB: Record<string, string> = {
  'case-studies': 'Case studies: canonical client-work narratives rendered by work pages',
  'lab-projects': 'Lab projects: canonical R&D narratives rendered by lab pages',
  organizations: 'Client and partner organizations referenced across content',
  projects: 'Client projects that case studies and testimonials attach to',
  testimonials: 'Client testimonials referenced by case studies and pages',
}

/** Taxonomy vocabularies content links against. */
const TAXONOMY: Record<string, string> = {
  capabilities: 'Capability taxonomy content is tagged with',
  categories: 'Post categories (nested)',
  industries: 'Industry taxonomy organizations and content are tagged with',
  platforms: 'Platform/product taxonomy projects are tagged with',
}

/** Site plumbing behind the published pages. */
const OPERATIONS: Record<string, string> = {
  forms:
    'Form definitions (fields, confirmation behaviour, emails) that pages embed. Submitted data lives in `form-submissions`',
  redirects: 'URL redirects: a source path pointing at a document or an external URL',
}

/**
 * Newsletter authoring. Sending is not reachable over MCP: it runs through the
 * send endpoint and its job, and access control freezes sending and sent
 * campaigns, so an agent can compose and target a draft but never deliver one.
 */
const NEWSLETTER: Record<string, string> = {
  audiences: 'Newsletter audiences (segments) that subscribers belong to',
  newsletters:
    'Newsletter campaigns: content, subject, and audience selection. Sending is triggered from the admin only; sending and sent campaigns are locked',
}

/** Visitor-submitted records. Read-only: every one of these carries contact PII. */
const VISITOR_RECORDS: Record<string, string> = {
  'form-submissions':
    'Data submitted through site forms, including whatever contact details the form collects. Read-only',
  inquiries:
    'Contact-form inquiries: name, email, message, and triage state for each lead. Read-only',
  subscribers:
    'Newsletter subscribers: email address, audience membership, and subscription state. Read-only',
}

const entries = (records: Record<string, string>, enabled: McpCollectionEntry['enabled']) =>
  Object.entries(records).map(([slug, description]) => [slug, { description, enabled }] as const)

const collections: MCPPluginConfig['collections'] = Object.fromEntries([
  // Website — publishing surfaces with public URLs. Draft-enabled; agents are
  // instructed to author as drafts and publish only on explicit request.
  ...CONTENT_SURFACES.map(
    (surface) =>
      [
        surface.collection,
        {
          description: `${surface.title}: website pages published under ${surface.urlPrefix || '/'}`,
          enabled: AUTHORING,
        },
      ] as const,
  ),
  ...entries(CONTENT_HUB, AUTHORING),
  ...entries(TAXONOMY, AUTHORING),
  ...entries(OPERATIONS, AUTHORING),
  ...entries(NEWSLETTER, AUTHORING),
  ...entries(VISITOR_RECORDS, READ_ONLY),
  ...entries(
    {
      'asset-libraries':
        'Asset library folders organizing media per client/project. Pass organization and project ids and omit rootFolder: creating one auto-creates its root folder',
    },
    AUTHORING,
  ),
  // Drafts only: the collection refuses a publish that does not come from the
  // Studio, where the posters are rendered.
  ...entries(
    {
      'streak-looks':
        "Studio looks: authored visual effects (streak field, light leak) that a visual slot references by id in its `studio` field. Draft one with a title, an `effect` and a `recipe` whose `deltas` hold only the parameters that leave their default. You cannot see a look and cannot publish it here: say so, and ask the user to open it in the admin Studio, check it and publish. Set `archived` to retire a look that is still in use. A slot only accepts a published look of the slot's own effect, so a page only publishes with one",
    },
    AUTHORING,
  ),
  // Media stays read-only: MCP tools cannot send binary uploads. Images come in
  // through `pnpm cms:upload` (`uploadMediaCapability` below).
  ...entries(
    {
      media:
        'Uploaded media. Read-only over MCP: reference existing documents by id; only `public-approved` items render publicly. New images go through `pnpm cms:upload`',
    },
    READ_ONLY,
  ),
  ...entries(
    {
      'ask-questions': `Every turn in the site Ask box (redacted question and answer, sources with similarity, outcome, rating, handoff; no visitor ids; deleted after ${ASK_QUESTION_RETENTION_DAYS} days). \`outcome: no_sources\` marks questions the site had no content for. Read-only`,
    },
    READ_ONLY,
  ),
])

const globals: MCPPluginConfig['globals'] = {
  footer: {
    description: 'Site footer: navigation and contact details',
    enabled: { find: true, update: true },
  },
  header: {
    description: 'Site header: primary navigation',
    enabled: { find: true, update: true },
  },
  home: {
    description: 'Site homepage: hero, layout blocks, and SEO published at /',
    enabled: { find: true, update: true },
  },
  'insights-index': {
    description:
      'Insights index page: hero and SEO for the listing published at /insights (also /posts). The list itself is code-owned',
    enabled: { find: true, update: true },
  },
  'lab-index': {
    description:
      'Lab index page — hero and SEO for the listing published at /lab. The list itself is code-owned',
    enabled: { find: true, update: true },
  },
  'site-info': {
    description: 'Company identity used for JSON-LD, llms.txt, and default page metadata',
    enabled: { find: true, update: true },
  },
  'works-index': {
    description:
      'Work index page: hero and SEO for the listing published at /works. The list itself is code-owned',
    enabled: { find: true, update: true },
  },
}

const CONTROLS_COMPONENT = '@/components/McpCapabilityControls'

/**
 * Matches the plugin-generated capability fields: a sidebar collapsible
 * wrapping a single named group whose label is the literal configType
 * ('collection' | 'global') — the source of the odd type hierarchy in the
 * sidebar.
 */
const capabilityGroup = (field: Field): Extract<GroupField, { name: string }> | null => {
  if (field.type !== 'collapsible' || field.fields.length !== 1) return null
  const [group] = field.fields
  if (group.type !== 'group' || !('name' in group)) return null
  return group.label === 'collection' || group.label === 'global' ? group : null
}

/**
 * Restyles the generated capability sections and adds bulk controls:
 * - drops the redundant 'collection'/'global' group heading and the
 *   per-checkbox "Allow clients to…" descriptions (labels carry the meaning)
 * - prepends a tri-state "Select all" checkbox to each section
 * - inserts a toolbar above the sections with select-all / deselect-all
 *   across every capability plus an enabled count
 */
const withCapabilityControls = (fields: Field[]): Field[] => {
  const sections: { label: string; ops: string[]; path: string }[] = []

  const transformed = fields.map((field): Field => {
    const group = capabilityGroup(field)
    if (!group || field.type !== 'collapsible') return field

    const ops = group.fields.flatMap((f) => (f.type === 'checkbox' && 'name' in f ? [f.name] : []))
    const label = typeof field.label === 'string' ? field.label : group.name
    sections.push({ label, ops, path: group.name })

    return {
      ...field,
      admin: { ...field.admin, className: 'mcp-capability-section' },
      label,
      fields: [
        {
          ...group,
          fields: [
            {
              name: 'toggleAll',
              type: 'ui',
              admin: {
                components: {
                  Field: {
                    clientProps: { ops, section: group.name },
                    path: `${CONTROLS_COMPONENT}#SectionToggleAll`,
                  },
                },
              },
            },
            ...group.fields.map(
              (f): Field =>
                f.type === 'checkbox' ? { ...f, admin: { ...f.admin, description: undefined } } : f,
            ),
          ],
          label: false,
        },
      ],
    }
  })

  const firstSectionIndex = fields.findIndex((field) => capabilityGroup(field) !== null)
  if (firstSectionIndex === -1) return transformed

  transformed.splice(firstSectionIndex, 0, {
    name: 'capabilitiesToolbar',
    type: 'ui',
    admin: {
      components: {
        Field: {
          clientProps: { sections },
          path: `${CONTROLS_COMPONENT}#CapabilitiesToolbar`,
        },
      },
      position: 'sidebar',
    },
  })

  return transformed
}

/**
 * The one capability that is not an MCP tool. MCP cannot carry a binary, so
 * media is added through `POST /api/agent/media` (`endpoints/agentMedia.ts`)
 * with the same key, and that endpoint reads this checkbox. It is its own
 * field rather than `create` on the media entry above because that would
 * register a create tool that can never receive a file. Off by default, like
 * every capability: a key that can read media cannot add it until a team
 * member says so.
 */
const uploadMediaCapability: Field = {
  name: 'uploadMedia',
  type: 'checkbox',
  label: 'Upload media',
  defaultValue: false,
  admin: {
    position: 'sidebar',
    description: `Allow \`pnpm cms:upload\` with this key. Its uploads land with Usage Status ${AGENT_UPLOAD_STATUS}.`,
  },
}

/** Every collection a key can be granted `delete` on: the ones the confirmation guards. */
const deletable = new Set(
  Object.entries(collections ?? {}).flatMap(([slug, entry]) =>
    entry?.enabled && typeof entry.enabled === 'object' && entry.enabled.delete ? [slug] : [],
  ),
)

const server: Plugin = mcpPlugin({
  collections,
  globals,
  mcp: {
    serverOptions: {
      serverInfo: { name: 'Suits & Sandals CMS', version: '1.0.0' },
      instructions: MCP_INSTRUCTIONS,
    },
  },
  // The key collection is the capability control plane: only team members may
  // see or manage keys. Without this it falls back to Payload's default
  // `Boolean(req.user)` access, which would let any authenticated principal —
  // including an MCP key itself via REST API-key auth — read keys or escalate
  // its own capabilities.
  overrideApiKeyCollection: (collection) => ({
    ...collection,
    access: {
      create: authenticated,
      delete: authenticated,
      read: authenticated,
      update: authenticated,
    },
    admin: { ...collection.admin, group: 'System' },
    fields: [...withCapabilityControls(collection.fields), uploadMediaCapability],
  }),
})

export const mcp: Plugin = (config) => server(withMcpDeleteConfirmation(config, deletable))
