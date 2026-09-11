import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

import { cn } from '@/utilities/ui'

/**
 * `inset` is a card that sits inside a conversation (Ask's handoff card): the
 * transcript's muted ground with no ring, a larger radius, parts set closer
 * than its padding, a chat-sized title and description, and a ruled footer
 * for the quiet line that closes it. Stated here, not at call sites, so every
 * in-transcript card reads the same.
 */
function Card({
  className,
  size = 'default',
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & { size?: 'default' | 'sm'; variant?: 'default' | 'inset' }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      data-variant={variant}
      className={cn(
        'group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-lg bg-card py-(--card-spacing) text-xs/relaxed text-card-foreground ring-1 ring-foreground/10 [--card-spacing:--spacing(4)] has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] *:[img:first-child]:rounded-t-lg *:[img:last-child]:rounded-b-lg',
        'data-[variant=inset]:gap-3 data-[variant=inset]:rounded-xl data-[variant=inset]:bg-muted data-[variant=inset]:text-foreground data-[variant=inset]:ring-0 data-[variant=inset]:outline-none',
        // A card that takes focus by script (a receipt that replaced the form
        // under the pointer) rings inside: the transcript clips what is outside.
        'data-[variant=inset]:focus-visible:inset-ring-2 data-[variant=inset]:focus-visible:inset-ring-ring/50',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-lg px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)',
        'has-data-[slot=card-icon]:grid-cols-[auto_1fr] has-data-[slot=card-icon]:gap-x-3',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        'font-heading text-sm font-medium group-data-[variant=inset]/card:text-base/5',
        className,
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        'text-xs/relaxed text-muted-foreground',
        // Chat body sizing: 16px on touch, 14px from md (see features/ask/messages).
        'group-data-[variant=inset]/card:text-base/relaxed md:group-data-[variant=inset]/card:text-sm/5',
        className,
      )}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  )
}

/**
 * A status mark leading a card's header: its own column beside every line of
 * the header, nudged up so its center meets the title's. It arrives on a
 * short zoom from 0.75 on the site's settle curve (mount-once: the mark only
 * ever appears as a state change, such as a sent receipt).
 */
const cardIconVariants = cva(
  "row-span-3 -mt-1 flex size-7 shrink-0 items-center justify-center rounded-full [&_svg:not([class*='size-'])]:size-3.5 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-75 motion-safe:duration-300 motion-safe:ease-out-quint",
  {
    variants: {
      variant: {
        success: 'bg-active text-background',
      },
    },
    defaultVariants: {
      variant: 'success',
    },
  },
)

function CardIcon({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof cardIconVariants>) {
  return (
    <div
      aria-hidden
      data-slot="card-icon"
      className={cn(cardIconVariants({ variant }), className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="card-content" className={cn('px-(--card-spacing)', className)} {...props} />
  )
}

/**
 * In an `inset` card the footer is a ruled caption row, its rule inset to the
 * card's padding: muted, with a leading glyph and one line that truncates
 * rather than wraps (a quoted question can run long).
 */
function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'flex items-center rounded-b-lg px-(--card-spacing) [.border-t]:pt-(--card-spacing)',
        'group-data-[variant=inset]/card:mx-(--card-spacing) group-data-[variant=inset]/card:gap-1.5 group-data-[variant=inset]/card:border-t group-data-[variant=inset]/card:border-border group-data-[variant=inset]/card:px-0 group-data-[variant=inset]/card:pt-3 group-data-[variant=inset]/card:text-xs/4 group-data-[variant=inset]/card:text-muted-foreground group-data-[variant=inset]/card:[&>span]:min-w-0 group-data-[variant=inset]/card:[&>span]:truncate group-data-[variant=inset]/card:[&>svg]:size-3.5 group-data-[variant=inset]/card:[&>svg]:shrink-0',
        className,
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardIcon,
  CardTitle,
}
