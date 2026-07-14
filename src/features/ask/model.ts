import { openai } from '@ai-sdk/openai'

/**
 * Single seam for the answer model. The AI SDK is provider-agnostic — to swap
 * vendors, change this one line (e.g. `anthropic('...')` from @ai-sdk/anthropic)
 * and set the matching API-key env var; nothing else in the ask feature knows
 * which vendor is underneath.
 */
export const askModel = openai('gpt-5-mini')

/** Env var the current provider reads its key from — used for config checks. */
export const ASK_MODEL_API_KEY_VAR = 'OPENAI_API_KEY'
