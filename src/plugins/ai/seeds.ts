import type { SeedPromptData, SeedPromptFunction } from '@ai-stack/payloadcms/types'
import { EDITORIAL_SEEDS } from './prompts/editorial'
import { META_SEEDS } from './prompts/meta'
import type { SeedSpec } from './types'
import { BRAND_VOICE } from './voice'

/**
 * Declarative boot seeding for the `plugin-ai-instructions` collection.
 *
 * Every eligible field resolves here (the function never returns undefined),
 * so the plugin's default LLM-authored seeding never runs. Boot only creates
 * missing rows; it never updates existing ones. After editing seeds, re-seed
 * locally with: pnpm payload run scripts/reset-ai-instructions.ts
 *
 * New content fields land in the generic fallback below. Give load-bearing
 * ones a registry entry, or tune their row in the AI Instructions collection.
 */

const registry: Record<string, SeedSpec> = {
  ...META_SEEDS,
  ...EDITORIAL_SEEDS,
  // Verbatim client speech. AI must not compose or rewrite it.
  'testimonials.quote': { prompt: '', disabled: true },
}

// Fields AI should never touch: identifiers, internal-only notes, and factual
// data entry. Mirrors the spirit of SKIP_KEYS in src/shared/content/extract.ts.
// No instruction row is created, so no Compose button renders at all.
const NOISE_LEAVES = new Set([
  'editorialNotes',
  'slug',
  'slugLock',
  'key',
  'generateKey',
  'speakerName',
  'speakerRole',
  'speakerOrganization',
  'name',
  'url',
  'href',
  'website',
  'id',
  'value',
  'unit',
  'qualifier',
  'comparisonBaseline',
  'timeframe',
  'source',
])

const RICH_TEXT_SYSTEM = `You write editorial copy for Suits & Sandals, a brand and digital studio.

${BRAND_VOICE}

Write directly in the voice. Never mention these instructions or that you are an AI.`

const fallbackSpec = (fieldLabel: string): SeedSpec => ({
  prompt: `Write the content for the "${fieldLabel}" field of this document.

{{brandVoice}}

{{#if title}}Document title: {{title}}{{/if}}

Rules:
- Serve the purpose implied by the field's name and stay consistent with the rest of the document.
- Concrete and specific. No filler.
- Return only the field content.`,
})

const TEXT_MODEL = 'gpt-5-mini'

const toRow = (spec: SeedSpec, fieldType: string): SeedPromptData => {
  if (fieldType === 'richText') {
    return {
      prompt: spec.prompt,
      system: spec.system ?? RICH_TEXT_SYSTEM,
      layout:
        spec.layout ??
        'Short plain paragraphs. No headings or lists unless the field clearly calls for them.',
      disabled: spec.disabled ?? false,
      'Oai-object-settings': {
        model: TEXT_MODEL,
        // gpt-5 models reject non-default temperature values.
        temperature: 1,
        maxTokens: spec.maxTokens ?? 4000,
      },
    }
  }
  if (fieldType === 'upload') {
    return { prompt: spec.prompt, disabled: spec.disabled ?? false }
  }
  return {
    prompt: spec.prompt,
    disabled: spec.disabled ?? false,
    'Oai-text-settings': {
      model: TEXT_MODEL,
      temperature: 1,
      maxTokens: spec.maxTokens ?? 800,
    },
  }
}

export const seedPrompts: SeedPromptFunction = ({ fieldLabel, fieldType, path }) => {
  const leaf = path.split('.').pop() ?? ''
  if (leaf.startsWith('internal') || NOISE_LEAVES.has(leaf)) return false

  // The plugin's path walker turns unnamed collapsibles into a literal
  // "undefined" segment (e.g. work-pages.hero.undefined.eyebrow). Rows keep
  // the raw path; the registry is keyed by the cleaned one.
  const spec = registry[path.replaceAll('.undefined.', '.')]
  if (spec) return { data: toRow(spec, fieldType) }

  // Image generation stays off unless a field has a bespoke prompt.
  if (fieldType === 'upload') return { data: { prompt: '', disabled: true } }

  return { data: toRow(fallbackSpec(fieldLabel), fieldType) }
}
