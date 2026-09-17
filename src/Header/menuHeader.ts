import type { Header } from '@/payload-types'

/**
 * The Header global's fields the takeover menu renders.
 *
 * The header mounts on every page, so whatever its client component receives
 * is serialized into that page's RSC payload. The rest of the global has no
 * business there: `featuredWork` carries the title and slug of every picked
 * work page, published or not, so an unpublished page stays readable in the
 * page source after it stops resolving at its URL.
 */
export type MenuHeader = Pick<Header, 'navItems' | 'cta'>

/** Server-side narrowing to what crosses the boundary. */
export const toMenuHeader = ({ navItems, cta }: Header): MenuHeader => ({ navItems, cta })
