import type { ReactNode } from 'react'
import { cn } from '@/utilities/ui'
import { layoutTimeline } from '../../layout/timeline'
import type { StoredLayout } from '../../layout/types'
import type { DiagramSpec } from '../../spec/diagram'
import { FigureFrame, type FigureFrameProps, figureIds } from '../figure-frame'
import { DIAGRAM_LIST_LABEL, DiagramList } from './diagram-list'
import { GraphSvg } from './graph-svg'
import { SequenceSvg } from './sequence-svg'
import { minReadableWidth } from './svg'
import { TimelineSvg } from './timeline-svg'

type DiagramFigureProps = Omit<FigureFrameProps, 'children' | 'dataView' | 'dataViewLabel'> & {
  /**
   * The stored layout for a flow or state spec, already checked against the
   * spec (`currentLayout`). Null draws the pending note; sequence and timeline
   * never need one.
   */
  layout: StoredLayout | null
  spec: DiagramSpec
}

/**
 * Where a figure with two forms swaps between them: the first container width
 * (Tailwind's container scale, in px) at which its wide form is still readable.
 * A container query, so the figure answers to its own frame and a `text`-width
 * figure on a desktop gets the narrow form too. Literal class pairs, because
 * Tailwind only ships classes it can read in source.
 */
const SWAPS = [
  { min: 448, narrow: '@md/figure:hidden', wide: 'hidden @md/figure:block' },
  { min: 576, narrow: '@xl/figure:hidden', wide: 'hidden @xl/figure:block' },
  { min: 672, narrow: '@2xl/figure:hidden', wide: 'hidden @2xl/figure:block' },
  { min: 768, narrow: '@3xl/figure:hidden', wide: 'hidden @3xl/figure:block' },
  { min: 896, narrow: '@4xl/figure:hidden', wide: 'hidden @4xl/figure:block' },
  { min: 1024, narrow: '@5xl/figure:hidden', wide: 'hidden @5xl/figure:block' },
  { min: 1152, narrow: '@6xl/figure:hidden', wide: 'hidden @6xl/figure:block' },
  { min: 1280, narrow: '@7xl/figure:hidden', wide: 'hidden @7xl/figure:block' },
] as const

/**
 * Both forms in the markup, one shown. The hidden twin is `display: none`,
 * which also takes it out of the accessibility tree. A wide form no frame on
 * the site can hold is not rendered at all.
 */
const TwoForms = ({
  label,
  narrow,
  wide,
  wideWidth,
}: {
  label: string
  narrow: ReactNode
  wide: ReactNode
  wideWidth: number
}) => {
  const swap = SWAPS.find(({ min }) => min >= minReadableWidth(wideWidth))
  if (!swap) return <Canvas label={label}>{narrow}</Canvas>
  return (
    <>
      <Canvas className={swap.wide} label={label}>
        {wide}
      </Canvas>
      <Canvas className={swap.narrow} label={label}>
        {narrow}
      </Canvas>
    </>
  )
}

/**
 * The frame a drawing sits in. It scrolls sideways when the drawing cannot
 * shrink any further and stay readable (`canvasStyle`): the one accepted
 * exception to no horizontal scroll, contained here and reachable by keyboard.
 */
const Canvas = ({
  children,
  className,
  label,
}: {
  children: ReactNode
  className?: string
  label: string
}) => (
  <section
    aria-label={`${label}, scrollable`}
    className={cn('overflow-x-auto pb-2', className)}
    // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region must be keyboard reachable (WCAG 2.1.1).
    tabIndex={0}
  >
    {children}
  </section>
)

/**
 * A diagram in its frame: server SVG from a stored or arithmetic layout, zero
 * client JavaScript. A kind with a narrow form shows whichever fits the
 * figure's own width (`TwoForms`); one without scrolls inside its frame.
 */
export const DiagramFigure = ({ layout, spec, ...frame }: DiagramFigureProps) => {
  const ids = figureIds(frame.blockId)
  const name = frame.title ?? 'Diagram'
  const a11y = {
    describedBy: ids.description,
    label: name,
    labelledBy: frame.title ? ids.title : undefined,
  }

  const drawing = (() => {
    if (spec.kind === 'sequence')
      return (
        <Canvas label={name}>
          <SequenceSvg {...a11y} spec={spec} />
        </Canvas>
      )
    if (spec.kind === 'timeline')
      return (
        <TwoForms
          label={name}
          narrow={<TimelineSvg {...a11y} spec={spec} variant="narrow" />}
          wide={<TimelineSvg {...a11y} spec={spec} variant="wide" />}
          wideWidth={layoutTimeline(spec).wide.width}
        />
      )
    if (!layout)
      return (
        <p className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
          This diagram is drawn when the document is saved. Its steps are listed below.
        </p>
      )
    if (!layout.narrow)
      return (
        <Canvas label={name}>
          <GraphSvg {...a11y} layout={layout.wide} spec={spec} />
        </Canvas>
      )
    return (
      <TwoForms
        label={name}
        narrow={<GraphSvg {...a11y} layout={layout.narrow} spec={spec} />}
        wide={<GraphSvg {...a11y} layout={layout.wide} spec={spec} />}
        wideWidth={layout.wide.width}
      />
    )
  })()

  return (
    <FigureFrame
      {...frame}
      dataView={<DiagramList spec={spec} />}
      dataViewLabel={DIAGRAM_LIST_LABEL[spec.kind]}
    >
      <div className="@container/figure">{drawing}</div>
    </FigureFrame>
  )
}
