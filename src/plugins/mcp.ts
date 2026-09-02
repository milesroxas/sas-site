import { type MCPPluginConfig, mcpPlugin } from '@payloadcms/plugin-mcp'
import type { CollectionSlug, Field, GroupField, Plugin } from 'payload'
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
  platforms: 'Platform/product taxonomy projects are tagged with',
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
  ...entries(
    {
      'asset-libraries':
        'Asset library folders organizing media per client/project. Creating one auto-creates a root folder; pass organization and project ids',
    },
    AUTHORING,
  ),
  // Media stays read-only: MCP tools cannot send binary uploads, and new media
  // defaults to the internal `usageStatus` gate anyway.
  ...entries(
    {
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
  home: {
    description: 'Site homepage — hero, layout blocks, and SEO published at /',
    enabled: { find: true, update: true },
  },
  'site-info': {
    description: 'Company identity used for JSON-LD, llms.txt, and default page metadata',
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
        'Omit slug, key, and generateSlug fields on create and update: slugs auto-generate from the title or name, and any value you send is normalized to a URL-safe slug.',
        'Asset libraries require organization and project ids; omit rootFolder to auto-create one.',
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
    fields: withCapabilityControls(collection.fields),
  }),
})
