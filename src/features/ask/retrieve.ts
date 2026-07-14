import type { Payload, Where } from 'payload'
import type { Search } from '@/payload-types'
import { extractDocMarkdown } from '@/shared/content/extract'
import { type ContentSurface, surfaceByCollection, surfaceDocPath } from '@/shared/content/surfaces'
import { embedQuestion, type NearestChunk, queryNearestChunks } from './embeddings'
import { ASK_MODEL_API_KEY_VAR } from './model'

export type RetrievedSource = {
  title: string
  url: string
  text: string
}

/**
 * Retrieval for the /api/ask endpoint. Embedding search over ask_embeddings
 * is the primary path (semantic recall across every content surface); the
 * original keyword match over the search-plugin index remains as the fallback
 * for when embeddings are unavailable — no API key, empty index (backfill not
 * run), or a transient embedding-API failure.
 *
 * The endpoint knows nothing about any of this: `retrieveSources(payload,
 * question)` is the seam, and an empty result still means "refuse rather
 * than guess".
 */

/**
 * Cosine-similarity floor for a chunk to count as evidence. text-embedding-3
 * similarities for genuinely related text sit well above 0.4; unrelated text
 * hovers near 0.1–0.2. 0.3 keeps recall generous — the grounded system prompt
 * is the second line of defense against weak matches.
 */
const MIN_SIMILARITY = 0.3
const CHUNK_CANDIDATES = 12
const TOP_SOURCES = 4
const MAX_CHUNKS_PER_SOURCE = 3

// Keyword-fallback tuning (unchanged from the MVP keyword retriever).
const MAX_TERMS = 8
const CANDIDATE_LIMIT = 20
const MAX_CHARS_PER_SOURCE = 6_000

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

/** Group nearest chunks into per-document sources, best match first. */
function chunksToSources(chunks: NearestChunk[]): RetrievedSource[] {
  const byDoc = new Map<string, { surface: ContentSurface; chunks: NearestChunk[] }>()

  for (const chunk of chunks) {
    const surface = surfaceByCollection.get(chunk.collection)
    if (!surface) continue

    const key = `${chunk.collection}:${chunk.docId}`
    const entry = byDoc.get(key)
    if (entry) {
      if (entry.chunks.length < MAX_CHUNKS_PER_SOURCE) entry.chunks.push(chunk)
    } else if (byDoc.size < TOP_SOURCES) {
      byDoc.set(key, { surface, chunks: [chunk] })
    }
  }

  return [...byDoc.values()].map(({ surface, chunks: docChunks }) => {
    const { title, slug } = docChunks[0]
    const text = docChunks
      .sort((a, b) => a.chunkIndex - b.chunkIndex)
      .map((chunk) => (chunk.headingPath ? `[${chunk.headingPath}]\n${chunk.text}` : chunk.text))
      .join('\n\n')

    return { title, url: surfaceDocPath(surface, slug), text }
  })
}

async function retrieveByEmbedding(payload: Payload, question: string): Promise<RetrievedSource[]> {
  const questionEmbedding = await embedQuestion(question)
  const chunks = await queryNearestChunks(payload, questionEmbedding, {
    limit: CHUNK_CANDIDATES,
    minSimilarity: MIN_SIMILARITY,
  })
  return chunksToSources(chunks)
}

async function retrieveByKeywords(payload: Payload, question: string): Promise<RetrievedSource[]> {
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
    const surface = surfaceByCollection.get(relationTo)
    if (!surface) continue

    const sourceDoc = await payload.findByID({
      collection: relationTo,
      id,
      depth: 0,
      disableErrors: true,
    })
    if (!sourceDoc?.slug || !sourceDoc?.title) continue

    const markdown = await extractDocMarkdown(payload, surface, sourceDoc)
    sources.push({
      title: sourceDoc.title,
      url: surfaceDocPath(surface, sourceDoc.slug),
      text: markdown.slice(0, MAX_CHARS_PER_SOURCE),
    })
  }

  return sources
}

export async function retrieveSources(
  payload: Payload,
  question: string,
): Promise<RetrievedSource[]> {
  if (process.env[ASK_MODEL_API_KEY_VAR]) {
    try {
      const sources = await retrieveByEmbedding(payload, question)
      if (sources.length > 0) return sources
    } catch (err) {
      payload.logger.error({ msg: 'embedding retrieval failed, falling back to keywords', err })
    }
  }

  return retrieveByKeywords(payload, question)
}
