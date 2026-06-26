import { EMAIL_BRAND, EMAIL_PREVIEW } from '../config/brand'
import { type EmailBrandProps, EmailParagraph, TransactionalEmail } from '../ui/transactional-email'

export interface PasswordResetEmailProps extends EmailBrandProps {
  /** Absolute URL the "Change password" button links to. */
  resetUrl: string
  /** Inbox preview line. */
  previewText?: string
}

export const PasswordResetEmail = ({
  resetUrl,
  previewText = 'Reset your password',
  companyName,
  tagline = EMAIL_BRAND.tagline,
  ...brand
}: PasswordResetEmailProps) => (
  <TransactionalEmail
    {...brand}
    companyName={companyName}
    tagline={tagline}
    previewText={previewText}
    heading="Reset your password"
    action={{ label: 'Change password', href: resetUrl }}
    disclaimer={
      <>
        If you didn&apos;t request this, please ignore this email. Your password won&apos;t change
        until you access the link above and create a new one.
      </>
    }
  >
    <EmailParagraph>
      Someone asked to reset the password for your {companyName} account. Set a new one through the
      link below.
    </EmailParagraph>
  </TransactionalEmail>
)

PasswordResetEmail.PreviewProps = {
  companyName: EMAIL_BRAND.companyName,
  resetUrl: 'https://example.com/reset-password?token=preview-token',
  ...EMAIL_PREVIEW,
} satisfies PasswordResetEmailProps

export default PasswordResetEmail
