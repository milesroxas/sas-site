import type React from 'react'

import { DirectionalTransition } from '@/shared/lib/view-transition'

/**
 * A template re-mounts when the segment directly below it changes (unlike a
 * layout, which persists); `DirectionalTransition` keys the page-level
 * `<ViewTransition>` on the full pathname on top of that, so a navigation
 * within one segment (`/works/a` -> `/works/b`) fires enter/exit like any
 * other. Header, footer and the global canvas stay in the layout and are
 * isolated from this transition via their own `view-transition-name`.
 */
export default function FrontendTemplate({ children }: { children: React.ReactNode }) {
  return <DirectionalTransition>{children}</DirectionalTransition>
}
