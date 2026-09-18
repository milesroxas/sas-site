import type * as React from 'react'

import { cn } from '@/utilities/ui'

/**
 * A keyboard key, as it appears in a tooltip or a menu row: small mono text
 * on a quiet plate, sized to sit inside a line of text. `KbdGroup` lays a
 * chord or a list of keys out on one baseline.
 */
function Kbd({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        'pointer-events-none inline-flex h-4 min-w-4 items-center justify-center gap-0.5 rounded-xs bg-muted px-1 font-mono text-[10px] leading-none font-medium text-muted-foreground select-none [&_svg:not([class*=size-])]:size-2.5',
        className,
      )}
      {...props}
    />
  )
}

function KbdGroup({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="kbd-group"
      className={cn('inline-flex items-center gap-1', className)}
      {...props}
    />
  )
}

export { Kbd, KbdGroup }
