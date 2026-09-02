import { EMAIL_BRAND, EMAIL_PREVIEW } from '../config/brand'
import { type EmailBrandProps, EmailParagraph, TransactionalEmail } from '../ui/transactional-email'

export interface InquiryReceivedEmailProps extends EmailBrandProps {
  /** First name, so the confirmation reads as a person answering. */
  senderName: string
  /** Short handle to quote if they follow up, e.g. "SS-K4T9". */
  reference: string
  /** Plain-language promise, e.g. "within 2 business days". */
  responseTime: string
  /** Optional booking link, matching the "rather talk it through" path on the page. */
  scheduleUrl?: string
  previewText?: string
}

/**
 * Receipt sent to whoever filled in the form. Deliberately short: it confirms
 * arrival, names when they will hear back, and gives them a reference — the
 * three things the page already promised.
 */
export const InquiryReceivedEmail = ({
  senderName,
  reference,
  responseTime,
  scheduleUrl,
  previewText,
  companyName,
  tagline = EMAIL_BRAND.tagline,
  ...brand
}: InquiryReceivedEmailProps) => (
  <TransactionalEmail
    {...brand}
    companyName={companyName}
    tagline={tagline}
    previewText={previewText ?? `We have your note — ${reference}`}
    eyebrow={reference}
    heading="Thanks, it's in."
    {...(scheduleUrl ? { action: { label: 'Schedule a call', href: scheduleUrl } } : {})}
    disclaimer={
      <>Quote {reference} if you need to follow up. Replying to this email reaches us too.</>
    }
  >
    <EmailParagraph>
      {senderName}, a partner is reading your note. You&apos;ll hear back {responseTime}.
    </EmailParagraph>
    <EmailParagraph>
      No sales sequence and no newsletter — just an answer on fit, scope, and rough range.
    </EmailParagraph>
  </TransactionalEmail>
)

InquiryReceivedEmail.PreviewProps = {
  companyName: EMAIL_BRAND.companyName,
  senderName: 'Maya',
  reference: 'SS-K4T9',
  responseTime: 'within 2 business days',
  scheduleUrl: 'https://example.com/schedule',
  ...EMAIL_PREVIEW,
} satisfies InquiryReceivedEmailProps

export default InquiryReceivedEmail
