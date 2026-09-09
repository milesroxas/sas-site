'use client'

import { IconChevronDown } from '@tabler/icons-react'
import type React from 'react'
import type { ReactNode } from 'react'
import { Container } from '@/components/Container'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { HeroEyebrow } from '@/heros/shared'
import { ScrollReveal } from '@/shared/ui/scroll-reveal'
import { cn } from '@/utilities/ui'
import { CONTROL, FIGURE, LABEL } from './registers'
import { sortKeys } from './sorts'

/** Sentinel for an unset dropdown: Radix Select has no empty-string value. */
export const ALL = 'all'

export type IndexFilterOption = { slug: string; label: string }

export const matchesOption = (options: IndexFilterOption[], slug: string) =>
  slug === ALL || options.some((option) => option.slug === slug)

/** What the index counts, singular and plural: `Project` / `Projects`. */
export type IndexNoun = { one: string; other: string }

type SortControl<K extends string> = {
  orders: Record<K, { label: string }>
  value: K
  onChange: (key: K) => void
}

/**
 * The editorial index frame every browse surface shares: the title cluster
 * with its running count, then the strip that closes the header and opens the
 * set (filters leading, sort trailing), then the set itself as `children`.
 * The intro plays the site's intro reveal as one cluster; the set owns its
 * own entrance and its in-place filter swap.
 */
export function BrowseIndex<K extends string>({
  eyebrow,
  title,
  noun,
  count,
  total,
  filters,
  sort,
  children,
}: {
  /** Kicker above the index title: CMS hero copy. */
  eyebrow?: string | null
  title?: string | null
  noun: IndexNoun
  /** Rows on show under the current filters. */
  count: number
  /** Rows in the whole set, for the live region. */
  total: number
  filters: ReactNode
  sort: SortControl<K>
  children: ReactNode
}) {
  return (
    <Container className="flex flex-col gap-12 pt-12 pb-24">
      <ScrollReveal as="div" className="flex flex-col gap-12" variant="intro">
        <header className="flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col items-start gap-6">
            {eyebrow && (
              <div data-reveal data-reveal-group="index-title">
                <HeroEyebrow eyebrow={eyebrow} />
              </div>
            )}
            {title && (
              <h1
                className="text-display text-foreground"
                data-reveal
                data-reveal-group="index-title"
              >
                {title}
              </h1>
            )}
          </div>
          <p className={cn(FIGURE, 'shrink-0 text-muted-foreground')} data-reveal>
            {`Index / ${count} ${count === 1 ? noun.one : noun.other}`}
          </p>
        </header>

        {/* The strong rule sits on top: the strip closes the header and opens
            the set, so its lower edge is the set's own hairline weight. */}
        <div
          className="flex flex-col gap-4 border-t border-foreground border-b border-b-border py-3 lg:flex-row lg:items-center lg:justify-between"
          data-reveal
        >
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className={cn(LABEL, 'text-muted-foreground')}>Filter</span>
            {filters}
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className={cn(LABEL, 'text-muted-foreground')}>Sort</span>
            {sortKeys(sort.orders).map((key) => {
              const active = sort.value === key
              return (
                <button
                  aria-pressed={active}
                  className={cn(
                    CONTROL,
                    'pressable underline-offset-4',
                    active
                      ? 'text-foreground underline'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                  key={key}
                  onClick={() => sort.onChange(key)}
                  type="button"
                >
                  {sort.orders[key].label}
                </button>
              )
            })}
          </div>
        </div>
      </ScrollReveal>

      <p aria-live="polite" className="sr-only">
        {`Showing ${count} of ${total} ${noun.other.toLowerCase()}`}
      </p>

      {children}
    </Container>
  )
}

/**
 * A filter dropdown drawn as strip text rather than a control: the Radix
 * trigger keeps the keyboard and screen-reader behaviour, the box is stripped
 * off it, and the value reads inline with its label (`Industry: All`).
 */
export const FilterSelect: React.FC<{
  label: string
  options: IndexFilterOption[]
  value: string
  onValueChange: (value: string) => void
}> = ({ label, options, value, onValueChange }) => (
  <Select onValueChange={onValueChange} value={value}>
    <SelectTrigger
      aria-label={`Filter by ${label.toLowerCase()}`}
      className={cn(
        CONTROL,
        'h-auto gap-2 rounded-none border-0 bg-transparent p-0 text-foreground shadow-none data-[size=default]:h-auto',
        'focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4',
      )}
      icon={<IconChevronDown className="pointer-events-none size-3 text-foreground" />}
    >
      {`${label}: `}
      <SelectValue />
    </SelectTrigger>
    {/* Anchored under the trigger rather than over it: the strip's controls sit
        shoulder to shoulder, and an item-aligned menu covers its neighbour. */}
    <SelectContent align="start" position="popper">
      <SelectItem value={ALL}>All</SelectItem>
      {options.map((option) => (
        <SelectItem key={option.slug} value={option.slug}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)

/** The set under filters nothing matches, with the way back to the whole set. */
export const IndexEmpty: React.FC<{
  message: string
  action: string
  onReset: () => void
}> = ({ message, action, onReset }) => (
  <div>
    <p className="text-muted-foreground">{message}</p>
    <button
      className="pressable mt-4 text-sm text-foreground underline underline-offset-4"
      onClick={onReset}
      type="button"
    >
      {action}
    </button>
  </div>
)
