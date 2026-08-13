import type { ScrollRevealVariant } from '@/shared/ui/scroll-reveal'

/**
 * Which shared GSAP reveal each `data-reveal`-marked block plays, stated once
 * so every renderer (Pages/Home, work, lab) animates the same CMS block
 * identically. Blocks absent from this map carry no markers and take the CSS
 * block reveal (`shared/ui/reveal-section`) from their renderer instead.
 *
 * `'self'` blocks mount their own `ScrollReveal` shell — renderers must never
 * wrap them in a second entrance.
 */
export const blockRevealVariants = {
  audienceTabs: 'underMedia',
  dynamicAudience: 'underMedia',
  featureHeadingOffset: 'intro',
  featureStatementGrid: 'intro',
  featureTabs: 'intro',
  featureImageStatement: 'underMedia',
  splitContentNarrow: 'underMedia',
  fullMedia: 'underMedia',
  featureStatementLinks: 'self',
  // Pinned ScrollTrigger shell (sticky viewport + scrubbed list) — a CSS
  // reveal wrapper would put transform/opacity on its ancestor and break the
  // pin measurement.
  homeFeaturedWork: 'self',
  // Full-viewport shell owning its fullscreen enter threshold.
  industryWork: 'self',
} as const satisfies Record<string, ScrollRevealVariant | 'self'>

export type RevealMappedBlockSlug = keyof typeof blockRevealVariants
