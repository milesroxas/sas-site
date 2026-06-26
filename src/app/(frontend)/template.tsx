import type React from 'react'

import { DirectionalTransition } from '@/shared/lib/view-transition'

/**
 * A template re-mounts on every navigation (unlike a layout, which persists),
 * so the page-level `<ViewTransition>` inside it fires enter/exit on route
 * changes. Header, footer and the global canvas stay in the layout and are
 * isolated from this transition via their own `view-transition-name`.
 */
export default function FrontendTemplate({ children }: { children: React.ReactNode }) {
  return <DirectionalTransition>{children}</DirectionalTransition>
}
