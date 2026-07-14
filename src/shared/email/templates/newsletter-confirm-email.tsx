import { EMAIL_BRAND, EMAIL_PREVIEW } from '../config/brand'
import { type EmailBrandProps, EmailParagraph, TransactionalEmail } from '../ui/transactional-email'

export interface NewsletterConfirmEmailProps extends EmailBrandProps {
  /** Absolute URL the "Confirm subscription" button links to. */
  confirmUrl: string
  /** Inbox preview line. */
  previewText?: string
}

/** Double-opt-in confirmation sent when someone signs up for the newsletter. */
export const NewsletterConfirmEmail = ({
  confirmUrl,
  previewText = 'One click and you’re on the list',
  companyName,
  tagline = EMAIL_BRAND.tagline,
  ...brand
}: NewsletterConfirmEmailProps) => (
  <TransactionalEmail
    {...brand}
    companyName={companyName}
    tagline={tagline}
    previewText={previewText}
    heading="Confirm your subscription"
    action={{ label: 'Confirm subscription', href: confirmUrl }}
    disclaimer={
      <>
        If you didn&apos;t request this, ignore this email
        <br />
        and you won&apos;t be subscribed.
      </>
    }
  >
    <EmailParagraph>
      You asked to receive the {companyName} newsletter. Confirm your email address and we&apos;ll
      send you occasional notes on clarity, trust, and momentum — no noise.
    </EmailParagraph>
  </TransactionalEmail>
)

NewsletterConfirmEmail.PreviewProps = {
  companyName: EMAIL_BRAND.companyName,
  confirmUrl: 'https://example.com/api/newsletter/confirm?token=preview-token',
  ...EMAIL_PREVIEW,
} satisfies NewsletterConfirmEmailProps

export default NewsletterConfirmEmail
