import type { JSONField } from 'payload'
import type { Effect, Parameter } from './effect'
import { EFFECTS } from './effects'
import { FRAME_MAX, RECIPE_VERSION, SEED_MAX } from './recipe'

/**
 * A recipe as JSON Schema, for the look's `recipe` field. The admin never sees
 * it (the Inspector replaces the JSON editor); it is there for the reader that
 * has no Inspector: an agent drafting a look over MCP, whose tool schema is
 * built from this.
 *
 * Every name and range below is read out of the effect contracts, so nothing
 * here restates a number. Defaults are left out on purpose: they move with
 * every tuning pass, and this text is also written into `payload-types.ts`. A
 * published look's `snapshot` already shows every resolved value.
 *
 * `deltas` stays an open object because its keys depend on a sibling field
 * (the look's `effect`), which JSON Schema cannot condition on; the parameter
 * table rides in its description, and `validateRecipe` is what answers on save.
 */

const describeParameter = (key: string, spec: Parameter): string => {
  if ('options' in spec) return `${key}: ${spec.options.map((option) => `"${option}"`).join(' | ')}`
  if ('toggle' in spec) return `${key}: true | false`
  if ('color' in spec) return `${key}: [r, g, b], each 0 to 1`
  if ('vector' in spec) return `${key}: ${spec.vector} numbers, each ${spec.min} to ${spec.max}`
  return `${key}: ${spec.min} to ${spec.max}`
}

const describeEffect = (effect: Effect): string => {
  const groups = new Map<string, string[]>()
  for (const [key, spec] of Object.entries(effect.parameters)) {
    const lines = groups.get(spec.group) ?? []
    lines.push(describeParameter(key, spec))
    groups.set(spec.group, lines)
  }
  const table = [...groups].map(([group, lines]) => `${group}: ${lines.join('; ')}.`).join(' ')
  return `When \`effect\` is "${effect.id}" (${effect.label}): ${table}`
}

const DELTAS_DESCRIPTION = [
  'Only the parameters that leave their default, by name. `{}` is the effect as it ships, and the `snapshot.dark` of any published look of the same effect shows every resolved value to start from. An unknown name or a value out of range is refused on save with the reason.',
  ...Object.values(EFFECTS).map(describeEffect),
].join(' ')

const unseeded = Object.values(EFFECTS)
  .filter((effect) => !effect.seeded)
  .map((effect) => effect.label)

const uri = 'a://studio/recipe.schema.json'

export const recipeJsonSchema: NonNullable<JSONField['jsonSchema']> = {
  fileMatch: [uri],
  uri,
  schema: {
    type: 'object',
    description:
      'What a Studio look draws. A draft can be written over the API; publishing happens in the admin Studio, where the posters are rendered.',
    additionalProperties: false,
    required: ['version', 'seed', 'deltas', 'frame'],
    properties: {
      version: { type: 'integer', enum: [RECIPE_VERSION] },
      seed: {
        type: 'integer',
        minimum: 0,
        maximum: SEED_MAX,
        description: `Lays out a seeded effect: a different seed is a different arrangement of the same look. Send 0 for an effect no seed changes (${unseeded.join(', ')}).`,
      },
      frame: {
        type: 'integer',
        minimum: 1,
        maximum: FRAME_MAX,
        description: 'The animation frame the posters are captured at.',
      },
      deltas: { type: 'object', description: DELTAS_DESCRIPTION },
    },
  },
}
