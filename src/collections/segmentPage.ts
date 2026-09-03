import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  CollectionSlug,
} from 'payload'
import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { closingTab } from '@/fields/closing'
import { editorialNotesField } from '@/fields/pageFields'
import { segmentPageBlocks } from '@/fields/pageLayoutBlocks'
import { seoMetaTab } from '@/fields/seoMetaTabFields'
import { slugField } from '@/fields/slug'
import { hero } from '@/heros/config'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'
import { collectionPreview } from '@/utilities/generatePreviewPath'

type SegmentPageSlug = 'audience-pages' | 'expertise-pages'

/**
 * A segment page: a composed marketing surface (Who We Help, Expertise) that
 * argues for one slice of the business and then proves it with related work.
 * Both are the same collection — hero, block composition, a taxonomy the
 * automatic work matching keys off, SEO — differing only in which taxonomy
 * that is and the copy around it.
 */
export const segmentPageCollection = <S extends SegmentPageSlug>({
  description,
  labels,
  relatedWorkDescription,
  revalidate,
  revalidateDelete,
  slug,
  taxonomy,
}: {
  /** Admin-list description: what this collection is and where it publishes. */
  description: string
  labels: CollectionConfig['labels']
  /** Guidance on the manual related-work picker, naming the automatic fallback. */
  relatedWorkDescription: string
  revalidate: CollectionAfterChangeHook
  revalidateDelete: CollectionAfterDeleteHook
  slug: S
  /** The taxonomy this segment is defined by, and that matches work to it. */
  taxonomy: {
    description: string
    name: string
    relationTo: CollectionSlug
  }
}): CollectionConfig<S> => ({
  slug,
  labels,
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    group: 'Website: Pages',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', taxonomy.name, '_status', 'updatedAt'],
    description,
    ...collectionPreview(slug),
  },
  defaultPopulate: { title: true, slug: true, [taxonomy.name]: true },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        { label: 'Opening', fields: [hero] },
        {
          label: 'Composition',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              label: 'Composition',
              // The add button reads "Add Section": editors reach for a Section
              // first and nest content blocks inside it.
              labels: { singular: 'Section', plural: 'Sections' },
              blocks: segmentPageBlocks,
              required: true,
              admin: { initCollapsed: true },
            },
          ],
        },
        {
          label: 'Positioning',
          fields: [
            {
              name: taxonomy.name,
              type: 'relationship',
              relationTo: taxonomy.relationTo,
              hasMany: true,
              required: true,
              admin: { description: taxonomy.description },
            },
            {
              name: 'relatedWorkPages',
              type: 'relationship',
              relationTo: 'work-pages',
              hasMany: true,
              admin: { description: relatedWorkDescription },
            },
            editorialNotesField(),
          ],
        },
        closingTab(),
        seoMetaTab(),
      ],
    },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
    slugField({ useAsSlug: 'title' }),
  ],
  hooks: {
    beforeChange: [populatePublishedAt],
    afterChange: [revalidate],
    afterDelete: [revalidateDelete],
  },
  versions: { drafts: { autosave: { interval: 100 }, schedulePublish: true }, maxPerDoc: 50 },
})
