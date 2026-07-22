import { type MCPPluginConfig, mcpPlugin } from '@payloadcms/plugin-mcp'
import type { CollectionSlug, Plugin } from 'payload'
import { authenticated } from '@/access/authenticated'
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
 * Deliberately excluded: `users`, `subscribers`, `newsletters` (accounts, PII,
 * and send machinery), `forms` / `form-submissions`, `redirects`, `search`
 * (derived index), and the API-keys collection itself.
 */

type McpCollectionEntry = NonNullable<NonNullable<MCPPluginConfig['collections']>[CollectionSlug]>

/** Full authoring: agents may draft, edit, and (when granted) delete. */
const AUTHORING = { create: true, delete: true, find: true, update: true } as const

/** Reference data agents may read but never mutate. */
const READ_ONLY = { find: true } as const

/** Canonical, channel-agnostic source material rendered by website surfaces. */
const CONTENT_HUB: Record<string, string> = {
  'case-studies': 'Case studies — canonical client-work narratives rendered by work pages',
  'lab-projects': 'Lab projects — canonical R&D narratives rendered by lab pages',
  organizations: 'Client and partner organizations referenced across content',
  projects: 'Client projects that case studies and testimonials attach to',
  testimonials: 'Client testimonials referenced by case studies and pages',
}

/** Taxonomy vocabularies content links against. */
const TAXONOMY: Record<string, string> = {
  capabilities: 'Capability taxonomy content is tagged with',
  categories: 'Post categories (nested)',
  industries: 'Industry taxonomy organizations and content are tagged with',
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
          description: `${surface.title} — website pages published under ${surface.urlPrefix || '/'}`,
          enabled: AUTHORING,
        },
      ] as const,
  ),
  ...entries(CONTENT_HUB, AUTHORING),
  ...entries(TAXONOMY, AUTHORING),
  // Assets: read-only. Uploads carry binary files the MCP tools cannot send,
  // and new media defaults to the internal `usageStatus` gate anyway.
  ...entries(
    {
      'asset-libraries': 'Asset library folders organizing media per client/project',
      media:
        'Uploaded media. Read-only over MCP — reference existing documents by id; only `public-approved` items render publicly',
    },
    READ_ONLY,
  ),
])

const globals: MCPPluginConfig['globals'] = {
  footer: {
    description: 'Site footer — navigation and contact details',
    enabled: { find: true, update: true },
  },
  header: {
    description: 'Site header — primary navigation',
    enabled: { find: true, update: true },
  },
  'site-info': {
    description: 'Company identity used for JSON-LD, llms.txt, and default page metadata',
    enabled: { find: true, update: true },
  },
}

export const mcp: Plugin = mcpPlugin({
  collections,
  globals,
  mcp: {
    serverOptions: {
      serverInfo: { name: 'Suits & Sandals CMS', version: '1.0.0' },
      instructions: [
        'Content authoring server for the Suits & Sandals website and Content Hub.',
        'Author page and hub documents as drafts (draft: true); publish only when the user explicitly asks.',
        'Rich text fields expect Lexical editor state JSON, not markdown or HTML.',
        'Before updating a document, find it first and edit from its current state.',
        'Relationship fields take document ids — look them up with the relevant find tool.',
        'Media cannot be uploaded here; reference existing media documents by id.',
      ].join(' '),
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
  }),
})
