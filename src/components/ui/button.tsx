import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type * as React from 'react'

import { cn } from '@/utilities/ui'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-xs/relaxed font-medium whitespace-nowrap pressable outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/80',
        outline:
          'border-border hover:bg-input/50 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:bg-input/30',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
        ghost:
          'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
        destructive:
          'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
        link: 'text-primary underline-offset-4 hover:underline',
        // Editorial nav link: a hairline rule above a full-width, left-set
        // label. Pair with `size="clear"` — the variant owns its own metrics.
        ruled:
          'w-full justify-between rounded-none border-t-foreground py-2 text-base/none font-normal text-muted-foreground hover:text-foreground',
        // Editorial text action in the field-label voice (Edit, Edit and
        // resend): mono small caps on an underline. Pair with `size="clear"`.
        mono: 'font-mono text-xs/4 font-normal tracking-widest text-foreground uppercase underline underline-offset-4 hover:text-primary',
        // Frosted chip for actions that sit over media (hero primary action):
        // a translucent tint of the band's foreground with a light backdrop
        // blur, so it reads on any photograph without a solid plate. The
        // hover deepens the tint on the `pressable` transition list. Pair
        // with `size="action"`, which sets the label's weight and tracking.
        glass: 'bg-foreground/10 text-foreground backdrop-blur-xs hover:bg-foreground/15',
        // Plain underlined label for the secondary action beside `glass`:
        // same metrics, no plate, so the pair aligns as one row. The hover
        // lifts the rule instead of changing color. Pair with `size="action"`.
        underline: 'text-foreground underline underline-offset-2 hover:underline-offset-4',
        // The text action beside a `default` chip in a content column (rich
        // text Actions): the `action` label in primary ink on a hairline
        // underline, no plate and no side padding so alone it sits flush with
        // the copy. Owns the chip's 32px height so the pair rows up; pair with
        // `size="clear"`. `underline` is its foreground-ink twin over media.
        text: 'h-8 text-sm/4 font-normal tracking-tight text-primary underline decoration-1 underline-offset-2 hover:underline-offset-4',
      },
      size: {
        default:
          "h-7 gap-1 px-2 text-xs/relaxed has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        xs: "h-5 gap-1 rounded-sm px-2 text-[0.625rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-2.5",
        sm: "h-6 gap-1 px-2 text-xs/relaxed has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        lg: "h-8 gap-1 px-2.5 text-xs/relaxed has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-4",
        // Editorial page action (form submit, "Schedule a call") — the one
        // button size that stands on its own in a page column rather than
        // inside chrome. 44px is the comfortable touch target.
        xl: "h-11 gap-2 px-6 text-sm/5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4 [&_svg:not([class*='size-'])]:size-4",
        icon: "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        'icon-xs': "size-5 rounded-sm [&_svg:not([class*='size-'])]:size-2.5",
        'icon-sm': "size-6 [&_svg:not([class*='size-'])]:size-3",
        'icon-lg': "size-8 [&_svg:not([class*='size-'])]:size-4",
        // Unpadded size for text-flow usage (e.g. nav links via CMSLink's
        // `link` appearance) where button chrome would break the text rhythm.
        clear: "gap-1 [&_svg:not([class*='size-'])]:size-3.5",
        // Page action: a 14px label at the body weight, tight-tracked, on a
        // 32px sharp-cornered chip. The one size sized to sit beside a
        // headline (hero over media, a content column's Actions) rather than
        // inside form chrome, so it owns the label's weight and tracking too.
        action:
          "h-8 gap-1 rounded-sm px-3 text-sm/4 font-normal tracking-tight has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-4",
        // Takeover-menu pill: letterspaced all-caps capsule (CLOSE / GET IN
        // TOUCH). Trailing letter-space is offset so the label reads centered.
        pill: "h-8 gap-1 rounded-full px-6 text-sm/none font-semibold tracking-widest uppercase [&>span]:mr-[-0.1em] [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
