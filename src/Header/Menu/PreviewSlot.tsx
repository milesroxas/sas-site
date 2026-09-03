import type React from 'react'
import { cn } from '@/utilities/ui'

/**
 * The takeover menu's center slot: the docked page frame lands exactly on
 * this box (measured by the menu's GSAP timeline via `data-menu-preview-slot`),
 * so it renders whether or not the Ask composer is on the site. MenuAsk
 * mounts the transcript panel inside it and grows it on a phone in chat
 * view; with Ask hidden the menu renders the bare slot.
 */
export const MenuPreviewSlot = ({ className, children, ...props }: React.ComponentProps<'div'>) => (
  <div
    data-menu-preview-slot
    className={cn(
      'pointer-events-none relative aspect-video w-full md:col-start-2 md:row-start-1 md:aspect-auto md:h-full md:min-h-0',
      className,
    )}
    {...props}
  >
    {children}
  </div>
)
