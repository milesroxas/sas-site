import type { CollectionSlug, Payload } from 'payload'
import type { SiteInfo } from '@/payload-types'
import { relationshipIds } from '@/utilities/relationshipId'
import { lexicalToMarkdownString, type SerializedLexicalState } from './lexicalToMarkdown'
import type { ContentSurface, GlobalSurface } from './surfaces'

/**
 * Extracts a surface document's reader-facing substance as markdown, for the
 * RAG corpus (embedding + keyword hydration).
 *
 * A generic walker collects Lexical states plus strings under a fixed
 * allowlist of content-bearing keys, in document order, across hero groups,
 * layout blocks, and nested arrays. Three things ride on top of the walk:
 *
 * - **Canonical records.** If the surface names a Content Hub record
 *   (work-pages → case-studies), it is hydrated and walked too — its narrative
 *   is what the page renders.
 * - **Relationships.** Allowlisted relationship keys (testimonials, project,
 *   taxonomy) resolve to the public substance of the related record: the
 *   quote and speaker, the client name and project summary, the term names.
 *   Everything else stays a bare id and is dropped.
 * - **Structured arrays.** Case-study metrics and contact details render as
 *   compact lines instead of scattered field values.
 *
 * Every hydration goes through the Local API with `overrideAccess: false` and
 * no user, so collection read rules (published only, approved-public
 * testimonials) and field-level rules (`authenticatedField` on internal claim
 * logs) decide what the corpus may see. Callers must pass a document read the
 * same way; the walker's allowlist is the second line of defense, not the
 * first: enum/select values ('dark', 'editorial-split'), link URLs, and
 * admin-only fields (anything starting with `internal`) never reach a public
 * answer.
 */

/** String fields whose values are reader-facing content. Compared lowercase, with a trailing 'override' stripped. */
const TEXT_KEYS = new Set([
  'answer',
  'body',
  'caption',
  'decision',
  'description',
  'excerpt',
  'eyebrow',
  'footnote',
  'heading',
  'impact',
  'intro',
  'lead',
  'medium',
  'oneline',
  'problem',
  'question',
  'quote',
  'rationale',
  'secondline',
  'short',
  'standfirst',
  'statement',
  'subheading',
  'subtitle',
  'summary',
  'tagline',
  'text',
  'thesis',
  'title',
])

/** Keys emitted as markdown headings — natural chunk boundaries. */
const HEADING_KEYS = new Set(['title', 'heading'])

/** Subtrees that never carry body content (system, SEO, navigation, media). */
const SKIP_KEYS = new Set([
  '_status',
  'breadcrumbs',
  'createdat',
  'id',
  'blockname',
  'link',
  'links',
  'media',
  'meta',
  'parent',
  'publishedat',
  'slug',
  'sluglock',
  'updatedat',
])

type RelationCollection =
  | 'capabilities'
  | 'industries'
  | 'organizations'
  | 'platforms'
  | 'projects'
  | 'testimonials'

/**
 * Relationship keys whose targets carry public substance worth embedding. Keys
 * not listed here (featured work entries, related pages, authors, categories)
 * point at documents that are indexed on their own or add nothing a visitor
 * would ask about.
 */
const RELATION_KEYS: Record<string, RelationCollection> = {
  capabilities: 'capabilities',
  featuredcapabilities: 'capabilities',
  industries: 'industries',
  industry: 'industries',
  organization: 'organizations',
  platforms: 'platforms',
  project: 'projects',
  testimonial: 'testimonials',
  testimonials: 'testimonials',
}

const MAX_DOC_CHARS = 30_000

type RelationRef = { collection: RelationCollection; id: number }
type Part = string | RelationRef

type Doc = Record<string, unknown>

const normalizeKey = (key: string): string => key.toLowerCase().replace(/override$/, '')

const isLexicalState = (value: unknown): value is SerializedLexicalState =>
  typeof value === 'object' &&
  value !== null &&
  'root' in value &&
  typeof (value as SerializedLexicalState).root === 'object'

const asList = (value: unknown): unknown[] => (Array.isArray(value) ? value : [value])

const str = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')

const numericIds = (value: unknown): number[] =>
  relationshipIds(asList(value)).filter((id): id is number => typeof id === 'number')

