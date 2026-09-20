import { describe, expect, it } from 'vitest'
import { EFFECTS } from './effects'
import { recipeJsonSchema } from './recipe-schema'

const properties = recipeJsonSchema.schema.properties as Record<
  string,
  { description?: string; maximum?: number }
>

describe('recipeJsonSchema', () => {
  it('names every authorable parameter of every effect', () => {
    const description = properties.deltas?.description ?? ''
    for (const effect of Object.values(EFFECTS)) {
      expect(description).toContain(`"${effect.id}"`)
      for (const key of Object.keys(effect.parameters)) expect(description).toContain(`${key}: `)
    }
  })

  it('requires the four recipe properties and admits no other', () => {
    expect(recipeJsonSchema.schema.required).toEqual(['version', 'seed', 'deltas', 'frame'])
    expect(recipeJsonSchema.schema.additionalProperties).toBe(false)
  })
})
