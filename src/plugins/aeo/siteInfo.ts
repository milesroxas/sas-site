import { revalidateTag } from 'next/cache.js'
import type { GlobalAfterChangeHook, GlobalConfig } from 'payload'

const revalidateSiteInfo: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating site info')

    revalidateTag('global_site-info', 'max')
    revalidateTag('llms-txt', 'max')
  }

  return doc
}

/**
 * Company identity consumed by JSON-LD (Organization/WebSite), llms.txt, and
 * default page metadata. Single editable source for facts that were previously
 * hardcoded across the codebase.
 */
export const SiteInfo: GlobalConfig = {
  slug: 'site-info',
  label: 'Site Info',
  admin: {
    group: 'Website',
    description:
      'Company identity used for structured data (JSON-LD), llms.txt, and default page metadata.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      defaultValue: 'Suits & Sandals',
    },
    {
      name: 'legalName',
      type: 'text',
      admin: { description: 'Registered legal name, if different from the brand name.' },
    },
    {
      name: 'tagline',
      type: 'text',
      defaultValue:
        'We help complex organizations make sense to the people who matter. Bringing clarity, trust, and momentum to nuanced ideas.',
      admin: {
        description: 'One-sentence positioning. Used as the llms.txt summary and OG description.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description:
          'Longer company summary for AI engines and structured data. Two to four sentences.',
      },
    },
    {
      name: 'foundingYear',
      type: 'number',
      min: 1900,
      max: 2100,
    },
    {
      name: 'contactEmail',
      type: 'email',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Used as the Organization logo in structured data.' },
    },
    {
      name: 'address',
      type: 'group',
      fields: [
        { name: 'streetAddress', type: 'text', defaultValue: '240 Kent Ave' },
        { name: 'city', type: 'text', defaultValue: 'Brooklyn' },
        { name: 'state', type: 'text', defaultValue: 'NY' },
        { name: 'postalCode', type: 'text', defaultValue: '11249' },
        { name: 'country', type: 'text', defaultValue: 'US' },
      ],
    },
    {
      name: 'socialProfiles',
      type: 'array',
      admin: {
        description:
          'Profile URLs for the sameAs entity anchor: LinkedIn, Instagram, X, Clutch, Crunchbase, GitHub, Google Business Profile. Keep name and description identical across these profiles.',
      },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
    {
      name: 'llmsNotes',
      type: 'textarea',
      admin: {
        description:
          'Optional extra paragraph appended to llms.txt (e.g. preferred citation form, what the agency is known for).',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateSiteInfo],
  },
}
