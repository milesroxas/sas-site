'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { Tabs as TabsPrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '@/utilities/ui'

type TabsVariant = VariantProps<typeof tabsListVariants>['variant']

const TabsVariantContext = React.createContext<TabsVariant>('default')

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  )
}

/**
 * Two list treatments. `default` is the boxed segmented list. `line` is the
 * admin's tab bar: text on a hairline, the active tab underlined in the
 * foreground ink, the way Payload draws its own document tabs, so a nested
 * set of tabs reads as the same control one level down.
 */
const tabsListVariants = cva('inline-flex w-fit items-center text-muted-foreground', {
  variants: {
    variant: {
      default: 'h-8 gap-1 rounded-md bg-muted p-0.5',
      line: 'h-9 gap-5 border-b border-border',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const tabsTriggerVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 text-xs/relaxed font-medium whitespace-nowrap transition-[color,background-color,box-shadow] outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default:
          'h-full flex-1 rounded-sm px-2 focus-visible:ring-2 focus-visible:ring-ring/30 data-active:bg-background data-active:text-foreground data-active:shadow-xs',
        // The underline is a box-shadow so it sits on the list's hairline
        // without moving the text, and the focus ring stays a ring.
        line: 'h-full px-0 hover:text-foreground focus-visible:text-foreground data-active:text-foreground data-active:shadow-[inset_0_-1px_0_0_var(--foreground)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function TabsList({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsVariantContext value={variant ?? 'default'}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={variant ?? 'default'}
        className={cn(tabsListVariants({ variant }), className)}
        {...props}
      />
    </TabsVariantContext>
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const variant = React.use(TabsVariantContext)
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants, tabsTriggerVariants }
