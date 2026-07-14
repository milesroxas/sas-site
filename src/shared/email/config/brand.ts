/**
 * Brand content shared across every email (FSD: **shared**).
 *
 * Single source of truth for Suits & Sandals copy so templates, preview data and send defaults
 * never drift. Override per-send by passing the matching props to a `send*` helper.
 */
export const EMAIL_BRAND = {
  companyName: 'Suits & Sandals',
  tagline:
    'We help complex organizations make sense to the people who matter. Bringing clarity, trust, and momentum to nuanced ideas.',
  /** Postal address shown in marketing email footers (CAN-SPAM requirement). */
  addressLines: ['Suits & Sandals', '240 Kent Ave, Brooklyn, NY 11249'],
} as const

/**
 * Sample chrome used only by template `PreviewProps`. At send time the caller supplies real values
 * — logo URLs default to the hosted `/email/*.png`, and the footer hides any field omitted.
 * The preview URLs point at the copies served by the `email dev` server from `static/`.
 */
export const EMAIL_PREVIEW = {
  logomarkUrl: '/static/logomark.png',
  logoUrl: '/static/logo.png',
  logoDarkUrl: '/static/logo-dark.png',
  socialLinks: [
    { label: 'Instagram', href: 'https://example.com/' },
    { label: 'LinkedIn', href: 'https://example.com/' },
    { label: 'Dribbble', href: 'https://example.com/' },
  ],
  addressLines: ['Suits & Sandals', '240 Kent Ave, Brooklyn, NY 11249'],
  unsubscribeUrl: 'https://example.com/unsubscribe',
}
