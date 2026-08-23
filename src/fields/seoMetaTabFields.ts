import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import type { Field } from 'payload'

/** SEO tab fields shared by website page surfaces (Pages, Home, Posts, etc.). */
export const seoMetaTabFields: Field[] = [
  OverviewField({
    titlePath: 'meta.title',
    descriptionPath: 'meta.description',
    imagePath: 'meta.image',
  }),
  MetaTitleField({
    hasGenerateFn: true,
    overrides: {
      admin: {
        description:
          'Shown as the headline in Google results and the browser tab. Aim for 50–60 characters. Use "Auto-generate" to build one from the page title.',
      },
    },
  }),
  MetaImageField({
    relationTo: 'media',
    overrides: {
      admin: {
        description:
          'Default image for search and social previews. Landscape, at least 1200×630px. Also used for share cards unless an Open Graph image is set below.',
      },
    },
  }),
  MetaDescriptionField({
    overrides: {
      admin: {
        description:
          'The short summary under the title in Google results. Aim for 100–150 characters — front-load the most important message.',
      },
    },
  }),
  {
    name: 'og',
    type: 'group',
    label: 'Open Graph (Social Sharing)',
    admin: {
      description:
        'Controls how this page looks when shared on LinkedIn, Facebook, Slack, iMessage, etc. Every field is optional — anything left blank falls back to the SEO fields above.',
    },
    fields: [
      {
        name: 'title',
        type: 'text',
        label: 'OG Title',
        admin: {
          description:
            'Headline on the share card. Can be punchier than the SEO title — no need to include "| Suits & Sandals". Blank = SEO title.',
        },
      },
      {
        name: 'description',
        type: 'textarea',
        label: 'OG Description',
        admin: {
          description:
            'One or two sentences under the share-card headline. Keep it under ~200 characters; platforms truncate longer text. Blank = SEO description.',
        },
      },
      {
        name: 'image',
        type: 'upload',
        relationTo: 'media',
        label: 'OG Image',
        admin: {
          description:
            'Share-card image. Landscape 1200×630px (1.91:1) — square or portrait images get cropped by most platforms. Blank = SEO image.',
        },
      },
    ],
  },
  PreviewField({
    hasGenerateFn: true,
    titlePath: 'meta.title',
    descriptionPath: 'meta.description',
  }),
]
