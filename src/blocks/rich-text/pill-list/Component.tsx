import type React from 'react'
import type { RichTextPillListBlock as RichTextPillListBlockData } from '@/payload-types'
import { cn } from '@/utilities/ui'

type RichTextPillListProps = Pick<RichTextPillListBlockData, 'eyebrow' | 'items'> & {
  className?: string
}

/**
 * The cloud: an optional mono kicker, then labels wrapping as pills at the
 * same mono size, one beat of the intro reveal. Set by its caller as one cell
 * of the block's grid (`className` carries the placement); it is as wide as
 * the reading column, so unlike an Insights run it never widens past the
 * copy. `not-prose` keeps Tailwind Typography's list styling off the pills
 * when a converter renders the block inline.
 */
export const RichTextPillList: React.FC<RichTextPillListProps> = ({
  className,
  eyebrow,
  items,
}) => {
  const pills = items ?? []
  if (pills.length === 0) return null

  return (
    <div className={cn('not-prose flex flex-col gap-6', className)} data-reveal>
      {eyebrow ? (
        <p className="font-mono text-xs/4 tracking-widest text-muted-foreground uppercase">
          {eyebrow}
        </p>
      ) : null}
      <ul className="flex flex-wrap gap-2">
        {pills.map((pill, index) => (
          <li
            className="rounded-full border border-border px-3.5 py-2 font-mono text-xs/4 tracking-wide text-foreground"
            key={pill.id ?? index}
          >
            {pill.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
