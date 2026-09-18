'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { Tooltip as TooltipPrimitive } from 'radix-ui'
import type * as React from 'react'

import { cn } from '@/utilities/ui'

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

/**
 * Two surfaces. `default` is the inverted pill for a label or a shortcut.
 * `panel` is a card on the popover surface for a paragraph with a title, a
 * range line and a shortcut row (a design tool's parameter tooltip): it
 * materializes from its anchor edge, blur and scale together, instead of
 * fading, so it reads as a surface arriving. Reduced motion keeps the fade.
 */
const tooltipContentVariants = cva(
  'z-50 w-fit origin-(--radix-tooltip-content-transform-origin) data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
  {
    variants: {
      variant: {
        default:
          'inline-flex max-w-xs items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background has-data-[slot=kbd]:pr-1.5 data-[state=delayed-open]:zoom-in-95 data-open:zoom-in-95 data-closed:zoom-out-95',
        panel:
          'w-63 rounded-lg border border-input bg-popover px-3.5 py-3 text-xs/[17px] text-popover-foreground shadow-[0_8px_24px_rgb(0_0_0/0.5)] duration-160 ease-out-quint data-[state=delayed-open]:zoom-in-96 data-[state=delayed-open]:blur-in-4 data-open:zoom-in-96 data-open:blur-in-4 data-closed:duration-100 data-closed:zoom-out-98 motion-reduce:zoom-in-100 motion-reduce:blur-in-0 motion-reduce:slide-in-from-top-0 motion-reduce:slide-in-from-bottom-0 motion-reduce:slide-in-from-left-0 motion-reduce:slide-in-from-right-0',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function TooltipContent({
  className,
  sideOffset = 0,
  variant,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> &
  VariantProps<typeof tooltipContentVariants>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        data-variant={variant ?? 'default'}
        sideOffset={sideOffset}
        className={cn(tooltipContentVariants({ variant }), className)}
        {...props}
      >
        {children}
        {variant !== 'panel' && (
          <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground" />
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, tooltipContentVariants }
