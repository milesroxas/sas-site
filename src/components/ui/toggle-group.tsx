'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '@/utilities/ui'

/**
 * A row of exclusive (or multiple) toggles. `segmented` is the two-to-four
 * option control of a design tool's inspector: one boxed track, the chosen
 * item lifted onto its own plate, every option readable at once. `default`
 * is the loose row of ghost toggles for a toolbar.
 */
const toggleGroupVariants = cva('group/toggle-group inline-flex items-center', {
  variants: {
    variant: {
      default: 'gap-1',
      segmented: 'h-7 w-full rounded-md border border-input bg-input/20 p-0.5 dark:bg-input/30',
    },
    size: {
      default: '',
      sm: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

const toggleGroupItemVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1 rounded-sm text-xs/relaxed font-medium whitespace-nowrap transition-[color,background-color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default:
          'h-7 px-2 text-muted-foreground hover:bg-muted hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground',
        segmented:
          'h-full flex-1 px-2 text-muted-foreground hover:text-foreground data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-xs',
      },
      size: {
        default: '',
        sm: 'text-[11px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleGroupItemVariants>>({
  variant: 'default',
  size: 'default',
})

function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleGroupVariants>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant ?? 'default'}
      className={cn(toggleGroupVariants({ variant, size }), className)}
      {...props}
    >
      <ToggleGroupContext value={{ variant, size }}>{children}</ToggleGroupContext>
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleGroupItemVariants>) {
  const context = React.use(ToggleGroupContext)
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(
        toggleGroupItemVariants({
          variant: variant ?? context.variant,
          size: size ?? context.size,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem, toggleGroupItemVariants, toggleGroupVariants }
