import { EMAIL_BRAND } from '../config/brand'

/**
 * From-address for newsletter sends (test sends included, so tests match the real thing).
 * `NEWSLETTER_FROM_*` lets marketing mail move to its own subdomain (protects the transactional
 * domain's reputation) without touching the transactional defaults.
 */
export function newsletterFromAddress(): string {
  const address = process.env.NEWSLETTER_FROM_ADDRESS ?? process.env.RESEND_FROM_ADDRESS
  if (!address) {
    throw new Error('Set NEWSLETTER_FROM_ADDRESS or RESEND_FROM_ADDRESS to send newsletters')
  }
  const name =
    process.env.NEWSLETTER_FROM_NAME ?? process.env.RESEND_FROM_NAME ?? EMAIL_BRAND.companyName
  return `${name} <${address}>`
}
