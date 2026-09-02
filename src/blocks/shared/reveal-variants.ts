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
  // Bespoke shell (use-audience-tabs-motion.ts): phased entrance — heading →
  // tab buttons → list items → media wipe last — plus the scramble tab swap;
  // shared values imported from the reveals and scramble defaults.
  audienceTabs: 'self',
  dynamicAudience: 'underMedia',
  featureHeadingOffset: 'intro',
  featureStatementGrid: 'intro',
  featureTabs: 'intro',
  featureImageStatement: 'underMedia',
  splitContentNarrow: 'underMedia',
  fullMedia: 'underMedia',
  imagePair: 'underMedia',
  mediaContentSplit: 'underMedia',
  splitImageOffset: 'underMedia',
  featureStatementLinks: 'self',
  // Pinned ScrollTrigger shell (sticky viewport + scrubbed list) — a CSS
  // reveal wrapper would put transform/opacity on its ancestor and break the
  // pin measurement.
  featuredWork: 'self',
  // Full-viewport shell owning its fullscreen enter threshold.
  industryWork: 'self',
  // Pinned full-viewport WebGL shell (sticky viewport in a scroll track) — a
  // reveal wrapper's transform would break the sticky pin.
  scrollGallery: 'self',
} as const satisfies Record<string, ScrollRevealVariant | 'self'>

export type RevealMappedBlockSlug = keyof typeof blockRevealVariants
