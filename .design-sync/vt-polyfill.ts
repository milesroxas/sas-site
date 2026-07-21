/**
 * npm react 19.2 does not export ViewTransition; the app runs against Next's
 * vendored canary React (see .storybook/main.ts aliases) which does. The
 * design-sync bundle ships npm react, so components importing
 * `ViewTransition` from 'react' (Card, PostHero) would render `undefined`.
 * Patch window.React before any component module evaluates: fall back to
 * rendering children with no transition — visually identical in a static
 * preview.
 */
// Bundled Next.js client internals (next/link, next/image, next/navigation)
// read process.env.* / process.platform at module scope and render time; the
// preview pages are plain browser contexts with no `process`. This module is
// the entry's first import, so it evaluates before any Next code does.
import { imageConfigDefault } from 'next/dist/shared/lib/image-config'

const g = globalThis as { process?: { env: Record<string, unknown> } }
if (!g.process) {
  g.process = { env: {} }
}

// next/image reads this at module init and, left unset, routes every src
// through the `/_next/image` optimizer endpoint — which does not exist on a
// static preview page, so images 404. `unoptimized` makes it emit the src
// as-is. (Next's build normally replaces this via its define plugin.)
g.process.env.__NEXT_IMAGE_OPTS = { ...imageConfigDefault, unoptimized: true }

type VTProps = { children?: unknown }
const R = (globalThis as unknown as { React?: Record<string, unknown> }).React
if (R && !R.ViewTransition) {
  R.ViewTransition = (props: VTProps) => props?.children ?? null
}

// The app's theming keys off `data-theme` on <html> (storybook's
// withThemeByDataAttribute decorator sets it; the decorator chain doesn't
// bundle here — .storybook/preview imports font/css assets). Default to
// light when unset so token variables resolve the same as the reference.
if (typeof document !== 'undefined' && !document.documentElement.dataset.theme) {
  document.documentElement.dataset.theme = 'light'
}
export {}
