/**
 * Public origin of this deployment, resolved from the environment in the one
 * order the whole project agrees on: an explicit `NEXT_PUBLIC_SERVER_URL`
 * wins, then the per-deployment Vercel URL, then the project's production
 * URL. `fallback` covers a build with none of them set.
 *
 * Plain JavaScript at the repo root on purpose. `next-sitemap.config.mjs` runs
 * in `postbuild`, outside the Next/TypeScript graph, and imports this at build
 * time; the app reaches it through `src/utilities/getURL.ts`. Keeping one
 * implementation is what stops the sitemap's origin from drifting from the
 * site's own. ESM, not CommonJS, so Vite (Storybook) serves it without interop.
 */
export function resolveServerSideURL(fallback) {
  if (process.env.NEXT_PUBLIC_SERVER_URL) {
    return process.env.NEXT_PUBLIC_SERVER_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  return fallback
}
