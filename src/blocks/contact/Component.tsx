import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Section } from '@/blocks/shared/section'
import type { Capability, ContactBlock as ContactBlockProps } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { ContactFormClient, type ContactFormContent, type ContactOption } from './Component.client'

/** Ceiling on the capability list when the block offers "everything". */
const CAPABILITY_LIMIT = 24

const isCapability = (value: unknown): value is Capability =>
  typeof value === 'object' && value !== null && 'name' in value

/**
 * Which capabilities the form offers. An explicit selection wins; otherwise
 * the whole vocabulary in its editorial order, so adding a capability to the
 * taxonomy adds it to the form without anyone touching this page.
 */
async function resolveCapabilityOptions(
  selected: ContactBlockProps['capabilities'],
): Promise<ContactOption[]> {
  const chosen = selected?.options
  if (Array.isArray(chosen) && chosen.length > 0) {
    return chosen
      .filter(isCapability)
      .map((capability) => ({ label: capability.name, value: String(capability.id) }))
  }

  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'capabilities',
    limit: CAPABILITY_LIMIT,
    depth: 0,
    sort: '_order',
    select: { name: true },
  })

  return docs.map((capability) => ({ label: capability.name, value: String(capability.id) }))
}

const options = (rows: { label?: string | null; value?: string | null }[] | null | undefined) =>
  (rows ?? [])
    .filter((row): row is { label: string; value: string } => Boolean(row.label && row.value))
    .map((row) => ({ label: row.label, value: row.value }))

/**
 * The contact band: an editorial column stating what happens next, and the
 * form itself.
 *
 * Resolving happens here so the client gets flat, already-decided content: the
 * capability chips, and the two promises (response time, booking link) that
 * live once in Site Info and are repeated by the page, the receipt, and the
 * confirmation email.
 */
export const ContactBlockComponent: React.FC<ContactBlockProps> = async (props) => {
  // Independent reads: the capability list never depends on Site Info, so
  // awaiting them in sequence would just add a round trip to first paint.
  const [siteInfo, capabilityOptions] = await Promise.all([
    getCachedGlobal('site-info', 0)(),
    resolveCapabilityOptions(props.capabilities),
  ])

  const content: ContactFormContent = {
    variant: props.variant,
    eyebrow: props.eyebrow,
    heading: props.heading,
    lead: props.lead,
    details: (props.details ?? [])
      .filter((row) => row.term && row.value)
      .map((row) => ({ term: row.term, value: row.value })),
    nextStepsTitle: props.nextStepsTitle,
    nextSteps: (props.nextSteps ?? []).map((step) => step.text).filter(Boolean),
    altCta: props.altCta?.enabled
      ? {
          body: props.altCta.body,
          label: props.altCta.label,
          // The block may override the studio-wide booking link, but never has to.
          url: props.altCta.url || siteInfo?.inquiries?.scheduleUrl,
        }
      : null,
    nameLabel: props.nameLabel,
    emailLabel: props.emailLabel,
    companyLabel: props.companyLabel,
    websiteLabel: props.websiteLabel,
    capabilities: props.capabilities
      ? {
          label: props.capabilities.label,
          hint: props.capabilities.hint,
          options: capabilityOptions,
          unsureLabel: props.capabilities.unsureLabel,
        }
      : null,
    budgetLabel: props.budgetLabel,
    budgetHint: props.budgetHint,
    budgetOptions: options(props.budgetOptions),
    timelineLabel: props.timelineLabel,
    timelineOptions: options(props.timelineOptions),
    messageLabel: props.message?.label ?? 'The brief',
    messagePlaceholder: props.message?.placeholder,
    messageHelper: props.message?.helper,
    submitLabel: props.submitLabel,
    submitNote: props.submitNote,
    sentEyebrow: props.sentEyebrow,
    sentHeading: props.sentHeading,
    sentBody: props.sentBody,
    sentReferenceLabel: props.sentReferenceLabel ?? 'Reference',
    sentSentLabel: props.sentSentLabel ?? 'Sent',
    sentCopyLabel: props.sentCopyLabel ?? 'Copy to',
    sentSummaryTitle: props.sentSummaryTitle ?? 'What you sent',
    sentEditLabel: props.sentEditLabel ?? 'Edit and resend',
    sentScopeLabel: props.sentScopeLabel,
    sentBudgetLabel: props.sentBudgetLabel,
    sentTimelineLabel: props.sentTimelineLabel,
    sentBriefLabel: props.sentBriefLabel,
    sentAltBody: props.sentAltBody,
    responseTime: siteInfo?.inquiries?.responseTime ?? 'shortly',
  }

  return (
    <Section theme={props.theme}>
      <ContactFormClient content={content} />
    </Section>
  )
}
