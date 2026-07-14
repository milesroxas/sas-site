import type { ReactNode } from 'react'
import {
  Body,
  Column,
  Container,
  Head,
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

/** Brand chrome shared by every email (header + footer). */
export interface EmailBrandProps {
  /** Brand / product name shown in the header and footer. */
  companyName: string
  /** Absolute URL of the square PNG logomark shown on the header's left. Its baked-in navy tile works on light and dark surfaces, so no dark variant exists. */
  logomarkUrl?: string
  /** Absolute URL of a PNG wordmark for light surfaces, shown on the header's right. Falls back to a text wordmark (email clients don't render SVG/WEBP). */
  logoUrl?: string
  /** Absolute URL of a PNG wordmark for dark mode (white wordmark). Shown via `prefers-color-scheme: dark`. */
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

/**
 * Outermost email document — Tailwind config, dark-mode + font setup, body surface and the
 * 640px brand panel. Owned here so transactional and newsletter emails can never drift apart
 * in their shared chrome.
 */
export function EmailShell({
  previewText,
  centered = false,
  children,
}: {
  /** Inbox preview line. */
  previewText: string
  /** Center-aligns body text (the transactional card layout); newsletters read left-aligned. */
  centered?: boolean
  children: ReactNode
}) {
  return (
    <Tailwind config={emailTailwindConfig}>
      <Html>
        <Head>
          <EmailColorScheme />
          <EmailFonts />
        </Head>

        <Body className={`email-body bg-bg-2 m-0 font-sans${centered ? ' text-center' : ''}`}>
          <Preview>{previewText}</Preview>
          <Container className="mx-auto mt-8 w-full max-w-[640px]">
            <Section className="email-panel bg-bg px-6 py-4">{children}</Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  )
}

/** Wordmark display size — source is 352×28. */
const LOGO = { width: 140, height: 11 } as const

/** Logomark display size — source is a 128×128 render of the square tile. */
const LOGOMARK = { width: 32, height: 32 } as const

type EmailHeaderProps = Pick<
  EmailBrandProps,
  'companyName' | 'logomarkUrl' | 'logoUrl' | 'logoDarkUrl'
>

/** Branded header row: logomark tile left, wordmark (light/dark pair) right. */
export function EmailHeader({ companyName, logomarkUrl, logoUrl, logoDarkUrl }: EmailHeaderProps) {
  return (
    <Section className="mb-3 px-6">
      <Row>
        {logomarkUrl ? (
          // Square tile with its own background; decorative (the wordmark carries the name).
          <Column className="py-[7px] align-middle">
            <Img
              src={logomarkUrl}
              alt=""
              width={LOGOMARK.width}
              height={LOGOMARK.height}
              className="block"
            />
          </Column>
        ) : null}
        <Column
          align={logomarkUrl ? 'right' : undefined}
          className={`py-[7px] align-middle ${logomarkUrl ? 'text-right' : 'text-left'}`}
        >
          {logoUrl ? (
            // Wordmark (source 352×28); a duplicate company-name label is omitted. Both
            // variants render inline-block so the cell's right-alignment applies; the dark
            // one is hidden by default and revealed by the dark-mode media query.
            <>
              <Img
                src={logoUrl}
                alt={companyName}
                width={LOGO.width}
                height={LOGO.height}
                className="email-logo-light"
                style={{ display: 'inline-block' }}
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
            <Text className="email-fg text-16 text-fg m-0 font-sans font-semibold">
              {companyName}
            </Text>
          )}
        </Column>
      </Row>
    </Section>
  )
}

type EmailFooterProps = Pick<
  EmailBrandProps,
  'companyName' | 'tagline' | 'socialLinks' | 'addressLines' | 'unsubscribeUrl'
> & {
  /** One-line consent reminder shown above the unsubscribe line (why the recipient got this). */
  receivingReason?: string
}

/** Branded footer: tagline, social links, postal address and unsubscribe line. */
export function EmailFooter({
  companyName,
  tagline,
  socialLinks,
  addressLines,
  unsubscribeUrl,
  receivingReason,
}: EmailFooterProps) {
  return (
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

          {receivingReason ? (
            <Text className="email-fg-3 text-11 text-fg-3 mt-0 mb-1 text-center font-sans">
              {receivingReason}
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
  )
}