/** Case-study metrics: only what the site itself may show (`approvedForPublic`). */
function renderMetrics(items: unknown[]): string {
  const lines = items.flatMap((item) => {
    if (typeof item !== 'object' || item === null) return []
    const metric = item as Doc
    if (metric.approvedForPublic !== true) return []
    const label = str(metric.label)
    const value = str(metric.value)
    if (!label || !value) return []
    const qualifiers = [
      str(metric.qualifier),
      str(metric.comparisonBaseline) ? `vs ${str(metric.comparisonBaseline)}` : '',
      str(metric.timeframe),
    ].filter(Boolean)
    const unit = str(metric.unit)
    return [
      `- ${label}: ${value}${unit ? ` ${unit}` : ''}${qualifiers.length ? ` (${qualifiers.join('; ')})` : ''}`,
    ]
  })
  return lines.length ? `Results:\n${lines.join('\n')}` : ''
}

/** Contact-page details list (`term`/`value` rows: hours, phone, studio). */
function renderDetails(items: unknown[]): string {
  const lines = items.flatMap((item) => {
    if (typeof item !== 'object' || item === null) return []
    const { term, value } = item as Doc
    return str(term) && str(value) ? [`- ${str(term)}: ${str(value)}`] : []
  })
  return lines.join('\n')
}

/** Arrays rendered as one compact block instead of being walked field by field. */
const STRUCTURED_KEYS: Record<string, (items: unknown[]) => string> = {
  details: renderDetails,
  metrics: renderMetrics,
}

function walkValue(value: unknown, key: string, out: Part[]): void {
  if (value === null || value === undefined) return

  const normalized = normalizeKey(key)
  if (SKIP_KEYS.has(normalized) || normalized.startsWith('internal')) return

  const relation = RELATION_KEYS[normalized]
  if (relation) {
    for (const id of numericIds(value)) out.push({ collection: relation, id })
    return
  }

  if (typeof value === 'string') {
    const text = value.trim()
    if (!text || !TEXT_KEYS.has(normalized)) return
    out.push(HEADING_KEYS.has(normalized) ? `## ${text}` : text)
    return
  }

  if (Array.isArray(value)) {
    const render = STRUCTURED_KEYS[normalized]
    if (render) {
      const text = render(value)
      if (text) out.push(text)
      return
    }
    for (const item of value) walkValue(item, key, out)
    return
  }

  if (typeof value !== 'object') return

  if (isLexicalState(value)) {
    const markdown = lexicalToMarkdownString(value)
    if (markdown) out.push(markdown)
    return
  }

  for (const [childKey, childValue] of Object.entries(value)) {
    walkValue(childValue, childKey, out)
  }
}

/**
 * Published, publicly readable documents by id. No user + `overrideAccess:
 * false` means collection read rules and field-level access apply exactly as
 * they do for an anonymous site visitor.
 */
async function fetchPublic(
  payload: Payload,
  collection: CollectionSlug,
  ids: number[],
): Promise<Doc[]> {
  const unique = [...new Set(ids)]
  if (unique.length === 0) return []
  const { docs } = await payload.find({
    collection,
    depth: 0,
    draft: false,
    overrideAccess: false,
    pagination: false,
    limit: unique.length,
    where: { id: { in: unique } },
  })
  return docs as unknown as Doc[]
}

const byId = (docs: Doc[]): Map<number, Doc> => new Map(docs.map((doc) => [Number(doc.id), doc]))

const termNames = (ids: number[], terms: Map<number, Doc>): string =>
  ids
    .map((id) => str(terms.get(id)?.name))
    .filter(Boolean)
    .join(', ')

function renderTestimonial(doc: Doc): string {
  const quote = lexicalToMarkdownString(doc.quote)
  if (!quote) return ''
  const attribution = [str(doc.speakerName), str(doc.speakerRole), str(doc.speakerOrganization)]
    .filter(Boolean)
    .join(', ')
  const quoted = quote
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n')
  return `${attribution ? `${attribution} said:` : 'A client said:'}\n${quoted}`
}

function renderProject(
  doc: Doc,
  organizations: Map<number, Doc>,
  terms: Record<'capabilities' | 'industries' | 'platforms', Map<number, Doc>>,
): string {
  const lines: string[] = []
  const client = organizations.get(numericIds(doc.organization)[0] ?? -1)
  if (client && str(client.name)) lines.push(`Client: ${str(client.name)}`)
  if (str(doc.publicTitle)) lines.push(`Project: ${str(doc.publicTitle)}`)
  for (const [label, key] of [
    ['Industries', 'industries'],
    ['Capabilities', 'capabilities'],
    ['Platforms', 'platforms'],
  ] as const) {
    const names = termNames(numericIds(doc[key]), terms[key])
    if (names) lines.push(`${label}: ${names}`)
  }
  for (const field of ['publicSummary', 'scope']) {
    const markdown = lexicalToMarkdownString(doc[field])
    if (markdown) lines.push(markdown)
  }
  const deliverables = asList(doc.deliverables ?? []).flatMap((item) => {
    if (typeof item !== 'object' || item === null) return []
    const { title, description } = item as Doc
    return str(title) ? [`- ${str(title)}${str(description) ? `: ${str(description)}` : ''}`] : []
  })
  if (deliverables.length) lines.push(`Deliverables:\n${deliverables.join('\n')}`)
  return lines.join('\n')
}

