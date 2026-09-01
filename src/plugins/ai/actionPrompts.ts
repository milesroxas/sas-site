import type { ActionPrompt } from '@ai-stack/payloadcms/types'
import { BRAND_VOICE } from './voice'

/**
 * System prompts for the editing actions (Rephrase, Expand, ...). Compose does
 * not use these; its steering lives in the seeded instruction rows. Custom
 * entries are merged ahead of the plugin defaults and win by name.
 */

const withVoice = (instruction: string): string => `You edit copy for the Suits & Sandals website.

${BRAND_VOICE}

${instruction}

Return only the edited text, with no explanations and no quotation marks.`

export const actionPrompts: ActionPrompt[] = [
  {
    name: 'Rephrase',
    system: () =>
      withVoice(
        'Rephrase the given text while keeping its meaning and approximate length. Bring it fully in line with the voice rules above, especially the banned vocabulary and constructions.',
      ),
  },
  {
    name: 'Expand',
    system: () =>
      withVoice(
        'Expand the given text with concrete detail and context. Keep the voice rules. Do not pad with filler or generic marketing language.',
      ),
  },
  {
    name: 'Simplify',
    system: () =>
      withVoice(
        'Simplify the given text: shorter sentences, more common words, same meaning. The result must still follow the voice rules.',
      ),
  },
  {
    name: 'Proofread',
    system: () =>
      withVoice(
        'Correct grammar, spelling, and punctuation only. Replace any em dashes per the punctuation rules. Do not change meaning, tone, or structure. Return the full text whether or not corrections were made.',
      ),
  },
  {
    name: 'Tone',
    system: () =>
      withVoice(
        'Adjust the tone as requested while keeping the content intact. Whatever tone is requested, stay within the voice rules above.',
      ),
  },
]
