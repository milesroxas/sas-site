import type { PromptField } from '@ai-stack/payloadcms/types'
import type { CaseStudy, LabProject } from '@/payload-types'
import { BRAND_VOICE } from './voice'

/**
 * Computed {{variables}} available in AI instruction prompt templates. They
 * also appear in the admin prompt editor's autocomplete. Getters run
 * server-side per generation and receive only the in-progress form doc, so
 * related documents are fetched here.
 */

// This module is (transitively) imported by payload.config.ts, so
// @payload-config must load lazily to avoid a module-eval cycle. getPayload
// returns the cached instance after the first call.
const getPayloadClient = async () => {
  const [{ default: config }, { getPayload }] = await Promise.all([
    import('@payload-config'),
    import('payload'),
  ])
  return getPayload({ config })
}

// The form doc holds whatever the form has: an id for a saved relation, a
// populated object, or nothing at all.
const relationId = (value: unknown): number | string | undefined => {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) {
    return (value as { id?: number | string }).id ?? undefined
  }
  return undefined
}

const line = (label: string, value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? `${label}: ${value.trim()}` : undefined

// Meta prompts need the canonical facts, not the full narrative.
const CONTEXT_CHAR_CAP = 2000

const clip = (text: string): string =>
  text.length > CONTEXT_CHAR_CAP ? `${text.slice(0, CONTEXT_CHAR_CAP)}…` : text

const formatCaseStudy = (doc: CaseStudy): string => {
  const objectives = (doc.objectives ?? []).map(
    (o) => `- ${o.title}${o.description ? `: ${o.description}` : ''}`,
  )
  const metrics = (doc.metrics ?? [])
    .filter((m) => m.approvedForPublic && m.label && m.value)
    .map(
      (m) =>
        `- ${m.label}: ${m.value}${m.unit ? ` ${m.unit}` : ''}${m.timeframe ? ` (${m.timeframe})` : ''}`,
    )
  return clip(
    [
      line('Canonical title', doc.title),
      line('Thesis', doc.thesis),
      line('One-line summary', doc.summaries?.oneLine),
      line('Short summary', doc.summaries?.short),
      line('Medium summary', doc.summaries?.medium),
      objectives.length ? `Objectives:\n${objectives.join('\n')}` : undefined,
      metrics.length ? `Publicly approved results:\n${metrics.join('\n')}` : undefined,
    ]
      .filter(Boolean)
      .join('\n'),
  )
}

const formatLabProject = (doc: LabProject): string => {
  const technologies = (doc.technologies ?? []).map((t) => t.name).filter(Boolean)
  return clip(
    [
      line('Canonical title', doc.title),
      line('Kind', doc.kind),
      line('Thesis', doc.thesis),
      line('One-line summary', doc.summaries?.oneLine),
      line('Short summary', doc.summaries?.short),
      line('Medium summary', doc.summaries?.medium),
      technologies.length ? `Technologies: ${technologies.join(', ')}` : undefined,
    ]
      .filter(Boolean)
      .join('\n'),
  )
}

const canonicalGetter =
  <TDoc>(
    collection: 'case-studies' | 'lab-projects',
    relationName: string,
    format: (doc: TDoc) => string,
  ) =>
  async (data: object): Promise<string> => {
    const id = relationId((data as Record<string, unknown>)[relationName])
    if (!id) return '(No canonical record is linked yet. Use the fields on this page instead.)'
    const payload = await getPayloadClient()
    const doc = await payload.findByID({ collection, id, depth: 0, draft: true }).catch(() => null)
    if (!doc) return '(The linked canonical record could not be loaded.)'
    return format(doc as TDoc)
  }

export const promptFields: PromptField[] = [
  { name: 'brandVoice', getter: () => BRAND_VOICE },
  {
    name: 'siteInfo',
    getter: async () => {
      const payload = await getPayloadClient()
      const info = await payload.findGlobal({ slug: 'site-info', depth: 0 }).catch(() => null)
      if (!info) return ''
      return [info.name, info.tagline, info.description].filter(Boolean).join(' - ')
    },
  },
  {
    name: 'caseStudy',
    collections: ['work-pages'],
    getter: canonicalGetter<CaseStudy>('case-studies', 'caseStudy', formatCaseStudy),
  },
  {
    name: 'labProject',
    collections: ['lab-pages'],
    getter: canonicalGetter<LabProject>('lab-projects', 'labProject', formatLabProject),
  },
]
