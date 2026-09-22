import type { CollectionBeforeChangeHook, Config, PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'
import { EM_DASH } from '@/features/editorial/voice'
import { houseStylePlugin } from './index'

const config = houseStylePlugin()({
  collections: [
    { slug: 'lab-projects', fields: [], hooks: { beforeChange: [() => undefined] } },
    { slug: 'plain', fields: [] },
  ],
} as unknown as Config) as Config

const hooksOf = (slug: string) =>
  config.collections?.find((collection) => collection.slug === slug)?.hooks?.beforeChange ?? []

type Who = 'key' | 'person' | 'nobody'

const save = (data: Record<string, unknown>, who: Who = 'key', autosave = false) => {
  const hooks = hooksOf('lab-projects') as CollectionBeforeChangeHook[]
  const hook = hooks[hooks.length - 1]
  if (!hook) throw new Error('houseStylePlugin attached no hook')
  const user =
    who === 'key'
      ? { id: 1, collection: 'mcp-keys' }
      : who === 'person'
        ? { id: 1, collection: 'users' }
        : null
  return hook({
    collection: { slug: 'lab-projects' },
    data,
    req: { user, query: autosave ? { autosave: 'true' } : {} } as unknown as PayloadRequest,
  } as unknown as Parameters<CollectionBeforeChangeHook>[0])
}

type Refusal = { data: { errors: { message: string; path: string }[] } }

/** What the hook threw, or fails the test if it let the save through. */
const refusal = (fn: () => unknown): Refusal => {
  try {
    fn()
  } catch (error) {
    return error as Refusal
  }
  throw new Error('the save was not refused')
}

const lexical = (text: string) => ({
  root: {
    type: 'root',
    format: '',
    direction: 'ltr',
    children: [{ type: 'paragraph', children: [{ type: 'text', text, mode: 'normal' }] }],
  },
})

describe('houseStylePlugin', () => {
  it('hooks every collection, after the hooks it already had', () => {
    expect(hooksOf('lab-projects')).toHaveLength(2)
    expect(hooksOf('plain')).toHaveLength(1)
  })

  it('refuses an em dash an API key writes, naming the path', () => {
    expect(refusal(() => save({ title: `Before${EM_DASH}after` })).data.errors).toMatchObject([
      { path: 'title' },
    ])
  })

  it('refuses a banned phrase inside rich text, at the text node', () => {
    const data = { context: { body: lexical('A seamless, holistic launch.') } }
    expect(refusal(() => save(data)).data.errors).toMatchObject([
      {
        message: expect.stringContaining('"seamless", "holistic"'),
        path: 'context.body.root.children.0.children.0.text',
      },
    ])
  })

  it('reports every problem in one error', () => {
    const data = { title: `A${EM_DASH}B`, summaries: { short: 'We elevate.' } }
    expect(refusal(() => save(data)).data.errors).toMatchObject([
      { path: 'title' },
      { path: 'summaries.short' },
    ])
  })

  it('lets a numeric range keep its dash and passes copy that follows the voice', () => {
    const data = { title: `50${EM_DASH}100K budgets`, summary: 'Make the difference visible.' }
    expect(save(data)).toBe(data)
  })

  it('does not read code blocks, keys, slugs or spec fields', () => {
    const data = {
      slug: `not${EM_DASH}copy`,
      layout: [
        { blockType: 'code', language: 'ts', code: `const seamless = 1 ${EM_DASH} 2` },
        { blockType: 'chart', spec: { title: 'seamless' }, title: 'Frame time' },
      ],
    }
    expect(save(data)).toBe(data)
  })

  it('never refuses a team member or an anonymous request, nor an autosave', () => {
    const data = { title: `A quote${EM_DASH}kept as written, and seamless.` }
    expect(save(data, 'person')).toBe(data)
    expect(save(data, 'nobody')).toBe(data)
    expect(save(data, 'key', true)).toBe(data)
  })
})
