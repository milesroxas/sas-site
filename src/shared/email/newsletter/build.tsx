import type { ReactElement } from 'react'
import type { Newsletter } from '@/payload-types'
import { EMAIL_BRAND } from '../config/brand'
import { brandDefaults } from '../lib/brand-defaults'
import { NewsletterBlocks } from './blocks'
import { NewsletterEmail } from './newsletter-email'
import {
  DEFAULT_NEWSLETTER_TEMPLATE,
  NEWSLETTER_TEMPLATES,
  type NewsletterTemplateKey,
} from './registry'

/**
 * Sentinel substituted per-recipient at send time. The send job renders the newsletter ONCE with
 * this placeholder, then string-replaces it with each recipient's token — rendering per recipient
 * would be O(recipients) React renders for identical output.
 */
export const UNSUBSCRIBE_TOKEN_PLACEHOLDER = 'UNSUBSCRIBE-TOKEN-PLACEHOLDER'

/** Human-facing unsubscribe page (footer link target — shows a button, never mutates on GET). */
export function newsletterUnsubscribePageUrl(baseUrl: string, token: string): string {
  return `${baseUrl}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`
}

/** RFC 8058 one-click endpoint used in the `List-Unsubscribe` header (POST target). */
export function newsletterOneClickUnsubscribeUrl(baseUrl: string, token: string): string {
  return `${baseUrl}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`
}

export interface BuildNewsletterEmailArgs {
  /** Newsletter document fetched with `depth: 2` so media and posts are populated. */
  newsletter: Newsletter
  /** Public origin for media URLs, internal links and unsubscribe URLs. */
  baseUrl: string
  /** Recipient unsubscribe token — pass `UNSUBSCRIBE_TOKEN_PLACEHOLDER` for batch renders. */
  unsubscribeToken: string
}

/**
 * The one place a newsletter document becomes a React Email element — the admin live preview,
 * "send test" and the send job all call this, so what the team previews is what recipients get.
 */
export function buildNewsletterEmail({
  newsletter,
  baseUrl,
  unsubscribeToken,
}: BuildNewsletterEmailArgs): ReactElement {
  const variant: NewsletterTemplateKey =
    newsletter.template && newsletter.template in NEWSLETTER_TEMPLATES
      ? (newsletter.template as NewsletterTemplateKey)
      : DEFAULT_NEWSLETTER_TEMPLATE

  return (
    <NewsletterEmail
      variant={variant}
      previewText={newsletter.previewText || newsletter.subject}
      heading={newsletter.heading || undefined}
      unsubscribeUrl={newsletterUnsubscribePageUrl(baseUrl, unsubscribeToken)}
      tagline={EMAIL_BRAND.tagline}
      addressLines={[...EMAIL_BRAND.addressLines]}
      {...brandDefaults({})}
    >
      <NewsletterBlocks blocks={newsletter.content} baseUrl={baseUrl} />
    </NewsletterEmail>
  )
}
