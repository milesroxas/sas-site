import { revalidateTag } from 'next/cache.js'
import type { GlobalAfterChangeHook, GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { linkGroup } from '@/fields/linkGroup'

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
    group: 'Website: Globals',
    description:
      'Company identity used for structured data (JSON-LD), llms.txt, and default page metadata.',
  },
  access: {
    read: () => true,
    update: authenticated,
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
      // The two promises the contact page makes and the confirmation email
      // repeats. They live here rather than on the block so the studio states
      // them once — every contact template and the receipt email read these.
      name: 'inquiries',
      type: 'group',
      label: 'Inquiries',
      admin: { description: 'Defaults for the contact templates and the confirmation email.' },
      fields: [
        {
          name: 'responseTime',
          type: 'text',
          defaultValue: 'within 2 business days',
          admin: {
            description:
              'Completes the sentence "you will hear back ___". Shown on the contact page and in the confirmation email.',
          },
        },
        {
          name: 'scheduleUrl',
          type: 'text',
          admin: {
            description:
              'Booking link behind "Schedule a call". Leave empty to hide that action everywhere.',
          },
        },
      ],
    },
    {
      // Site-wide switch for the Ask feature. It lives here, not on Header or
      // Footer, because Ask surfaces in both plus its own page and endpoint;
      // every surface reads this one flag (src/features/ask/README.md).
      name: 'ask',
      type: 'group',
      label: 'Ask',
      admin: { description: 'The grounded Q&A composer in the menu and the closing band.' },
      fields: [
        {
          name: 'hidden',
          type: 'checkbox',
          defaultValue: false,
          label: 'Hide Ask',
          admin: {
            description:
              'Turn on to remove Ask from the site: the composer leaves the menu and the closing band, and /ask returns not found. The closing band shows the address panel from Footer › Closing instead.',
          },
        },
        {
          // Action panel, no stored value. Rebuilds the embedding index that
          // Ask answers from (src/features/ask/README.md, "Keeping the index
          // in sync").
          name: 'rebuildIndex',
          type: 'ui',
          admin: {
            components: { Field: '@/features/ask/admin/RebuildIndexPanel#RebuildIndexPanel' },
          },
        },
        {
          // Read-only panel, no stored value. OpenAI spend and tokens for the
          // answer and embedding models (src/features/ask/usage.ts).
          name: 'usage',
          type: 'ui',
          admin: {
            components: { Field: '@/features/ask/admin/UsagePanel#UsagePanel' },
          },
        },
      ],
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Used as the Organization logo in structured data.' },
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Default preview image',
      admin: {
        description:
          'Used for search and social share cards when a page has no SEO or Open Graph image. Landscape, at least 1200×630px.',
      },
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
    // Small print at the foot of the closing band. It lives here rather than
    // on the Footer global because these are company facts, not band copy:
    // one record for every surface that has to state them, and no page-level
    // override, because the terms a visitor agreed to cannot differ per page.
    linkGroup({
      appearances: false,
      overrides: {
        name: 'legalLinks',
        label: 'Legal links',
        maxRows: 3,
        admin: {
          description:
            'Small print row under the closing band, e.g. Privacy Policy and Terms and Conditions. Up to three; the row owns their look, so only the destination and the label are set here. Cookie settings is not one of these, it has its own field below.',
          initCollapsed: true,
        },
      },
    }),
    {
      // A control, not a link: it reopens the consent preferences in place, so
      // there is no destination to set and no way to point it somewhere wrong.
      // Only the wording is an editorial choice.
      name: 'cookieSettingsLabel',
      type: 'text',
      label: 'Cookie settings label',
      defaultValue: 'Cookie Settings',
      admin: {
        description:
          'Closes the legal row with a button that reopens the cookie preferences. Leave empty to drop it from the row.',
      },
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
