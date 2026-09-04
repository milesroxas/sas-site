import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  CollectionSlug,
} from 'payload'
import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { AUTOSAVE_INTERVAL_MS } from '@/collections/drafts'
import { closingTab } from '@/fields/closing'
import { editorialNotesField } from '@/fields/pageFields'
import { segmentPageBlocks } from '@/fields/pageLayoutBlocks'
import { seoMetaTab } from '@/fields/seoMetaTabFields'
import { slugField } from '@/fields/slug'
import { segmentHero } from '@/heros/SegmentHero/config'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'
import { RELATED_WORK_DEFAULT_COPY } from '@/sections/RelatedWork/copy'
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
  // Drag-to-reorder in the admin list; the takeover menu and index read this order.
  orderable: true,
  defaultSort: '_order',
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
        {
          label: 'Opening',
          description: 'The full-screen opening of the page: the hero.',
          fields: [segmentHero],
        },
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
              name: 'relatedWork',
              type: 'group',
              interfaceName: 'SegmentRelatedWorkCopy',
              label: 'Related work copy',
              admin: {
                description:
                  'The text beside the related-work list at the foot of the page. Leave a field empty to use the standing line shown as its placeholder.',
              },
              fields: [
                {
                  name: 'eyebrow',
                  type: 'text',
                  label: 'Eyebrow',
                  admin: { placeholder: RELATED_WORK_DEFAULT_COPY.eyebrow },
                },
                {
                  name: 'heading',
                  type: 'text',
                  label: 'Headline',
                  admin: { placeholder: RELATED_WORK_DEFAULT_COPY.heading },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: 'Body',
                  admin: { placeholder: RELATED_WORK_DEFAULT_COPY.description },
                },
              ],
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
  versions: {
    drafts: { autosave: { interval: AUTOSAVE_INTERVAL_MS }, schedulePublish: true },
    maxPerDoc: 50,
  },
})
