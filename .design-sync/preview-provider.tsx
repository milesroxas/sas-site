/**
 * App Router context for preview pages.
 *
 * Components that call `useRouter`/`usePathname` (FormBlock, PostCard via
 * useClickableCard, RelatedPosts) throw "invariant expected app router to be
 * mounted" outside a Next app tree. Storybook supplies this through
 * `parameters.nextjs.appDirectory`; previews get it through `cfg.provider`
 * pointing at `PreviewAppRouter` below.
 *
 * Navigation is a no-op — a static preview has nowhere to go.
 */
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { PathnameContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime'
import type React from 'react'

const noop = () => {}

const router = {
  back: noop,
  forward: noop,
  refresh: noop,
  push: noop,
  replace: noop,
  prefetch: () => Promise.resolve(),
} as unknown as React.ContextType<typeof AppRouterContext>

export const PreviewAppRouter: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AppRouterContext.Provider value={router}>
    <PathnameContext.Provider value="/">{children}</PathnameContext.Provider>
  </AppRouterContext.Provider>
)
