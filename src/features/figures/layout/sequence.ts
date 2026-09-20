import type { SequenceSpec } from '../spec/diagram'
import { TEXT_METRICS, textWidth, wrapLabel } from './text'

/**
 * Sequence layout is arithmetic: actors sit on an even pitch, messages step
 * down one row each. Cheap and deterministic, so it is computed at render and
 * never stored (only graph layouts need an engine, see `./graph`).
 *
 * Two forms, like `./timeline`. Wide gives every column the room its longest
 * label needs and sets each label over the span it travels. Narrow holds the
 * lifelines on a pitch a phone can carry and lets a label run the width of the
 * canvas above its arrow, because on a phone the span between two lifelines is
 * narrower than almost any label.
 */

export const SEQUENCE_LINE_HEIGHT = 18
/** Two label lines above the arrow, then air before the next message. */
const ROW_HEIGHT = 60
const PAD = 8
/** Air between a label's last line and the mark it names. */
const LABEL_LIFT = 6
/** How far a self message loops out from its lifeline, and back up from its row. */
const SELF_LOOP = { height: 20, width: 36 }

type Form = {
  /** Gap between two headers, taken out of the pitch. */
  headerGap: number
  headerHeight: number
  headerWrap: { maxChars: number; maxLines: number }
  /** A message label wraps to two lines of this, or of what the canvas holds when that is less. */
  labelMaxChars: number
  /** Where a self message's label goes: beside its loop, or above it like every other label. */
  selfLabel: 'above' | 'beside'
}

const FORMS = {
  narrow: {
    headerGap: 8,
    headerHeight: 40,
    headerWrap: { maxChars: 11, maxLines: 2 },
    labelMaxChars: 52,
    selfLabel: 'above',
  },
  wide: {
    headerGap: 24,
    headerHeight: 44,
    headerWrap: { maxChars: 16, maxLines: 2 },
    labelMaxChars: 40,
    selfLabel: 'beside',
  },
} as const satisfies Record<string, Form>

export type SequenceVariant = keyof typeof FORMS

const WIDE_PITCH_MIN = 148
/** The narrow canvas aims for a phone's column; its pitch flexes so two actors do not huddle. */
const NARROW = { pitchMax: 160, pitchMin: 84, width: 336 }

type Point = [number, number]
type Message = SequenceSpec['messages'][number]

export type SequenceLayout = {
  actors: { id: string; lines: string[]; x: number }[]
  header: { height: number; width: number; y: number }
  height: number
  messages: {
    index: number
    label: { anchor: 'middle' | 'start'; lines: string[]; x: number; y: number }
    /** The route, ending at the arrowhead. */
    points: Point[]
  }[]
  /** Where the lifelines end. */
  tailY: number
  width: number
}

const labelWidth = (lines: readonly string[]): number =>
  Math.max(0, ...lines.map((line) => textWidth(line, TEXT_METRICS.smallCharWidth)))

/** One pitch for every column: wide enough that the longest label fits the span it sits over. */
const widePitch = (spec: SequenceSpec, spanOf: (message: Message) => number): number =>
  Math.max(
    WIDE_PITCH_MIN,
    ...spec.messages.map((message) => {
      const width =
        labelWidth(wrapLabel(message.label, FORMS.wide.labelMaxChars, 2)) + FORMS.wide.headerGap
      const span = spanOf(message)
      // A self message reads beside its loop, inside one pitch.
      return span === 0 ? width + SELF_LOOP.width : width / span
    }),
  )

const narrowPitch = (actors: number): number =>
  Math.min(
    NARROW.pitchMax,
    Math.max(NARROW.pitchMin, Math.floor((NARROW.width - PAD * 2) / actors)),
  )

function layoutForm(spec: SequenceSpec, variant: SequenceVariant): SequenceLayout {
  const form = FORMS[variant]
  const column = new Map(spec.actors.map((actor, index) => [actor.id, index]))
  const spanOf = (message: Message) =>
    Math.abs((column.get(message.to) ?? 0) - (column.get(message.from) ?? 0))

  const pitch = variant === 'wide' ? widePitch(spec, spanOf) : narrowPitch(spec.actors.length)
  const headerWidth = pitch - form.headerGap
  const centre = (index: number) => PAD + headerWidth / 2 + index * pitch
  // A label beside its loop needs half a pitch past the last lifeline; otherwise the header ends the canvas.
  const width =
    centre(spec.actors.length - 1) + (form.selfLabel === 'beside' ? pitch : headerWidth) / 2 + PAD

  const firstRow = PAD + form.headerHeight + ROW_HEIGHT
  const tailY = firstRow + (spec.messages.length - 1) * ROW_HEIGHT + ROW_HEIGHT / 2
  const labelChars = Math.min(
    form.labelMaxChars,
    Math.floor((width - PAD * 2) / TEXT_METRICS.smallCharWidth),
  )

  return {
    actors: spec.actors.map((actor, index) => ({
      id: actor.id,
      lines: wrapLabel(actor.label, form.headerWrap.maxChars, form.headerWrap.maxLines),
      x: centre(index),
    })),
    header: { height: form.headerHeight, width: headerWidth, y: PAD },
    height: tailY + PAD,
    messages: spec.messages.map((message, index) => {
      const y = firstRow + index * ROW_HEIGHT
      const fromX = centre(column.get(message.from) ?? 0)
      const toX = centre(column.get(message.to) ?? 0)
      const self = fromX === toX
      // The loop climbs from its row, so every mark ends on the row line and the rows keep one rhythm.
      const loopTop = y - SELF_LOOP.height
      const points: Point[] = self
        ? [
            [fromX, loopTop],
            [fromX + SELF_LOOP.width, loopTop],
            [fromX + SELF_LOOP.width, y],
            [fromX, y],
          ]
        : [
            [fromX, y],
            [toX, y],
          ]

      if (self && form.selfLabel === 'beside')
        return {
          index,
          label: {
            anchor: 'start',
            lines: wrapLabel(message.label, labelChars, 2),
            x: fromX + SELF_LOOP.width + 8,
            y: y - SELF_LOOP.height / 2,
          },
          points,
        }

      // Above its mark, held inside the canvas: on a narrow pitch a label outruns the span it names.
      // One line over a loop, which already stands a row's height above the line.
      const lines = wrapLabel(message.label, labelChars, self ? 1 : 2)
      const half = labelWidth(lines) / 2
      const mid = self ? fromX + SELF_LOOP.width / 2 : (fromX + toX) / 2
      return {
        index,
        label: {
          anchor: 'middle',
          lines,
          x: Math.min(Math.max(mid, PAD + half), Math.max(PAD + half, width - PAD - half)),
          y: (self ? loopTop : y) - LABEL_LIFT - (lines.length * SEQUENCE_LINE_HEIGHT) / 2,
        },
        points,
      }
    }),
    tailY,
    width,
  }
}

export const layoutSequence = (spec: SequenceSpec): Record<SequenceVariant, SequenceLayout> => ({
  narrow: layoutForm(spec, 'narrow'),
  wide: layoutForm(spec, 'wide'),
})
