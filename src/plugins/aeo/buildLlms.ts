import type { Payload, TypedLocale } from 'payload'
import type { SiteInfo } from '@/payload-types'
import { lexicalToMarkdownString } from '@/shared/content/lexicalToMarkdown'
import { getServerSideURL } from '@/utilities/getURL'
import { AEO_CONTENT_SECTIONS, sectionDocUrl } from './sections'
import type { AeoContentSection } from './types'

type SectionDoc = {
  slug?: string | null
  title?: string | null
  publishedAt?: string | null
  updatedAt?: string
  meta?: { description?: string | null } | null
  [key: string]: unknown
}

const docUrl = sectionDocUrl

const querySection = async (payload: Payload, section: AeoContentSection) => {
  const { docs } = await payload.find({
    collection: section.collection,
    draft: false,
    overrideAccess: false,
    depth: 0,
    limit: 500,
    pagination: false,
    sort: section.sort ?? 'title',
    where: { _status: { equals: 'published' } },
  })
  return docs as unknown as SectionDoc[]
}

const sectionEntries = (section: AeoContentSection, docs: SectionDoc[], siteUrl: string): string =>
  docs
    .filter((doc) => Boolean(doc.slug) && Boolean(doc.title))
    .map((doc) => {
      const description = doc.meta?.description?.trim()
      const link = `- [${doc.title}](${docUrl(section, doc.slug as string, siteUrl)})`
      return description ? `${link}: ${description}` : link
    })
    .join('\n')

const buildHeader = (siteInfo: Partial<SiteInfo>, siteUrl: string): string => {
  const name = siteInfo.name || 'Suits & Sandals'
  const lines: string[] = [`# ${name}`]

  if (siteInfo.tagline) lines.push('', `> ${siteInfo.tagline}`)
  if (siteInfo.description) lines.push('', siteInfo.description.trim())
  lines.push('', `Website: ${siteUrl}`)

  return lines.join('\n')
}

const buildCompanySection = (siteInfo: Partial<SiteInfo>): string | null => {
  const entries: string[] = []

  if (siteInfo.contactEmail) entries.push(`- Contact: ${siteInfo.contactEmail}`)
  for (const profile of siteInfo.socialProfiles ?? []) {
    entries.push(`- [${profile.label}](${profile.url})`)
  }

  if (!entries.length) return null
  return `## Company\n\n${entries.join('\n')}`
}

export const getSiteInfo = async (payload: Payload): Promise<Partial<SiteInfo>> =>
  (await payload.findGlobal({ slug: 'site-info', depth: 0 })) as Partial<SiteInfo>

/**
 * Spec-compliant llms.txt (llmstxt.org): H1, blockquote summary, detail
 * paragraphs, then H2 link sections drawn from published content.
 */
export const buildLlmsTxt = async (payload: Payload): Promise<string> => {
  const siteUrl = getServerSideURL()
  const siteInfo = await getSiteInfo(payload)

  const sections = await Promise.all(
    AEO_CONTENT_SECTIONS.map(async (section) => {
      const entries = sectionEntries(section, await querySection(payload, section), siteUrl)
      return entries ? `## ${section.title}\n\n${entries}` : null
    }),
  )

  const parts = [
    buildHeader(siteInfo, siteUrl),
    ...sections.filter(Boolean),
    buildCompanySection(siteInfo),
    siteInfo.llmsNotes?.trim() ? `## Notes\n\n${siteInfo.llmsNotes.trim()}` : null,
  ]

  return `${parts.filter(Boolean).join('\n\n')}\n`
}

/**
 * llms-full.txt: same header, but sections marked `fullContent` include each
 * document's body converted from Lexical to markdown.
 */
export const buildLlmsFullTxt = async (payload: Payload): Promise<string> => {
  const siteUrl = getServerSideURL()
  const siteInfo = await getSiteInfo(payload)

  const sections = await Promise.all(
    AEO_CONTENT_SECTIONS.map(async (section) => {
      const docs = await querySection(payload, section)
      if (!docs.length) return null

      const { fullContent } = section
      if (!fullContent) {
        const entries = sectionEntries(section, docs, siteUrl)
        return entries ? `## ${section.title}\n\n${entries}` : null
      }

      const bodies = docs
        .filter((doc) => Boolean(doc.slug) && Boolean(doc.title))
        .map((doc) => {
          const markdown = lexicalToMarkdownString(doc[fullContent.richTextField])
          const header = [
            `### ${doc.title}`,
            '',
            `URL: ${docUrl(section, doc.slug as string, siteUrl)}`,
            doc.publishedAt ? `Published: ${doc.publishedAt}` : null,
            doc.updatedAt ? `Updated: ${doc.updatedAt}` : null,
          ]
            .filter((line): line is string => line !== null)
            .join('\n')
          return markdown ? `${header}\n\n${markdown}` : header
        })

      return `## ${section.title}\n\n${bodies.join('\n\n---\n\n')}`
    }),
  )

  const parts = [buildHeader(siteInfo, siteUrl), ...sections.filter(Boolean)]

  return `${parts.filter(Boolean).join('\n\n')}\n`
}

/**
 * Single published post as standalone markdown — the `.md` alternate and
 * `Accept: text/markdown` content-negotiation payload for /posts/[slug].
 */
export const buildPostMarkdown = async (
  payload: Payload,
  slug: string,
  locale?: TypedLocale,
): Promise<string | null> => {
  const siteUrl = getServerSideURL()

  const { docs } = await payload.find({
    collection: 'posts',
    draft: false,
    overrideAccess: false,
    depth: 0,
    limit: 1,
    pagination: false,
    locale,
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
  })

  const post = docs[0]
  if (!post) return null

  const body = lexicalToMarkdownString(post.content)

  const header = [
    `# ${post.title}`,
    '',
    post.meta?.description ? `> ${post.meta.description}` : null,
    post.meta?.description ? '' : null,
    `URL: ${siteUrl}/posts/${post.slug}`,
    post.publishedAt ? `Published: ${post.publishedAt}` : null,
    `Updated: ${post.updatedAt}`,
  ]
    .filter((line): line is string => line !== null)
    .join('\n')

  return `${header}\n\n${body}\n`
}
