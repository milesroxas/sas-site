import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { authenticated } from '../access/authenticated'

/**
 * Newsletter audiences — the segments a newsletter can be sent to (e.g. clients, public
 * subscribers, leads). Kept as a collection rather than a hardcoded select so the team can add
 * segments without a code change.
 */
export const Audiences: CollectionConfig<'audiences'> = {
  slug: 'audiences',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  defaultPopulate: { name: true, slug: true },
  admin: {
    group: 'Newsletter',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'allowPublicSignup', 'updatedAt'],
  },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true },
    slugField({ fieldToUse: 'name' }),
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Who belongs in this audience and how they got here.' },
    },
    {
      name: 'allowPublicSignup',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'Allow the public signup form to add subscribers to this audience. Leave off for curated lists like clients or leads.',
      },
    },
  ],
  timestamps: true,
}
