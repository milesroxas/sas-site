import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import type { Payload, Where } from 'payload'
import type { Post, Search } from '@/payload-types'

export type RetrievedSource = {
  title: string
  url: string
  text: string
}

/**
 * MVP retrieval: keyword match against the search-plugin index (currently posts only),
 * scored in-process, then hydrated to full plaintext from the source document.
 * Swapping this module for embedding search (pgvector) later leaves the /api/ask
 * endpoint untouched — this is the seam the RAG grows through.
 */

const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'about',
  'can',
  'do',
  'does',
  'for',
  'from',
  'how',
  'i',
  'in',
  'is',
  'it',
  'me',
  'my',
  'of',
  'on',
  'or',
  'tell',
  'the',
  'to',
  'we',
  'what',
  'when',
  'where',
  'which',
  'who',
  'why',
  'with',
  'you',
  'your',
])

const MAX_TERMS = 8
const CANDIDATE_LIMIT = 20
const TOP_SOURCES = 4
const MAX_CHARS_PER_SOURCE = 6_000

const urlPrefixByCollection: Record<string, string> = {
  posts: '/posts',
}

export function extractTerms(question: string): string[] {
  const terms = question
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length >= 3 && !STOPWORDS.has(word))

  return [...new Set(terms)].slice(0, MAX_TERMS)
}

function scoreDoc(doc: Search, terms: string[]): number {
  const title = (doc.title ?? '').toLowerCase()
  const description = (doc.meta?.description ?? '').toLowerCase()

  return terms.reduce((score, term) => {
    let hit = 0
    if (title.includes(term)) hit += 2
    if (description.includes(term)) hit += 1
    return score + hit
  }, 0)
}

function postToPlaintext(post: Post): string {
  if (!post.content) return ''
  return convertLexicalToPlaintext({ data: post.content })
}

export async function retrieveSources(
  payload: Payload,
  question: string,
): Promise<RetrievedSource[]> {
  const terms = extractTerms(question)
  if (terms.length === 0) return []

  const { docs: candidates } = await payload.find({
    collection: 'search',
    depth: 0,
    limit: CANDIDATE_LIMIT,
    pagination: false,
    where: {
      or: terms.flatMap((term): Where[] => [
        { title: { contains: term } },
        { 'meta.description': { contains: term } },
      ]),
    },
  })

  const ranked = candidates
    .map((doc) => ({ doc, score: scoreDoc(doc, terms) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_SOURCES)

  const sources: RetrievedSource[] = []

  for (const { doc } of ranked) {
    const { relationTo, value } = doc.doc
    const id = typeof value === 'object' ? value.id : value

    const post = await payload.findByID({
      collection: relationTo,
      id,
      depth: 0,
      disableErrors: true,
    })
    if (!post) continue

    const prefix = urlPrefixByCollection[relationTo] ?? ''
    sources.push({
      title: post.title,
      url: `${prefix}/${post.slug}`,
      text: postToPlaintext(post).slice(0, MAX_CHARS_PER_SOURCE),
    })
  }

  return sources
}
