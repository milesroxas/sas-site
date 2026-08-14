'use client'

import { IconChevronDown } from '@tabler/icons-react'
import { useRef } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/utilities/ui'

/**
 * Headline sentence with an inline mono dropdown chip: static heading, the
 * active option in the chip, then a subheading continuing the sentence. The
 * subheading carries `data-swap="text"` and the whole line `data-reveal`, so
 * owning blocks plug it straight into the shared reveal and swap choreography
 * (`useRevealSwap`).
 */
export const HeadingDropdown = ({
  heading,
  options,
  activeIndex,
  onSelect,
  subheading,
  secondLine,
  subheadingClassName,
  lowercase,
}: {
  heading: string
  /** Dropdown labels, one per panel, in panel order. */
  options: string[]
  activeIndex: number
  onSelect: (index: number) => void
  /** Continues the sentence inline after the chip. */
  subheading: string
  /** Optional continuation forced onto its own line below. */
  secondLine?: string | null
  subheadingClassName?: string
  /** Render options lowercase — taxonomy names sitting mid-sentence. */
  lowercase?: boolean
}) => {
  const openedWithPointerRef = useRef(false)
  const current = options[activeIndex] ?? options[0]

  return (
    // Inline flow (not flex): the chip and subheading sit in the same text run
    // as the heading, so the sentence wraps word by word instead of dropping
    // whole segments to a new line.
    <h2 className="max-w-6xl text-3xl font-light leading-10 text-foreground md:text-4xl" data-reveal>
      <span className="text-muted-foreground">{heading}</span>{' '}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          className={cn(
            'group inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1',
            // leading-none keeps the chip shorter than the line box so it
            // rides the text baseline without stretching wrapped lines.
            'bg-muted align-baseline text-3xl font-light font-mono leading-none text-foreground',
            'outline-none transition-colors hover:bg-accent',
            'focus:outline-none focus:ring-0',
            'focus-visible:ring-2 focus-visible:ring-ring/30',
            'data-[state=open]:bg-accent',
            lowercase && 'lowercase',
          )}
          onPointerDown={() => {
            openedWithPointerRef.current = true
          }}
          onKeyDown={() => {
            openedWithPointerRef.current = false
          }}
        >
          {current}
          <IconChevronDown className="size-6 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={4}
          className={cn(
            'w-max min-w-(--radix-dropdown-menu-trigger-width) rounded-md bg-popover p-3 pr-14',
            'flex flex-col gap-6',
          )}
          onCloseAutoFocus={(event) => {
            if (openedWithPointerRef.current) {
              event.preventDefault()
              openedWithPointerRef.current = false
            }
          }}
        >
          {options.map((option, index) => {
            const selected = index === activeIndex
            return (
              <DropdownMenuItem
                key={`${index}-${option}`}
                className={cn(
                  'min-h-0 cursor-pointer rounded-none p-0 font-mono text-xl font-light whitespace-nowrap text-popover-foreground',
                  'focus:bg-transparent focus:text-popover-foreground',
                  lowercase && 'lowercase',
                  selected && 'opacity-50',
                )}
                onSelect={() => onSelect(index)}
              >
                {option}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>{' '}
      <span className={subheadingClassName} data-swap="text">
        {subheading}
      </span>
      {secondLine ? (
        <span className={cn('mt-4 block', subheadingClassName)} data-swap="text">
          {secondLine}
        </span>
      ) : null}
    </h2>
  )
}
