/**
 * Newsletter template registry (FSD: **shared**).
 *
 * Single source of truth for the layouts the team can pick in the admin panel. Each entry
 * carries both the select label and the content-area styling, so adding a template here is the
 * whole job — it surfaces in the CMS and renders differently with no further wiring. Every
 * template renders the same content blocks inside the shared brand chrome.
 */
export const NEWSLETTER_TEMPLATES = {
  letter: {
    label: 'Letter — flat, left-aligned editorial layout',
    contentClassName: 'px-4 py-8 text-left',
  },
  announcement: {
    label: 'Announcement — content inside a centered card, like our transactional emails',
    contentClassName: 'email-card bg-bg-2 rounded-[8px] px-[40px] py-[48px] text-left',
  },
} as const

export type NewsletterTemplateKey = keyof typeof NEWSLETTER_TEMPLATES

export const newsletterTemplateOptions = (
  Object.keys(NEWSLETTER_TEMPLATES) as NewsletterTemplateKey[]
).map((value) => ({ label: NEWSLETTER_TEMPLATES[value].label, value }))

export const DEFAULT_NEWSLETTER_TEMPLATE: NewsletterTemplateKey = 'letter'
