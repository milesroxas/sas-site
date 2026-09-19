import type { SequenceSpec } from '../spec/diagram'
import { TEXT_METRICS, textWidth, wrapLabel } from './text'

/**
 * Sequence layout is arithmetic: actors sit on an even pitch, messages step
 * down one row each. Cheap and deterministic, so it is computed at render and
 * never stored (only graph layouts need an engine, see `./graph`).
 */

const HEADER_HEIGHT = 44
const HEADER_WRAP = { maxChars: 16, maxLines: 2 }
/** Two label lines above the arrow, then air before the next message. */
const ROW_HEIGHT = 60
const PAD = 8
const LABEL_GAP = 24
/** A message label wraps to two lines, which is what bounds the widest pitch a column can need. */
const MESSAGE_WRAP = { maxChars: 40, maxLines: 2 }
const PITCH_MIN = 148
/** How far a self message loops out from its lifeline. */
export const SELF_LOOP = { height: 20, width: 36 }

export type SequenceLayout = {
  actors: { id: string; lines: string[]; x: number }[]
  header: { height: number; width: number }
  height: number
  messages: { fromX: number; index: number; lines: string[]; toX: number; y: number }[]
  /** Where the lifelines end. */
  tailY: number
  width: number
}

export function layoutSequence(spec: SequenceSpec): SequenceLayout {
  const column = new Map(spec.actors.map((actor, index) => [actor.id, index]))
  const spanOf = (message: SequenceSpec['messages'][number]) =>
    Math.abs((column.get(message.to) ?? 0) - (column.get(message.from) ?? 0))

  const labels = spec.messages.map((message) =>
    wrapLabel(message.label, MESSAGE_WRAP.maxChars, MESSAGE_WRAP.maxLines),
  )
  // One pitch for every column: wide enough that the longest label fits the
  // span it sits over. A self message reads beside its loop, inside one pitch.
  const pitch = Math.max(
    PITCH_MIN,
    ...spec.messages.map((message, index) => {
      const lines = labels[index] ?? []
      const width =
        Math.max(...lines.map((line) => textWidth(line, TEXT_METRICS.smallCharWidth))) + LABEL_GAP
      const span = spanOf(message)
      return span === 0 ? width + SELF_LOOP.width : width / span
    }),
  )

  const headerWidth = pitch - LABEL_GAP
  const centre = (index: number) => PAD + headerWidth / 2 + index * pitch
  const firstRow = PAD + HEADER_HEIGHT + ROW_HEIGHT
  const tailY = firstRow + (spec.messages.length - 1) * ROW_HEIGHT + ROW_HEIGHT / 2

  return {
    actors: spec.actors.map((actor, index) => ({
      id: actor.id,
      lines: wrapLabel(actor.label, HEADER_WRAP.maxChars, HEADER_WRAP.maxLines),
      x: centre(index),
    })),
    header: { height: HEADER_HEIGHT, width: headerWidth },
    height: tailY + PAD,
    messages: spec.messages.map((message, index) => ({
      fromX: centre(column.get(message.from) ?? 0),
      index,
      lines: labels[index] ?? [],
      toX: centre(column.get(message.to) ?? 0),
      y: firstRow + index * ROW_HEIGHT,
    })),
    tailY,
    // The last column still needs room for a self message's label beside it.
    width: centre(spec.actors.length - 1) + pitch / 2 + PAD,
  }
}
