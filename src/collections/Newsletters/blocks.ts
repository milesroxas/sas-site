import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
  OrderedListFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical'
import type { Block, TextFieldSingleValidation } from 'payload'

/**
 * Content blocks for newsletter emails. Deliberately separate from the website blocks: email
 * clients only render a narrow subset of HTML/CSS, so every block here has an email-safe
 * renderer in `src/shared/email/newsletter/blocks.tsx`. Keep the two files in sync.
 */

const validateEmailSafeUrl: TextFieldSingleValidation = (value) => {
  if (!value) return true
  if (/^https?:\/\//.test(value) || value.startsWith('/')) return true
  return 'Use a full URL (https://…) or a site-relative path starting with /'
}

export const NewsletterText: Block = {
  slug: 'nlText',
  interfaceName: 'NewsletterTextBlock',
  labels: { singular: 'Text', plural: 'Text sections' },
  fields: [
    {
      name: 'body',
      type: 'richText',
      required: true,
      label: false,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
          UnorderedListFeature(),
          OrderedListFeature(),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
  ],
}

export const NewsletterImage: Block = {
  slug: 'nlImage',
  interfaceName: 'NewsletterImageBlock',
  labels: { singular: 'Image', plural: 'Images' },
  fields: [
    { name: 'media', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'link',
      type: 'text',
      validate: validateEmailSafeUrl,
      admin: { description: 'Optional. Where the image links to.' },
    },
  ],
}

export const NewsletterButton: Block = {
  slug: 'nlButton',
  interfaceName: 'NewsletterButtonBlock',
  labels: { singular: 'Button', plural: 'Buttons' },
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'url', type: 'text', required: true, validate: validateEmailSafeUrl },
  ],
}

export const NewsletterPosts: Block = {
  slug: 'nlPosts',
  interfaceName: 'NewsletterPostsBlock',
  labels: { singular: 'Featured posts', plural: 'Featured posts' },
  fields: [
    { name: 'heading', type: 'text', admin: { description: 'Optional section heading.' } },
    {
      name: 'posts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      required: true,
      maxRows: 4,
      admin: { description: 'Rendered with each post’s SEO image and description.' },
    },
  ],
}

export const NewsletterDivider: Block = {
  slug: 'nlDivider',
  interfaceName: 'NewsletterDividerBlock',
  labels: { singular: 'Divider', plural: 'Dividers' },
  fields: [],
}

export const newsletterBlocks: Block[] = [
  NewsletterText,
  NewsletterImage,
  NewsletterButton,
  NewsletterPosts,
  NewsletterDivider,
]
