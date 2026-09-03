import type { CollectionConfig, Labels } from 'payload'
import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { slugField } from '@/fields/slug'

/**
 * A shared-vocabulary collection: an ordered, publicly readable list of named
 * terms other content links to. Every one is the same name + slug +
 * description record under the Taxonomy admin group — they differ only in
 * their slug, their labels, and the guidance shown to editors.
 */
type TaxonomySlug = 'capabilities' | 'industries' | 'platforms'

export const taxonomyCollection = <S extends TaxonomySlug>({
  description,
  labels,
  nameDescription,
  slug,
  termDescription,
}: {
  /** Admin-list description explaining what belongs in this vocabulary. */
  description?: string
  labels?: Labels
  /** Guidance on the `name` field. */
  nameDescription?: string
  slug: S
  /** Guidance on the `description` field. */
  termDescription?: string
}): CollectionConfig<S> => ({
  slug,
  ...(labels ? { labels } : {}),
  orderable: true,
  defaultSort: '_order',
  access: { create: authenticated, delete: authenticated, read: anyone, update: authenticated },
  admin: {
    group: 'Taxonomy',
    useAsTitle: 'name',
    defaultColumns: ['name', 'updatedAt'],
    ...(description ? { description } : {}),
  },
  defaultPopulate: { name: true, slug: true },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      ...(nameDescription ? { admin: { description: nameDescription } } : {}),
    },
    slugField({ useAsSlug: 'name' }),
    {
      name: 'description',
      type: 'textarea',
      ...(termDescription ? { admin: { description: termDescription } } : {}),
    },
  ],
})
