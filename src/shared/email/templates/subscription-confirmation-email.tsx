import { EMAIL_BRAND, EMAIL_PREVIEW } from '../config/brand'
import { type EmailBrandProps, EmailParagraph, TransactionalEmail } from '../ui/transactional-email'

export interface SubscriptionConfirmationEmailProps extends EmailBrandProps {
  /** Absolute URL the "Manage plan" button links to. */
  manageUrl: string
  /** Client's first name. */
  userName: string
  /** Plan / retainer name, e.g. "Studio Retainer". */
  planName: string
  /** Formatted price, e.g. "$2,500". */
  planPrice: string
  /** Billing cycle noun, e.g. "month". */
  cycleLabel: string
  /** Human-readable next charge date. */
  nextBillingDate: string
  /** Inbox preview line. */
  previewText?: string
}

export const SubscriptionConfirmationEmail = ({
  manageUrl,
  userName,
  planName,
  planPrice,
  cycleLabel,
  nextBillingDate,
  previewText,
  companyName,
  tagline = EMAIL_BRAND.tagline,
  ...brand
}: SubscriptionConfirmationEmailProps) => (
  <TransactionalEmail
    {...brand}
    companyName={companyName}
    tagline={tagline}
    previewText={previewText ?? `Your ${companyName} ${planName} is active`}
    heading="Your retainer is active"
    action={{ label: 'Manage plan', href: manageUrl }}
    disclaimer={
      <>
        Questions about billing or scope?
        <br />
        Reply to this email—the studio is happy to help.
      </>
    }
  >
    <EmailParagraph>
      Hi {userName},
      <br />
      <br />
      Thanks for partnering with {companyName}. Your {planName} is active—the studio is now on call
      for design, development, and ongoing support.
    </EmailParagraph>
    <EmailParagraph>
      You&apos;re billed {planPrice} per {cycleLabel}. Your next invoice is on {nextBillingDate}.
      You can update payment details or pause anytime from your account.
    </EmailParagraph>
  </TransactionalEmail>
)

SubscriptionConfirmationEmail.PreviewProps = {
  companyName: EMAIL_BRAND.companyName,
  manageUrl: 'https://example.com/account/billing',
  userName: 'Alex',
  planName: 'Studio Retainer',
  planPrice: '$2,500',
  cycleLabel: 'month',
  nextBillingDate: 'July 22, 2026',
  ...EMAIL_PREVIEW,
} satisfies SubscriptionConfirmationEmailProps

export default SubscriptionConfirmationEmail
