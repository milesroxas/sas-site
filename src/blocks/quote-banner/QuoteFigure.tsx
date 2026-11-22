import type { ReactNode } from 'react'
import { cn } from '@/utilities/ui'

/**
 * One testimonial as it renders, server or client: the quote is the block's
 * own heading, so it takes `text-subheading` (shared/typography.ts), with the
 * marks from `quote-marks`. The speaker line is caption text.
 */
export type QuoteEntry = {
  id: string
  /** Tab label: the client organization, else the speaker. */
  label: string
  /** The quote's rich text, rendered on the server. */
  quote: ReactNode
  speakerName: string
  /** "Role, Organization", whatever of it is set. */
  speakerMeta: string
}

export const QuoteBody = ({ className, entry }: { className?: string; entry: QuoteEntry }) => (
  <>
    <blockquote className={cn('text-subheading text-pretty', className)}>{entry.quote}</blockquote>
    <figcaption className="text-sm">
      <span className="text-foreground">{entry.speakerName}</span>
      {entry.speakerMeta ? (
        <span className="text-muted-foreground">, {entry.speakerMeta}</span>
      ) : null}
    </figcaption>
  </>
)

/** The quote and speaker stack: the gap between them is the figure's own. */
export const quoteFigureClassName = 'flex flex-col gap-6'

/**
 * The quote column: the eyebrow over the quote, columns 1-6 (1-5 from `xl`
 * for measure). Stated once so a single quote and the switcher sit on the
 * same cell.
 */
export const quoteColumnClassName = 'flex flex-col gap-8 md:col-span-6 xl:col-span-5'
