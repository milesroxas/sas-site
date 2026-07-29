import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import type { Field } from 'payload'

/** SEO tab fields shared by website page surfaces (Pages, Home, etc.). */
export const seoMetaTabFields: Field[] = [
  OverviewField({
    titlePath: 'meta.title',
    descriptionPath: 'meta.description',
    imagePath: 'meta.image',
  }),
  MetaTitleField({
    hasGenerateFn: true,
  }),
  MetaImageField({
    relationTo: 'media',
  }),
  MetaDescriptionField({}),
  PreviewField({
    hasGenerateFn: true,
    titlePath: 'meta.title',
    descriptionPath: 'meta.description',
  }),
]
