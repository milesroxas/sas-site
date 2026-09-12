'use client'

import { IconThumbDown, IconThumbUp } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import { useAskFeedback } from './feedback'
import { transcriptItemEnter } from './motion'
import { ASK_RATING_REASONS, type AskRating as RatingValue } from './vocabulary'

/**
 * Two thumbs under a settled reply, at the weight of the row they sit in:
 * ghost glyphs that only fill once one is chosen. A thumbs down asks one
 * more question in the same row (wrong, incomplete, off topic) and closes
 * once it is answered or ignored. The choice is final on this surface; the
 * row shows it and offers nothing more.
 */
export function AskRating({ turn }: { turn: string }) {
  const { ratings, rate } = useAskFeedback()
  const rated = ratings[turn]
  const askReason = rated?.rating === 'down' && !rated.reason

  return (
    <fieldset className="flex min-h-7 flex-wrap items-center gap-x-1 gap-y-2">
      <legend className="sr-only">Was this helpful?</legend>
      {(['up', 'down'] as const).map((rating) => (
        <Thumb
          key={rating}
          rating={rating}
          chosen={rated?.rating === rating}
          hidden={rated !== undefined && rated.rating !== rating}
          onClick={() => rate(turn, { rating })}
        />
      ))}
      {askReason && (
        <fieldset className={cn('flex flex-wrap items-center gap-1 pl-1', transcriptItemEnter)}>
          <legend className="sr-only">What was wrong?</legend>
          {ASK_RATING_REASONS.map((reason) => (
            <Button
              key={reason.value}
              className="font-normal"
              onClick={() => rate(turn, { rating: 'down', reason: reason.value })}
              size="chat"
              type="button"
              variant="outline"
            >
              {reason.label}
            </Button>
          ))}
        </fieldset>
      )}
    </fieldset>
  )
}

function Thumb({
  rating,
  chosen,
  hidden,
  onClick,
}: {
  rating: RatingValue
  chosen: boolean
  hidden: boolean
  onClick: () => void
}) {
  const Glyph = rating === 'up' ? IconThumbUp : IconThumbDown
  return (
    <Button
      aria-label={rating === 'up' ? 'Helpful' : 'Not helpful'}
      aria-pressed={chosen}
      className={cn(
        'text-muted-foreground hover:text-foreground aria-pressed:text-foreground',
        hidden && 'hidden',
      )}
      onClick={chosen ? undefined : onClick}
      size="icon"
      type="button"
      variant="ghost"
    >
      <Glyph className={cn(chosen && 'fill-current')} />
    </Button>
  )
}