/**
 * Resolves every relation reference the walk collected, in as few queries as
 * the graph allows (one per collection, plus one round for what projects
 * point at), and returns markdown per reference key.
 */
async function resolveRelations(
  payload: Payload,
  refs: RelationRef[],
): Promise<Map<string, string>> {
  const ids = (collection: RelationCollection): number[] =>
    refs.filter((ref) => ref.collection === collection).map((ref) => ref.id)

  const [testimonials, projects] = await Promise.all([
    fetchPublic(payload, 'testimonials', ids('testimonials')),
    fetchPublic(payload, 'projects', ids('projects')),
  ])

  // Projects add their client and taxonomy to the id sets the walk found.
  const orgIds = [...ids('organizations'), ...projects.flatMap((p) => numericIds(p.organization))]
  const termIds = {
    capabilities: [...ids('capabilities'), ...projects.flatMap((p) => numericIds(p.capabilities))],
    industries: [...ids('industries'), ...projects.flatMap((p) => numericIds(p.industries))],
    platforms: [...ids('platforms'), ...projects.flatMap((p) => numericIds(p.platforms))],
  }
  const [organizations, capabilities, industries, platforms] = await Promise.all([
    fetchPublic(payload, 'organizations', orgIds).then(byId),
    fetchPublic(payload, 'capabilities', termIds.capabilities).then(byId),
    fetchPublic(payload, 'industries', termIds.industries).then(byId),
    fetchPublic(payload, 'platforms', termIds.platforms).then(byId),
  ])
  const terms = { capabilities, industries, platforms }

  const rendered = new Map<string, string>()
  for (const doc of testimonials) rendered.set(`testimonials:${doc.id}`, renderTestimonial(doc))
  for (const doc of projects)
    rendered.set(`projects:${doc.id}`, renderProject(doc, organizations, terms))
  for (const [id, doc] of organizations) rendered.set(`organizations:${id}`, str(doc.name))
  for (const [collection, map] of Object.entries(terms)) {
    for (const [id, doc] of map) rendered.set(`${collection}:${id}`, str(doc.name))
  }
  return rendered
}

/**
 * Turns walk output into markdown: relation references become their rendered
 * substance (once each), and consecutive taxonomy names collapse into one
 * "Capabilities: a, b" line so a hasMany field reads as a list, not a column.
 */
async function renderParts(payload: Payload, parts: Part[]): Promise<string[]> {
  const refs = parts.filter((part): part is RelationRef => typeof part !== 'string')
  const rendered =
    refs.length > 0 ? await resolveRelations(payload, refs) : new Map<string, string>()

  const TERM_LABEL: Partial<Record<RelationCollection, string>> = {
    capabilities: 'Capabilities',
    industries: 'Industries',
    platforms: 'Platforms',
  }

  const out: string[] = []
  const seen = new Set<string>()
  let i = 0
  while (i < parts.length) {
    const part = parts[i]
    if (typeof part === 'string') {
      out.push(part)
      i += 1
      continue
    }

    const label = TERM_LABEL[part.collection]
    if (label) {
      const names: string[] = []
      while (i < parts.length) {
        const next = parts[i]
        if (typeof next === 'string' || next.collection !== part.collection) break
        const key = `${next.collection}:${next.id}`
        const name = rendered.get(key)
        if (name && !seen.has(key)) {
          seen.add(key)
          names.push(name)
        }
        i += 1
      }
      if (names.length) out.push(`${label}: ${names.join(', ')}`)
      continue
    }

    const key = `${part.collection}:${part.id}`
    const text = rendered.get(key)
    if (text && !seen.has(key)) {
      seen.add(key)
      out.push(text)
    }
    i += 1
  }
  return out
}

type SurfaceDoc = {
  title?: string | null
  meta?: { description?: string | null } | null
}

/**
 * Markdown for one surface document. `doc` must have been read as the public
 * sees it (`draft: false`, `overrideAccess: false`) — see `readPublicDoc`.
 */
