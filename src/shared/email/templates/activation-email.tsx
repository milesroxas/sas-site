import { EMAIL_BRAND, EMAIL_PREVIEW } from '../config/brand'
import { type EmailBrandProps, EmailParagraph, TransactionalEmail } from '../ui/transactional-email'

export interface ActivationEmailProps extends EmailBrandProps {
  /** Absolute URL the "Confirm email" button links to. */
  confirmUrl: string
  /** Inbox preview line. */
  previewText?: string
}

export const ActivationEmail = ({
  confirmUrl,
  previewText = 'Confirm your email address',
  companyName,
  tagline = EMAIL_BRAND.tagline,
  ...brand
}: ActivationEmailProps) => (
  <TransactionalEmail
    {...brand}
    companyName={companyName}
    tagline={tagline}
    previewText={previewText}
    heading="We're almost there!"
    action={{ label: 'Confirm email', href: confirmUrl }}
    disclaimer={
      <>
        If you didn&apos;t request this,
        <br />
        please ignore this email.
      </>
    }
  >
    <EmailParagraph>
      Thanks for creating your {companyName} account. Confirm your email address to reach your
      project workspace and start collaborating with the studio.
    </EmailParagraph>
  </TransactionalEmail>
)

ActivationEmail.PreviewProps = {
  companyName: EMAIL_BRAND.companyName,
  confirmUrl: 'https://example.com/verify?token=preview-token',
  ...EMAIL_PREVIEW,
} satisfies ActivationEmailProps

export default ActivationEmail
