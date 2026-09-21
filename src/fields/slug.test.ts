// @vitest-environment node
import { type FieldHook, type FieldHookArgs, type TextField, ValidationError } from 'payload'
import { describe, expect, it } from 'vitest'
import { slugField } from './slug'

const row = slugField({ name: 'key', checkboxName: 'generateKey', useAsSlug: 'title' })
const keyField = row.fields.find((f): f is TextField => f.type === 'text' && f.name === 'key')
const hooks = (keyField?.hooks?.beforeValidate ?? []) as FieldHook[]

/** Runs the key field's beforeValidate hooks in order, as Payload does. */
const save = async (value: unknown, data: Record<string, unknown> = {}) => {
  let current = value
  for (const hook of hooks)
    current = await hook({
      collection: { slug: 'case-studies' },
      data,
      value: current,
    } as unknown as FieldHookArgs)
  return current
}

const refusedPaths = async (value: unknown, data?: Record<string, unknown>) => {
  try {
    await save(value, data)
  } catch (error) {
    if (error instanceof ValidationError) return error.data.errors.map(({ path }) => path)
    throw error
  }
  return []
}

describe('slugField', () => {
  it('refuses an email typed or autofilled into the slug', async () => {
    expect(await refusedPaths('miles@suits-sandals.com', { title: 'A real title' })).toEqual([
      'key',
    ])
  })

  it('refuses a title that is an email address, which would become the slug', async () => {
    expect(await refusedPaths(undefined, { title: ' miles@suits-sandals.com ' })).toEqual(['title'])
  })

  it('keeps an @ that is not an address in the title', async () => {
    expect(await refusedPaths(undefined, { title: 'Q&A @ Config' })).toEqual([])
  })

  it('normalizes a hand-written slug and empties a blank one', async () => {
    expect(await save('  Redefining A Health Brand ', { title: 'Redefining' })).toBe(
      'redefining-a-health-brand',
    )
    expect(await save('   ', {})).toBeNull()
  })
})