export async function extractDocMarkdown(
  payload: Payload,
  surface: ContentSurface,
  doc: SurfaceDoc,
): Promise<string> {
  const record = doc as Doc
  const parts: Part[] = []

  if (doc.title) parts.push(`# ${doc.title}`)
  const description = doc.meta?.description?.trim()
  if (description) parts.push(description)

  const { title: _title, ...rest } = record
  walkValue(rest, '', parts)

  const canonical = surface.body.kind === 'walk' ? surface.body.canonicalField : undefined
  const canonicalId = canonical ? numericIds(record[canonical.name])[0] : undefined
  if (canonical && canonicalId !== undefined) {
    const [canonicalDoc] = await fetchPublic(payload, canonical.collection, [canonicalId])
    if (canonicalDoc) walkValue(canonicalDoc, '', parts)
  }

  const rendered = await renderParts(payload, parts)
  return rendered.join('\n\n').slice(0, MAX_DOC_CHARS)
}

/** Company facts from Site Info, written as prose an answer can quote. */
function renderSiteInfo(info: SiteInfo): string {
  const lines: string[] = []
  const name = str(info.name) || 'Suits & Sandals'
  lines.push(`# ${name}`)
  if (str(info.tagline)) lines.push(str(info.tagline))
  if (str(info.description)) lines.push(str(info.description))
  if (str(info.legalName) && str(info.legalName) !== name)
    lines.push(`Legal name: ${str(info.legalName)}`)
  if (typeof info.foundingYear === 'number') lines.push(`Founded in ${info.foundingYear}.`)

  const address = info.address
  const street = str(address?.streetAddress)
  const cityLine = [
    str(address?.city),
    [str(address?.state), str(address?.postalCode)].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(', ')
  const place = [street, cityLine, str(address?.country)].filter(Boolean).join(', ')
  if (place) lines.push(`## Where we are\nStudio address: ${place}.`)

  const contact: string[] = []
  if (str(info.contactEmail)) contact.push(`Email: ${str(info.contactEmail)}`)
  if (str(info.inquiries?.responseTime))
    contact.push(`Inquiry response time: ${str(info.inquiries?.responseTime)}`)
  if (str(info.inquiries?.scheduleUrl))
    contact.push(`Book a call: ${str(info.inquiries?.scheduleUrl)}`)
  if (contact.length) lines.push(`## Contact\n${contact.join('\n')}`)

  const profiles = (info.socialProfiles ?? []).flatMap((profile) =>
    str(profile.label) && str(profile.url) ? [`- ${str(profile.label)}: ${str(profile.url)}`] : [],
  )
  if (profiles.length) lines.push(`## Find us online\n${profiles.join('\n')}`)

  if (str(info.llmsNotes)) lines.push(str(info.llmsNotes))
  return lines.join('\n\n')
}

/**
 * The published, publicly readable version of a global, or null when there is
 * none yet (a drafts global that was never published).
 */
export async function readPublicGlobal(
  payload: Payload,
  surface: GlobalSurface,
): Promise<Doc | null> {
  const doc = (await payload.findGlobal({
    slug: surface.global,
    depth: 0,
    draft: false,
    overrideAccess: false,
  })) as unknown as Doc
  if (surface.drafts && doc._status !== 'published') return null
  return doc
}

/** Markdown for a global surface (already read with `readPublicGlobal`). */
export async function extractGlobalMarkdown(
  payload: Payload,
  surface: GlobalSurface,
  doc: Doc,
): Promise<string> {
  if (surface.global === 'site-info') return renderSiteInfo(doc as unknown as SiteInfo)

  const parts: Part[] = [`# ${str(doc.title) || surface.title}`]
  const description = str((doc.meta as SurfaceDoc['meta'])?.description)
  if (description) parts.push(description)
  const { title: _title, ...rest } = doc
  walkValue(rest, '', parts)
  const rendered = await renderParts(payload, parts)
  return rendered.join('\n\n').slice(0, MAX_DOC_CHARS)
}

/**
 * A surface document as an anonymous visitor reads it: published version only,
 * access rules applied. Null when the document is not (or no longer) public.
 */
export async function readPublicDoc(
  payload: Payload,
  collection: CollectionSlug,
  id: number | string,
): Promise<Doc | null> {
  const doc = await payload.findByID({
    collection,
    id,
    depth: 0,
    draft: false,
    overrideAccess: false,
    disableErrors: true,
  })
  return (doc as Doc | null) ?? null
}
