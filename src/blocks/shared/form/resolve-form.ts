import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'
import type { Capability, Form } from '@/payload-types'
import type { FormFieldOption, ResolvedFormField } from './types'

/** Ceiling on the capability list when a field offers "everything". */
const CAPABILITY_LIMIT = 24

const isCapability = (value: unknown): value is Capability =>
  typeof value === 'object' && value !== null && 'name' in value

const toOption = (capability: Pick<Capability, 'id' | 'name'>): FormFieldOption => ({
  label: capability.name,
  value: String(capability.id),
})

/**
 * Every capability the studio offers, in its editorial order. `cache` scopes
 * the memo to one render pass — a page carrying several forms asks once — while
 * a fresh render always rereads, so a capability added to the taxonomy shows up
 * on the next revalidation rather than the next deploy.
 */
const everyCapability = cache(async (): Promise<FormFieldOption[]> => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'capabilities',
    limit: CAPABILITY_LIMIT,
    depth: 0,
    sort: '_order',
    select: { name: true },
  })
  return docs.map(toOption)
})

/**
 * Turn a stored form into fields the browser can render directly.
 *
 * Only capability chips need resolving today: an explicit selection wins,
 * an empty one means the whole vocabulary, so adding a capability to the
 * taxonomy adds it to every form that asks the question.
 */
export async function resolveFormFields(form: Form): Promise<ResolvedFormField[]> {
  const fields = (form.fields ?? []) as unknown as ResolvedFormField[]

  return Promise.all(
    fields.map(async (field) => {
      if (field.blockType !== 'capabilities') return field

      const chosen = (field as { options?: unknown }).options
      const selected = Array.isArray(chosen) ? chosen.filter(isCapability).map(toOption) : []
      if (selected.length > 0) return { ...field, options: selected }

      return { ...field, options: await everyCapability() }
    }),
  )
}
