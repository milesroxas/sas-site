'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '@/utilities/ui'

/**
 * A row of exclusive (or multiple) toggles. `segmented` is the two-to-four
 * option control of a design tool's inspector: one recessed track, the chosen
 * item lifted onto its own plate, every option readable at once. `default`
 * is the loose row of ghost toggles for a toolbar.
 *
 * The track is ringed rather than bordered so its padding box and its border
 * box are the same rectangle: the plate is measured from the items and
 * positioned against that rectangle, and a border would offset one from the
 * other by a pixel.
 */
const toggleGroupVariants = cva('group/toggle-group inline-flex items-center', {
  variants: {
    variant: {
      default: 'gap-1',
      segmented: 'relative w-full rounded-md bg-muted/70 p-px ring-1 ring-input ring-inset',
    },
    /** Control height: inspector row (26), toolbar (30), header (34). */
    size: {
      sm: 'data-[variant=segmented]:h-6.5',
      default: 'data-[variant=segmented]:h-[30px]',
      lg: 'data-[variant=segmented]:h-[34px]',
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
        // The hairline between two unselected options is what makes the track
        // read as one control; it goes quiet next to the plate, which already
        // draws that edge. `active` tints on pointer-down, so the press is
        // answered before the plate has finished travelling.
        segmented: [
          'relative h-full flex-1 rounded-[3px] bg-transparent text-muted-foreground',
          'hover:text-foreground active:bg-foreground/5 data-[state=on]:text-foreground data-[state=on]:active:bg-transparent',
          'before:absolute before:inset-y-1 before:left-0 before:w-px before:bg-input before:transition-opacity before:duration-150',
          'first:before:hidden data-[state=on]:before:opacity-0 [[data-state=on]+&]:before:opacity-0',
          'motion-reduce:transition-none motion-reduce:before:transition-none',
        ],
      },
      size: {
        // A floor on the segment width so a two-option control reads as one
        // track rather than as two words that happen to be boxed.
        sm: 'min-w-14 px-2 text-xs/4',
        default: 'px-2.5 text-xs/4',
        lg: 'px-3 text-[13px]/4',
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

type Plate = { x: number; width: number }

/**
 * Where the plate sits, read from the chosen segment rather than from the
 * value: the item may be wrapped by a tooltip trigger, may render an icon,
 * and need not be the same width as its neighbours. A mutation observer on
 * `data-state` covers the value changing; a resize observer covers the panel
 * changing width. The plate is only armed for motion after its first
 * placement, so it slides between segments and never in from the left edge.
 */
function usePlate(enabled: boolean) {
  const root = React.useRef<HTMLDivElement>(null)
  const [plate, setPlate] = React.useState<Plate | null>(null)
  const [armed, setArmed] = React.useState(false)

  React.useLayoutEffect(() => {
    const node = root.current
    if (!enabled || !node) return
    const measure = () => {
      // Matched on the element, not on `data-slot`: a wrapping trigger
      // overwrites that too, and the segments are the root's own buttons.
      const on = node.querySelector<HTMLElement>(':scope > button[data-state="on"]')
      setPlate(on ? { x: on.offsetLeft, width: on.offsetWidth } : null)
    }
    measure()
    const frame = requestAnimationFrame(() => setArmed(true))
    const resize = new ResizeObserver(measure)
    resize.observe(node)
    const mutation = new MutationObserver(measure)
    mutation.observe(node, { subtree: true, attributes: true, attributeFilter: ['data-state'] })
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      mutation.disconnect()
    }
  }, [enabled])

  return { root, plate, armed }
}

function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleGroupVariants>) {
  const segmented = variant === 'segmented'
  const { root, plate, armed } = usePlate(segmented)
  return (
    <ToggleGroupPrimitive.Root
      ref={root}
      data-slot="toggle-group"
      data-variant={variant ?? 'default'}
      className={cn(toggleGroupVariants({ variant, size }), className)}
      {...props}
    >
      {segmented && (
        <span
          aria-hidden
          data-slot="toggle-group-indicator"
          className={cn(
            'pointer-events-none absolute top-px bottom-px left-0 rounded-[3px] bg-background shadow-[0_1px_2px_rgb(0_0_0/0.14),0_0_0_0.5px_rgb(0_0_0/0.10)] dark:bg-input dark:shadow-[0_1px_2px_rgb(0_0_0/0.45)]',
            plate ? 'opacity-100' : 'opacity-0',
            'transition-[translate,width,opacity] duration-300 ease-out-quint motion-reduce:transition-none',
          )}
          // The first placement is written with motion switched off inline, so
          // the plate appears under the chosen segment instead of sliding in
          // from the track's left edge; every placement after it travels.
          style={
            plate
              ? {
                  width: plate.width,
                  translate: `${plate.x}px 0`,
                  ...(armed ? null : { transition: 'none' }),
                }
              : undefined
          }
        />
      )}
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
  // A wrapping Radix trigger (a tooltip on the segment, say) passes its own
  // `data-state` down through `asChild`, and the toggle spreads incoming
  // props after the on/off state it just wrote — so the segment would lose
  // the only attribute its selected styling reads. Drop a foreign value and
  // let the toggle's own through.
  const forwarded = props as Record<string, unknown>
  if (forwarded['data-state'] !== 'on' && forwarded['data-state'] !== 'off') {
    delete forwarded['data-state']
  }
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
