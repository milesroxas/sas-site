import { IconChevronRight, IconLink } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { cn } from '@/utilities/ui'

export type FigureWidth = 'full' | 'text' | 'wide'

/**
 * A figure's span on the composition grid (docs/block-grid-roadmap.md):
 * the reading column rich text sets, that column plus one each side, or all
 * eight. Literal strings so Tailwind sees them.
 *
 * A wide figure widens the drawing, not the words: the frame adopts the page
 * tracks as a subgrid (`BlockGrid`'s rule for a cell that is a run of cells),
 * the visual spans all six columns it was given, and the title, caption and
 * description stay on the reading column's four. Row gap is zeroed because the
 * parts already carry their own rhythm; the column gap stays inherited, which
 * is what lines the words up with the rich text around them.
 */
const WIDTH_CLASS: Record<FigureWidth, { frame: string; text: string; visual: string }> = {
  full: { frame: 'md:col-span-8', text: '', visual: '' },
  text: { frame: 'md:col-span-4 md:col-start-3', text: '', visual: '' },
  wide: {
    frame: 'md:col-span-6 md:col-start-2 md:grid md:grid-cols-subgrid md:gap-y-0',
    text: 'md:col-span-4 md:col-start-2',
    visual: 'md:col-span-full',
  },
}

/** The ids one figure's parts refer to each other by, from its block id. */
export const figureIds = (blockId: string) => ({
  anchor: `figure-${blockId}`,
  description: `figure-${blockId}-description`,
  title: `figure-${blockId}-title`,
})

export type FigureFrameProps = {
  /** The block's id: the anchor, and the ids the visual is labelled by. */
  blockId: string
  caption?: null | string
  children: ReactNode
  /** The figure's data as plain HTML: a table for a chart, a list for a diagram. */
  dataView?: ReactNode
  /** Names what `dataView` holds, e.g. "data table". */
  dataViewLabel?: string
  source?: { href?: null | string; label?: null | string } | null
  textAlternative: string
  title?: null | string
  width?: FigureWidth | null
}

type Ids = ReturnType<typeof figureIds>

/** The title with its anchor: a plain hash link, so copying a figure's address needs no script. */
const Title = ({ className, ids, title }: { className?: string; ids: Ids; title: string }) => (
  <div className={cn('group/title mb-6 flex items-baseline gap-2', className)}>
    <h3 className="text-heading-3" id={ids.title}>
      {title}
    </h3>
    {/* Hidden until the title is hovered; always there on focus, and on touch, where nothing hovers. */}
    <a
      aria-label={`Link to this figure: ${title}`}
      className="pressable-subtle rounded-sm text-muted-foreground opacity-0 transition-opacity duration-150 ease-out group-hover/title:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-60"
      href={`#${ids.anchor}`}
    >
      <IconLink aria-hidden className="size-4" />
    </a>
  </div>
)

const Source = ({ href, label }: { href?: null | string; label: string }) => (
  <span className="mt-1 block">
    Source:{' '}
    {href ? (
      <a
        className="underline underline-offset-2"
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {label}
      </a>
    ) : (
      label
    )}
  </span>
)

/** The text alternative and the data view, behind a native `<details>`: no script, and findable in page. */
const Disclosure = ({
  className,
  dataView,
  dataViewLabel,
  ids,
  textAlternative,
}: Pick<FigureFrameProps, 'dataView' | 'dataViewLabel' | 'textAlternative'> & {
  className?: string
  ids: Ids
}) => (
  <details className={cn('figure-data mt-4 text-sm', className)}>
    <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-sm text-muted-foreground [&::-webkit-details-marker]:hidden">
      <IconChevronRight aria-hidden className="figure-data-chevron size-4" />
      {dataView ? `Description and ${dataViewLabel}` : 'Description'}
    </summary>
    <div className="mt-3 space-y-4">
      <p className="max-w-prose" id={ids.description}>
        {textAlternative}
      </p>
      {dataView}
    </div>
  </details>
)

/**
 * The shell every figure kind shares: one cell on the composition grid holding
 * the title with its anchor, the visual, the caption and source, and a
 * disclosure with the text alternative and the data view.
 *
 * Everything a reader or a crawler needs is server HTML here. The visual is
 * labelled by the title and described by the text alternative (`figureIds`),
 * which works while the disclosure is closed: `aria-describedby` reads hidden
 * content.
 */
export const FigureFrame = ({
  blockId,
  caption,
  children,
  dataView,
  dataViewLabel = 'data',
  source,
  textAlternative,
  title,
  width,
}: FigureFrameProps) => {
  const ids = figureIds(blockId)
  const place = WIDTH_CLASS[width ?? 'wide']
  return (
    <figure className={cn('min-w-0 scroll-mt-28', place.frame)} id={ids.anchor}>
      {title ? <Title className={place.text} ids={ids} title={title} /> : null}
      {/* The visual is wrapped so it is one cell of the frame's subgrid: a figure
          kind hands its legend, axis labels and drawing over as siblings. */}
      <div className={cn('min-w-0', place.visual)}>{children}</div>
      {caption || source?.label ? (
        <figcaption className={cn('mt-4 text-sm text-muted-foreground', place.text)}>
          {caption}
          {source?.label ? <Source href={source.href} label={source.label} /> : null}
        </figcaption>
      ) : null}
      <Disclosure
        className={place.text}
        dataView={dataView}
        dataViewLabel={dataViewLabel}
        ids={ids}
        textAlternative={textAlternative}
      />
    </figure>
  )
}
