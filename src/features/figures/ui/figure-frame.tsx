import { IconChevronRight, IconLink } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { cn } from '@/utilities/ui'

export type FigureWidth = 'full' | 'text' | 'wide'

/**
 * A figure's span on the composition grid (docs/block-grid-roadmap.md):
 * the reading column rich text sets, that column plus one each side, or all
 * eight. Literal strings so Tailwind sees them.
 */
const WIDTH_CLASS: Record<FigureWidth, string> = {
  full: 'md:col-span-8',
  text: 'md:col-span-4 md:col-start-3',
  wide: 'md:col-span-6 md:col-start-2',
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
const Title = ({ ids, title }: { ids: Ids; title: string }) => (
  <div className="group/title mb-6 flex items-baseline gap-2">
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
  dataView,
  dataViewLabel,
  ids,
  textAlternative,
}: Pick<FigureFrameProps, 'dataView' | 'dataViewLabel' | 'textAlternative'> & { ids: Ids }) => (
  <details className="figure-data mt-4 text-sm">
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
  return (
    <figure className={cn('min-w-0 scroll-mt-28', WIDTH_CLASS[width ?? 'wide'])} id={ids.anchor}>
      {title ? <Title ids={ids} title={title} /> : null}
      {children}
      {caption || source?.label ? (
        <figcaption className="mt-4 text-sm text-muted-foreground">
          {caption}
          {source?.label ? <Source href={source.href} label={source.label} /> : null}
        </figcaption>
      ) : null}
      <Disclosure
        dataView={dataView}
        dataViewLabel={dataViewLabel}
        ids={ids}
        textAlternative={textAlternative}
      />
    </figure>
  )
}
