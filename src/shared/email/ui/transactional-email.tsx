import type { ReactNode } from 'react'
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from 'react-email'
import { EmailColorScheme } from '../config/dark-mode'
import { EmailFonts } from '../config/fonts'
import { emailTailwindConfig } from '../config/theme'

/** Brand chrome shared by every transactional email (header + footer). */
export interface EmailBrandProps {
  /** Brand / product name shown in the header and footer. */
  companyName: string
  /** Absolute URL of a PNG logo for light surfaces. Falls back to a text wordmark (email clients don't render SVG/WEBP). */
  logoUrl?: string
  /** Absolute URL of a PNG logo for dark mode (white wordmark). Shown via `prefers-color-scheme: dark`. */
  logoDarkUrl?: string
  /** Short brand tagline shown in the footer. */
  tagline?: string
  /** Footer social links rendered as text (image icons are avoided to prevent broken assets). */
  socialLinks?: { label: string; href: string }[]
  /** Postal address lines for the footer (CAN-SPAM). */
  addressLines?: string[]
  /** Unsubscribe URL. The footer unsubscribe line is hidden when omitted. */
  unsubscribeUrl?: string
}

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

/** Logo display size — wordmark source is 352×28. */
const LOGO = { width: 140, height: 11 } as const

/**
 * Shared transactional email shell (FSD: **shared/ui**), ported from React Email's `01-Barebone`.
 *
 * Owns the identical chrome — `Html`/`Head`/`Body`/`Container`, branded header, card frame and
 * footer — so each template only supplies its heading, body, CTA and disclaimer. The `email-*`
 * class hooks drive the dark-mode treatment in `EmailColorScheme`.
 */
export const TransactionalEmail = ({
  companyName,
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
  <Tailwind config={emailTailwindConfig}>
    <Html>
      <Head>
        <EmailColorScheme />
        <EmailFonts />
      </Head>

      <Body className="email-body bg-bg-2 m-0 text-center font-sans">
        <Preview>{previewText}</Preview>
        <Container className="mx-auto mt-8 w-full max-w-[640px]">
          <Section className="email-panel bg-bg px-6 py-4">
            <Section className="mb-3 px-6">
              <Row>
                <Column className="py-[7px] align-middle">
                  {logoUrl ? (
                    // Wordmark (source 352×28); a duplicate company-name label is omitted. The dark
                    // variant is hidden by default and revealed by the dark-mode media query.
                    <>
                      <Img
                        src={logoUrl}
                        alt={companyName}
                        width={LOGO.width}
                        height={LOGO.height}
                        className="email-logo-light block"
                      />
                      {logoDarkUrl ? (
                        <Img
                          src={logoDarkUrl}
                          alt={companyName}
                          width={LOGO.width}
                          height={LOGO.height}
                          className="email-logo-dark"
                          style={{ display: 'none' }}
                        />
                      ) : null}
                    </>
                  ) : (
                    <Text className="email-fg text-16 text-fg m-0 text-left font-sans font-semibold">
                      {companyName}
                    </Text>
                  )}
                </Column>
              </Row>
            </Section>

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

            <Section className="email-panel bg-bg">
              <Row>
                <Column className="px-6 py-10 text-center">
                  {tagline ? (
                    <Text className="email-fg-3 text-13 text-fg-3 mx-auto mt-0 mb-8 max-w-[280px] text-center font-sans">
                      {tagline}
                    </Text>
                  ) : null}

                  {socialLinks?.length ? (
                    <Section className="mb-8 text-center">
                      {socialLinks.map(({ label, href }) => (
                        <Link
                          key={href}
                          href={href}
                          className="email-fg-3 text-13 text-fg-3 inline-block px-2 align-middle font-sans"
                        >
                          {label}
                        </Link>
                      ))}
                    </Section>
                  ) : null}

                  {addressLines?.length ? (
                    <Text className="email-fg-3 text-11 text-fg-3 mt-4 mb-5 text-center font-sans">
                      {addressLines.map((line, i) => (
                        <span key={line}>
                          {i > 0 ? <br /> : null}
                          {line}
                        </span>
                      ))}
                    </Text>
                  ) : null}

                  {unsubscribeUrl ? (
                    <Text className="email-fg-3 text-11 text-fg-3 m-0 text-center font-sans">
                      <Link href={unsubscribeUrl} className="email-fg-3 text-fg-3">
                        Unsubscribe
                      </Link>{' '}
                      from {companyName} marketing emails.
                    </Text>
                  ) : null}
                </Column>
              </Row>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  </Tailwind>
)

/** Body copy for a card — shared paragraph styling so templates can stack one or many. */
export function EmailParagraph({ children }: { children: ReactNode }) {
  return (
    <Text className="email-fg-2 text-16 text-fg-2 mx-auto mt-0 mb-8 max-w-[380px] text-center font-sans">
      {children}
    </Text>
  )
}
