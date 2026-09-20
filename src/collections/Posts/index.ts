import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
  OrderedListFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'
import { AUTOSAVE_INTERVAL_MS } from '@/collections/drafts'
import { authorFields } from '@/fields/authors'
import { closingTab } from '@/fields/closing'
import { contentsButtonField, editorialNotesField, relatedPagesField } from '@/fields/pageFields'
import { postLayoutBlocks } from '@/fields/pageLayoutBlocks'
import { seoMetaTab } from '@/fields/seoMetaTabFields'
import { slugField } from '@/fields/slug'
import { heroVisualSlotFields } from '@/fields/visual'
import { populateAuthors } from '@/hooks/populateAuthors'
import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Banner } from '../../blocks/Banner/config'
import { Carousel } from '../../blocks/Carousel/config'
import { Code } from '../../blocks/Code/config'
import { FeatureStatementLinks } from '../../blocks/feature/StatementLinks/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { YouTube } from '../../blocks/youtube/config'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidatePost } from './hooks/revalidatePost'
import { validatePublicMedia } from './hooks/validatePublicMedia'

export const Posts: CollectionConfig<'posts'> = {
  slug: 'posts',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a post is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'posts'>
  defaultPopulate: {
    title: true,
    slug: true,
    categories: true,
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    group: 'Website: Pages',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'posts',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'posts',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            ...heroVisualSlotFields(
              {
                name: 'heroImage',
                type: 'upload',
                relationTo: 'media',
                admin: {
                  description: 'Portrait crop (4:5) beside the title in the post hero.',
                },
              },
              {
                visualTypeDescription:
                  'Leave empty for the picture alone: the hero image, then the SEO image. An effect grounds the whole opening band behind the copy; the portrait crop still shows in its own frame.',
              },
            ),
            {
              name: 'standfirst',
              type: 'textarea',
              admin: {
                description:
                  'Editorial sentence under the title in the hero. Distinct from the SEO description — this one is written to be read.',
              },
            },
            contentsButtonField(),
            {
              name: 'content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    UnorderedListFeature(),
                    OrderedListFeature(),
                    BlocksFeature({
                      blocks: [Banner, Carousel, Code, FeatureStatementLinks, MediaBlock, YouTube],
                    }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: false,
              required: true,
            },
          ],
          label: 'Content',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              label: 'Composition',
              labels: { singular: 'Section', plural: 'Sections' },
              blocks: postLayoutBlocks,
              admin: {
                initCollapsed: true,
                description:
                  'Optional full-width sections rendered after the article body. The article itself stays in the Content tab.',
              },
            },
          ],
          label: 'Composition',
        },
        {
          label: 'Related Posts',
          fields: [
            {
              ...relatedPagesField('relatedPosts', 'posts'),
              admin: {
                description:
                  'Shown in the rail at the end of this post, in this order. Unpublished picks are skipped. Leave empty to show the most recently published posts (excluding this one).',
              },
            },
            {
              name: 'hideRelatedPosts',
              type: 'checkbox',
              defaultValue: false,
              label: 'Hide the rail on this post',
              admin: {
                description:
                  'Every post ends with the rail. Tick this to end on the article instead.',
              },
            },
            editorialNotesField(),
          ],
        },
        closingTab(),
        seoMetaTab(),
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'categories',
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    ...authorFields(),
    slugField(),
  ],
  hooks: {
    beforeChange: [validatePublicMedia],
    afterChange: [revalidatePost],
    afterRead: [populateAuthors],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: AUTOSAVE_INTERVAL_MS,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
