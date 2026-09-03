/**
 * Bootstraps the contact surface: the "Project inquiry" form, asked in three
 * steps, and the contact page that renders it at /contact.
 *
 * Idempotent — it matches on slug and title, so running it twice updates
 * rather than duplicates. Written as a script because the same two documents
 * have to exist in every environment, and clicking them together by hand is
 * both slow and easy to get subtly wrong (a missing `mapsTo` silently drops an
 * answer on its way to the inbox).
 *
 *   npx tsx --env-file=.env scripts/seed-contact-page.ts
 */
import config from '@payload-config'
import { getPayload } from 'payload'
import { CONTACT_INDEX_SLUG } from '@/collections/ContactPages/constants'
import {
  PROJECT_INQUIRY_FIELDS,
  PROJECT_INQUIRY_FORM_TITLE,
  PROJECT_INQUIRY_STEPS,
} from '@/collections/ContactPages/inquiryForm'
import { INQUIRY_MESSAGE_MAX_LENGTH } from '@/shared/content/inquiry'

/**
 * Minimal Lexical state for the form's own confirmation message. The contact
 * template never shows it — it renders its own receipt — but the form-builder
 * requires one, and it is what a visitor would see if this form were composed
 * onto an ordinary page through the Form block.
 */
const confirmationMessage = {
  root: {
    type: 'root',
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
    children: [
      {
        type: 'paragraph',
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        version: 1,
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: "Thanks, it's in. A partner is reading it and you'll hear back shortly.",
            version: 1,
          },
        ],
      },
    ],
  },
}

const payload = await getPayload({ config })

const existingForm = await payload.find({
  collection: 'forms',
  where: { title: { equals: PROJECT_INQUIRY_FORM_TITLE } },
  limit: 1,
  depth: 0,
})

const formData = {
  title: PROJECT_INQUIRY_FORM_TITLE,
  delivery: 'inquiries' as const,
  inquiryType: 'project' as const,
  submitButtonLabel: 'Send inquiry',
  steps: PROJECT_INQUIRY_STEPS,
  confirmationType: 'message' as const,
  // biome-ignore lint/suspicious/noExplicitAny: the editor state type is wider than the seed needs
  confirmationMessage: confirmationMessage as any,
  // biome-ignore lint/suspicious/noExplicitAny: the plugin's field blocks are looser than the generated union
  fields: PROJECT_INQUIRY_FIELDS as any,
}

const form = existingForm.docs[0]
  ? await payload.update({ collection: 'forms', id: existingForm.docs[0].id, data: formData })
  : await payload.create({ collection: 'forms', data: formData })

console.log(`form ${form.id} "${form.title}" — delivery: ${form.delivery}`)
console.log(`  brief cap: ${INQUIRY_MESSAGE_MAX_LENGTH} characters`)

const existingPage = await payload.find({
  collection: 'contact-pages',
  where: { slug: { equals: CONTACT_INDEX_SLUG } },
  limit: 1,
  depth: 0,
})

// The rest of the copy comes from the collection's own defaults; only the
// required slots are stated here, so editing them in the admin sticks.
const pageData = {
  title: 'Contact',
  slug: CONTACT_INDEX_SLUG,
  form: form.id,
  heading: 'Got a project in mind?',
  sentHeading: "Thanks, it's in.",
  _status: 'published' as const,
}

// No Next request here, so the revalidation hooks would throw — the page
// rebuilds on its next visit anyway.
const context = { disableRevalidate: true }

const page = existingPage.docs[0]
  ? await payload.update({
      collection: 'contact-pages',
      id: existingPage.docs[0].id,
      data: pageData,
      context,
    })
  : await payload.create({
      collection: 'contact-pages',
      data: pageData,
      draft: false,
      context,
    })

console.log(`contact page ${page.id} "${page.slug}" — ${page._status} → /contact`)
process.exit(0)
