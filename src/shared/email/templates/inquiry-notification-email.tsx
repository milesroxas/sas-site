import { EMAIL_BRAND, EMAIL_PREVIEW } from '../config/brand'
import { type EmailBrandProps, EmailParagraph, TransactionalEmail } from '../ui/transactional-email'

export interface InquiryNotificationEmailProps extends EmailBrandProps {
  /** Absolute URL of the inquiry in the admin. */
  adminUrl: string
  /** Short handle the visitor also has, e.g. "SS-K4T9". */
  reference: string
  /** Who sent it. */
  senderName: string
  senderEmail: string
  company?: string
  /** Label lines summarising the structured answers, in reading order. */
  summary?: { label: string; value: string }[]
  /** The brief itself, trimmed for the inbox. */
  excerpt: string
  /** "Project inquiry" / "General message". */
  typeLabel: string
  previewText?: string
}

/**
 * Team notification for a new inquiry. Carries enough to triage from a phone —
 * who, what shape of work, and the first lines of the brief — so opening the
 * admin is a decision, not a prerequisite.
 */
export const InquiryNotificationEmail = ({
  adminUrl,
  reference,
  senderName,
  senderEmail,
  company,
  summary = [],
  excerpt,
  typeLabel,
  previewText,
  companyName,
  tagline = EMAIL_BRAND.tagline,
  ...brand
}: InquiryNotificationEmailProps) => (
  <TransactionalEmail
    {...brand}
    companyName={companyName}
    tagline={tagline}
    previewText={previewText ?? `${typeLabel} from ${senderName}${company ? ` at ${company}` : ''}`}
    eyebrow={`${typeLabel} · ${reference}`}
    heading={senderName}
    action={{ label: 'Open in the admin', href: adminUrl }}
    disclaimer={<>Reply to {senderEmail} directly, or open the inquiry to assign it to someone.</>}
  >
    <EmailParagraph>
      {senderEmail}
      {company ? (
        <>
          <br />
          {company}
        </>
      ) : null}
    </EmailParagraph>
    {summary.length > 0 ? (
      <EmailParagraph>
        {summary.map((row, index) => (
          <span key={row.label}>
            {index > 0 ? <br /> : null}
            {row.label}: {row.value}
          </span>
        ))}
      </EmailParagraph>
    ) : null}
    <EmailParagraph>{excerpt}</EmailParagraph>
  </TransactionalEmail>
)

InquiryNotificationEmail.PreviewProps = {
  companyName: EMAIL_BRAND.companyName,
  adminUrl: 'https://example.com/admin/collections/inquiries/1',
  reference: 'SS-K4T9',
  senderName: 'Maya Ellison',
  senderEmail: 'maya@northlight.co',
  company: 'Northlight Bio',
  typeLabel: 'Project inquiry',
  summary: [
    { label: 'Scope', value: 'Brand Expansion, Web Design' },
    { label: 'Budget', value: '50–100K' },
    { label: 'Timeline', value: '1–3 months' },
  ],
  excerpt:
    "We're launching a second product line in Q1 and the current site can't carry it. Need positioning that covers both, then a site that ships with the launch.",
  ...EMAIL_PREVIEW,
} satisfies InquiryNotificationEmailProps

export default InquiryNotificationEmail
