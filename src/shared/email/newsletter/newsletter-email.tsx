import type { ReactNode } from 'react'
import { Heading, Section } from 'react-email'
import { type EmailBrandProps, EmailFooter, EmailHeader, EmailShell } from '../ui/email-chrome'
import { NEWSLETTER_TEMPLATES, type NewsletterTemplateKey } from './registry'

export interface NewsletterEmailProps extends EmailBrandProps {
  /** Which registered layout to render (see `registry.ts`). */
  variant: NewsletterTemplateKey
  /** Inbox preview line. */
  previewText: string
  /** Optional headline rendered above the content as the single `h1`. */
  heading?: string
  /** Per-recipient unsubscribe URL — required for marketing email (CAN-SPAM / GDPR). */
  unsubscribeUrl: string
  /** Content blocks. */
  children: ReactNode
}

/**
 * Newsletter shell (FSD: **shared**). Same brand chrome as `TransactionalEmail` (`EmailShell`,
 * header, footer, dark-mode hooks) with a left-aligned, long-form content column whose styling
 * comes from the template registry.
 */
export const NewsletterEmail = ({
  variant,
  previewText,
  heading,
  unsubscribeUrl,
  companyName,
  logomarkUrl,
  logoUrl,
  logoDarkUrl,
  tagline,
  socialLinks,
  addressLines,
  children,
}: NewsletterEmailProps) => (
  <EmailShell previewText={previewText}>
    <EmailHeader
      companyName={companyName}
      logomarkUrl={logomarkUrl}
      logoUrl={logoUrl}
      logoDarkUrl={logoDarkUrl}
    />

    <Section className={NEWSLETTER_TEMPLATES[variant].contentClassName}>
      {heading ? (
        <Heading as="h1" className="email-fg text-28 text-fg mt-0 mb-6 text-left font-sans">
          {heading}
        </Heading>
      ) : null}
      {children}
    </Section>

    <EmailFooter
      companyName={companyName}
      tagline={tagline}
      socialLinks={socialLinks}
      addressLines={addressLines}
      unsubscribeUrl={unsubscribeUrl}
      receivingReason={`You're receiving this because you subscribed to ${companyName} updates.`}
    />
  </EmailShell>
)
