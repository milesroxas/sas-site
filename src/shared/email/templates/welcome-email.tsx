import { EMAIL_BRAND, EMAIL_PREVIEW } from '../config/brand'
import { type EmailBrandProps, EmailParagraph, TransactionalEmail } from '../ui/transactional-email'

export interface WelcomeEmailProps extends EmailBrandProps {
  /** Absolute URL the "Open workspace" button links to. */
  workspaceUrl: string
  /** Inbox preview line. */
  previewText?: string
}

/**
 * Single-card welcome built on the shared shell. The `01-Barebone` welcome's image-heavy marketing
 * blocks (hero, feature grid) are intentionally omitted — they require hosted brand imagery; add a
 * dedicated marketing shell when those assets exist.
 */
export const WelcomeEmail = ({
  workspaceUrl,
  previewText,
  companyName,
  tagline = EMAIL_BRAND.tagline,
  ...brand
}: WelcomeEmailProps) => (
  <TransactionalEmail
    {...brand}
    companyName={companyName}
    tagline={tagline}
    previewText={previewText ?? `Welcome aboard — ${companyName}`}
    eyebrow="Welcome to the studio"
    heading={`Welcome to ${companyName}`}
    action={{ label: 'Open workspace', href: workspaceUrl }}
  >
    <EmailParagraph>
      You&apos;re all set. Head to your workspace to follow project progress, review deliverables,
      and message the studio team whenever you need.
    </EmailParagraph>
  </TransactionalEmail>
)

WelcomeEmail.PreviewProps = {
  companyName: EMAIL_BRAND.companyName,
  workspaceUrl: 'https://example.com/workspace',
  ...EMAIL_PREVIEW,
} satisfies WelcomeEmailProps

export default WelcomeEmail
