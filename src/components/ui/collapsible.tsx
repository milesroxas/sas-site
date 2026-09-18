'use client'

import { IconChevronRight } from '@tabler/icons-react'
import { Collapsible as CollapsiblePrimitive } from 'radix-ui'
import type * as React from 'react'

import { cn } from '@/utilities/ui'

function Collapsible({ ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

/**
 * The header row of an inspector section: a chevron that turns when open,
 * the section name, and whatever the caller puts after it (a summary, a
 * count, an action) pushed to the far edge. The whole row is the trigger;
 * an action inside it stops propagation so it does not also toggle.
 */
function CollapsibleTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Trigger>) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      className={cn(
        'group/collapsible flex h-10 w-full cursor-pointer items-center gap-2 text-left text-xs/4 font-semibold text-foreground outline-none select-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30 [&_svg]:size-2.5 [&_svg]:shrink-0 [&_svg]:text-muted-foreground',
        className,
      )}
      {...props}
    >
      <IconChevronRight
        aria-hidden
        className="transition-transform duration-200 ease-out-quint group-data-[state=open]/collapsible:rotate-90 motion-reduce:transition-none"
      />
      {children}
    </CollapsiblePrimitive.Trigger>
  )
}

function CollapsibleContent({
  className,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Content>) {
  return (
    <CollapsiblePrimitive.Content
      data-slot="collapsible-content"
      className={cn(
        'overflow-hidden data-open:animate-collapsible-down data-closed:animate-collapsible-up motion-reduce:animate-none',
        className,
      )}
      {...props}
    />
  )
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger }
