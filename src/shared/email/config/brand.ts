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
} as const

/**
 * Sample chrome used only by template `PreviewProps`. At send time the caller supplies real values
 * — `logoUrl` defaults to the hosted `/email/logo.png`, and the footer hides any field omitted.
 * The preview `logoUrl` points at the copy served by the `email dev` server from `static/`.
 */
export const EMAIL_PREVIEW = {
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
