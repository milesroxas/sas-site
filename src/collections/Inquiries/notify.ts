import type { PayloadRequest } from 'payload'
import type { Capability, Inquiry, User } from '@/payload-types'
import {
  INQUIRY_BUDGETS,
  INQUIRY_TIMELINES,
  INQUIRY_TYPES,
  inquiryOptionLabel,
} from '@/shared/content/inquiry'
import { sendInquiryNotificationEmail, sendInquiryReceivedEmail } from '@/shared/email'
import { getServerSideURL } from '@/utilities/getURL'

/** How much of the brief travels in the notification before it is cut. */
const EXCERPT_MAX_LENGTH = 400

export const inquiryAdminUrl = (id: number | string) =>
  `${getServerSideURL()}/admin/collections/inquiries/${id}`

const excerpt = (message: string) =>
  message.length > EXCERPT_MAX_LENGTH
    ? `${message.slice(0, EXCERPT_MAX_LENGTH).trimEnd()}…`
    : message

const capabilityNames = (capabilities: Inquiry['capabilities']) =>
  (capabilities ?? [])
    .map((capability) => (typeof capability === 'object' ? (capability as Capability).name : null))
    .filter((name): name is string => Boolean(name))

/**
 * The structured answers, as label/value lines. Only what was actually
 * answered — an empty row in a notification is noise, not information.
 */
export const inquirySummary = (inquiry: Inquiry): { label: string; value: string }[] => {
  const rows: { label: string; value: string }[] = []
  const scope = capabilityNames(inquiry.capabilities)

  if (scope.length > 0 || inquiry.capabilitiesUnsure) {
    rows.push({
      label: 'Scope',
      value: inquiry.capabilitiesUnsure ? [...scope, 'Not sure yet'].join(', ') : scope.join(', '),
    })
  }

  const budget = inquiryOptionLabel(INQUIRY_BUDGETS, inquiry.budget)
  if (budget) rows.push({ label: 'Budget', value: budget })

  const timeline = inquiryOptionLabel(INQUIRY_TIMELINES, inquiry.timeline)
  if (timeline) rows.push({ label: 'Timeline', value: timeline })

  if (inquiry.website) rows.push({ label: 'Current site', value: inquiry.website })

  return rows
}

/**
 * Who hears about this inquiry: everyone who opted in for its type, plus its
 * owner if one is already set. Opt-in lives on the user (Users → Email
 * notifications), so adding a person to the rota is a checkbox, not a deploy.
 *
 * Returns an empty list when nobody has opted in; deciding what to do about
 * that belongs to the caller, which already has the site's fallback address.
 */
export async function inquiryRecipients(
  req: PayloadRequest,
  inquiry: Pick<Inquiry, 'type' | 'assignedTo'>,
): Promise<string[]> {
  const { docs } = await req.payload.find({
    collection: 'users',
    where: { 'notifications.inquiries': { equals: true } },
    limit: 100,
    depth: 0,
    select: { email: true, notifications: true },
    // Inside the create transaction: without `req` this read opens its own
    // connection and can block on rows the same transaction is writing.
    req,
  })

  const emails = new Set<string>()
  for (const user of docs as User[]) {
    const types = user.notifications?.inquiryTypes
    // No explicit selection means "everything" — the field defaults to both.
    if (!types || types.length === 0 || types.includes(inquiry.type)) {
      emails.add(user.email)
    }
  }

  const owner = inquiry.assignedTo
  if (owner && typeof owner === 'object' && owner.email) emails.add(owner.email)

  return [...emails]
}

/**
 * Fan out the two emails a new inquiry produces: the studio's notification and
 * the visitor's receipt.
 *
 * Everything that can overlap does. This runs on the visitor's own request, so
 * a serial chain of two reads and two sends is time they spend watching a
 * spinner: the reads go together, then both sends go together.
 *
 * Neither send is allowed to fail the request. The inquiry is committed by the
 * time this runs, and a Resend outage must not turn a captured lead into a 500
 * on the form.
 */
export async function deliverInquiryEmails(req: PayloadRequest, inquiry: Inquiry) {
  const { payload } = req
  const typeLabel = inquiryOptionLabel(INQUIRY_TYPES, inquiry.type) ?? 'Inquiry'

  const [siteInfo, subscribed] = await Promise.all([
    payload.findGlobal({ slug: 'site-info', depth: 0, req }).catch((err: unknown) => {
      payload.logger.error({ msg: 'Inquiry: site info unreadable, falling back to defaults', err })
      return null
    }),
    inquiryRecipients(req, inquiry),
  ])

  // Nobody ticked the box: the site contact address catches it rather than the
  // request landing silently. A studio missing a lead over an unticked
  // checkbox is the failure this guards against.
  let recipients = subscribed
  if (recipients.length === 0) {
    if (siteInfo?.contactEmail) {
      recipients = [siteInfo.contactEmail]
      payload.logger.warn(
        'No user is subscribed to inquiry notifications — falling back to the site contact email.',
      )
    } else {
      payload.logger.error(
        'An inquiry arrived with no notification recipients and no site contact email.',
      )
    }
  }

  const notifyTeam =
    recipients.length > 0
      ? sendInquiryNotificationEmail({
          payload,
          to: recipients,
          adminUrl: inquiryAdminUrl(inquiry.id),
          company: inquiry.company ?? undefined,
          excerpt: excerpt(inquiry.message),
          reference: inquiry.reference ?? '',
          senderEmail: inquiry.email,
          senderName: inquiry.name,
          summary: inquirySummary(inquiry),
          typeLabel,
        }).catch((err: unknown) => {
          payload.logger.error({
            msg: `Inquiry ${inquiry.reference}: team notification failed`,
            err,
          })
        })
      : Promise.resolve()

  const notifySender = sendInquiryReceivedEmail({
    payload,
    to: inquiry.email,
    reference: inquiry.reference ?? '',
    responseTime: siteInfo?.inquiries?.responseTime ?? 'within 2 business days',
    scheduleUrl: siteInfo?.inquiries?.scheduleUrl ?? undefined,
    // First name only: the receipt should read like a person replying.
    senderName: inquiry.name.split(' ')[0] ?? inquiry.name,
  }).catch((err: unknown) => {
    payload.logger.error({ msg: `Inquiry ${inquiry.reference}: receipt to sender failed`, err })
  })

  await Promise.all([notifyTeam, notifySender])
}
