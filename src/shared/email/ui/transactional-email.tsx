import type { ReactNode } from 'react'
import { Button, Heading, Section, Text } from 'react-email'
import { type EmailBrandProps, EmailFooter, EmailHeader, EmailShell } from './email-chrome'

export type { EmailBrandProps } from './email-chrome'

export interface TransactionalEmailProps extends EmailBrandProps {
  /** Inbox preview line. */
  previewText: string
  /** Small muted eyebrow shown above the heading. */
  eyebrow?: string
  /** Card heading (rendered as the single `h1`). */
  heading: string
  /** Primary call-to-action button. Omit for a button-less notice. */
  action?: { label: string; href: string }
  /** Fine-print shown under the button. */
  disclaimer?: ReactNode
  /** Body copy of the card. */
  children: ReactNode
}

/**
 * Shared transactional email shell (FSD: **shared/ui**), ported from React Email's `01-Barebone`.
 *
 * Composes the shared chrome — `EmailShell` document, branded header, card frame and footer
 * (see `email-chrome.tsx`) — so each template only supplies its heading, body, CTA and
 * disclaimer. The `email-*` class hooks drive the dark-mode treatment in `EmailColorScheme`.
 */
export const TransactionalEmail = ({
  companyName,
  logomarkUrl,
  logoUrl,
  logoDarkUrl,
  tagline,
  socialLinks,
  addressLines,
  unsubscribeUrl,
  previewText,
  eyebrow,
  heading,
  action,
  disclaimer,
  children,
}: TransactionalEmailProps) => (
  <EmailShell previewText={previewText} centered>
    <EmailHeader
      companyName={companyName}
      logomarkUrl={logomarkUrl}
      logoUrl={logoUrl}
      logoDarkUrl={logoDarkUrl}
    />

    <Section className="email-card bg-bg-2 rounded-[8px] px-[40px] py-[64px] text-center">
      <Section className="mb-3">
        {eyebrow ? (
          <Text className="email-fg-3 text-13 text-fg-3 mx-auto mt-0 mb-2 text-center font-sans">
            {eyebrow}
          </Text>
        ) : null}
        <Heading as="h1" className="email-fg text-28 text-fg m-0 font-sans">
          {heading}
        </Heading>
      </Section>

      {children}

      {action ? (
        <Section className="mb-6 text-center">
          <Button
            href={action.href}
            className="email-btn bg-fg text-16 text-fg-inverted box-border inline-block rounded-lg px-7 py-4 text-center font-sans leading-6"
          >
            {action.label}
          </Button>
        </Section>
      ) : null}

      {disclaimer ? (
        <Text className="email-fg-3 text-13 text-fg-3 mx-auto mt-8 mb-0 max-w-[400px] text-center font-sans">
          {disclaimer}
        </Text>
      ) : null}
    </Section>

    <EmailFooter
      companyName={companyName}
      tagline={tagline}
      socialLinks={socialLinks}
      addressLines={addressLines}
      unsubscribeUrl={unsubscribeUrl}
    />
  </EmailShell>
)

/** Body copy for a card — shared paragraph styling so templates can stack one or many. */
export function EmailParagraph({ children }: { children: ReactNode }) {
  return (
    <Text className="email-fg-2 text-16 text-fg-2 mx-auto mt-0 mb-8 max-w-[380px] text-center font-sans">
      {children}
    </Text>
  )
}
