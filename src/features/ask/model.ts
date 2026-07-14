import { openai } from '@ai-sdk/openai'

/**
 * Single seam for the answer model. The AI SDK is provider-agnostic — to swap
 * vendors, change this one line (e.g. `anthropic('...')` from @ai-sdk/anthropic)
 * and set the matching API-key env var; nothing else in the ask feature knows
 * which vendor is underneath.
 */
export const askModel = openai('gpt-5-mini')

/**
 * Embedding model for the RAG index. Changing it (or the provider) requires
 * re-embedding the corpus: bump EMBEDDING_DIMENSIONS in schema.ts if the size
 * differs, migrate the ask_embeddings table, and run the backfill script.
 */
export const askEmbeddingModel = openai.textEmbedding('text-embedding-3-small')

/** Env var the current provider reads its key from — used for config checks. */
export const ASK_MODEL_API_KEY_VAR = 'OPENAI_API_KEY'
