import { resolveFormFields } from '@/blocks/shared/form/resolve-form'
import { resolveCmsLinkHref } from '@/components/Link/resolve-href'
import type { ContactPage, Form as FormDoc } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { ContactTemplate, type ContactTemplateContent } from './ContactTemplate.client'

/**
 * Where "Schedule a call" goes. The studio-wide booking link from Site Info
 * unless the page opts out, in which case its own link field decides, on the
 * same URL scheme as every other CMS link.
 */
const resolveAltCtaLink = (
  altCta: NonNullable<ContactPage['altCta']>,
  siteScheduleUrl: string | null | undefined,
): Pick<NonNullable<ContactTemplateContent['altCta']>, 'href' | 'newTab'> => {
  if (altCta.useSiteLink !== false) return { href: siteScheduleUrl ?? null }
  const link = altCta.link
  return { href: link ? resolveCmsLinkHref(link) : null, newTab: link?.newTab }
}

/**
 * The contact page, resolved.
 *
 * Everything the browser needs is decided here: the form's fields with their
 * capability chips already named, and the response-time promise that lives
 * once in Site Info and is repeated by the page, the receipt, and the
 * confirmation email.
 */
export async function ContactPageTemplate({ page }: { page: ContactPage }) {
  const form = typeof page.form === 'object' && page.form !== null ? (page.form as FormDoc) : null
  if (!form) return null

  const [siteInfo, fields] = await Promise.all([
    getCachedGlobal('site-info', 0)(),
    resolveFormFields(form),
  ])

  const content: ContactTemplateContent = {
    eyebrow: page.eyebrow,
    heading: page.heading,
    lead: page.lead,
    details: (page.details ?? [])
      .filter((row) => row.term && row.value)
      .map((row) => ({ term: row.term, value: row.value })),
    nextStepsTitle: page.nextStepsTitle,
    nextSteps: (page.nextSteps ?? []).map((step) => step.text).filter(Boolean),
    altCta: page.altCta?.enabled
      ? {
          body: page.altCta.body,
          label: page.altCta.label,
          ...resolveAltCtaLink(page.altCta, siteInfo?.inquiries?.scheduleUrl),
        }
      : null,
    submitNote: page.submitNote,
    sentEyebrow: page.sentEyebrow,
    sentHeading: page.sentHeading,
    sentBody: page.sentBody,
    sentReferenceLabel: page.sentReferenceLabel ?? 'Reference',
    sentSentLabel: page.sentSentLabel ?? 'Sent',
    sentCopyLabel: page.sentCopyLabel ?? 'Copy to',
    sentSummaryTitle: page.sentSummaryTitle ?? 'What you sent',
    sentEditLabel: page.sentEditLabel ?? 'Edit and resend',
    sentAltBody: page.sentAltBody,
    responseTime: siteInfo?.inquiries?.responseTime ?? 'shortly',
  }

  return (
    <ContactTemplate
      content={content}
      delivery={form.delivery ?? 'submissions'}
      fields={fields}
      formId={form.id}
      inquiryType={form.inquiryType}
      steps={form.steps}
      submitLabel={form.submitButtonLabel ?? 'Send'}
    />
  )
}
