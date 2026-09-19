import type { TimelineSpec } from '../spec/diagram'
import { TEXT_METRICS, textWidth, wrapLabel } from './text'

/**
 * Timeline layout is arithmetic, computed at render like `./sequence`. Two
 * forms: a proportional horizontal axis with labels stacked into lanes so no
 * two ever overlap, and an evenly stepped vertical run for narrow frames,
 * where proportional spacing would crush a busy month into one pixel row.
 */

const WIDTH = 960
const PAD = 12
const LABEL_WRAP = { maxChars: 20, maxLines: 2 }
const LANE_HEIGHT = 56
const LABEL_GAP = 12
/** Strip above the lanes for era labels, and below them for the range dates. */
const STRIP = 28
const NARROW = { eraRow: 36, eventRow: 64, width: 320 }

const DAY = 86_400_000
const toTime = (date: string): number => Date.parse(`${date}T00:00:00Z`)

const dateFormat = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
})
export const formatDate = (date: string): string => dateFormat.format(toTime(date))

type Placed = { index: number; lines: string[] }

export type TimelineLayout = {
  narrow: {
    height: number
    rows: ({ kind: 'era' | 'event'; y: number } & Placed)[]
    width: number
  }
  wide: {
    axisY: number
    eras: { index: number; label: string | null; width: number; x: number }[]
    events: (Placed & {
      /** Top of the label block; the leader runs from here to the axis. */
      labelY: number
      /** Centre of the label block, kept inside the canvas. */
      labelX: number
      side: 'above' | 'below'
      x: number
    })[]
    height: number
    width: number
  }
}

/**
 * First lane whose last label ends before this one starts. Lanes alternate
 * above and below the axis (0 above, 1 below, 2 above, ...) and grow without a
 * cap, so a dense cluster gets taller instead of overlapping.
 */
const assignLane = (laneEnds: number[], left: number, right: number): number => {
  const free = laneEnds.findIndex((end) => end + LABEL_GAP <= left)
  const lane = free === -1 ? laneEnds.length : free
  laneEnds[lane] = right
  return lane
}

function layoutWide(spec: TimelineSpec): TimelineLayout['wide'] {
  const start = toTime(spec.range.start)
  const span = Math.max(DAY, toTime(spec.range.end) - start)
  const xOf = (date: string) => PAD + ((toTime(date) - start) / span) * (WIDTH - PAD * 2)

  const laneEnds: number[] = []
  const placed = spec.events
    .map((event, index) => ({ event, index }))
    .sort((a, b) => toTime(a.event.at) - toTime(b.event.at))
    .map(({ event, index }) => {
      const lines = wrapLabel(event.label, LABEL_WRAP.maxChars, LABEL_WRAP.maxLines)
      const width = Math.max(
        ...lines.map((line) => textWidth(line)),
        textWidth(event.ref ?? '', TEXT_METRICS.smallCharWidth),
      )
      const x = xOf(event.at)
      const labelX = Math.min(WIDTH - PAD - width / 2, Math.max(PAD + width / 2, x))
      const lane = assignLane(laneEnds, labelX - width / 2, labelX + width / 2)
      return { index, labelX, lane, lines, x }
    })

  const above = Math.ceil(laneEnds.length / 2)
  const below = Math.floor(laneEnds.length / 2)
  const axisY = STRIP + above * LANE_HEIGHT + LABEL_GAP

  return {
    axisY,
    eras: (spec.eras ?? []).map((era, index) => {
      const x = xOf(era.start)
      const width = xOf(era.end) - x
      const [line] = wrapLabel(era.label, Math.floor(width / TEXT_METRICS.smallCharWidth) - 2, 1)
      // A band too thin for three characters keeps its label for the list view only.
      return { index, label: line && line.length >= 3 ? line : null, width, x }
    }),
    events: placed.map(({ index, labelX, lane, lines, x }) => {
      const depth = Math.floor(lane / 2)
      const side = lane % 2 === 0 ? 'above' : 'below'
      return {
        index,
        labelX,
        labelY:
          side === 'above'
            ? axisY - LABEL_GAP - (depth + 1) * LANE_HEIGHT
            : axisY + LABEL_GAP + depth * LANE_HEIGHT,
        lines,
        side,
        x,
      }
    }),
    height: axisY + LABEL_GAP + below * LANE_HEIGHT + STRIP,
    width: WIDTH,
  }
}

function layoutNarrow(spec: TimelineSpec): TimelineLayout['narrow'] {
  const events = spec.events
    .map((event, index) => ({ event, index }))
    .sort((a, b) => toTime(a.event.at) - toTime(b.event.at))
  const opened = new Set<number>()
  const rows: TimelineLayout['narrow']['rows'] = []
  let y = PAD

  for (const { event, index } of events) {
    // An era is announced once, ahead of the first event that falls inside it.
    spec.eras?.forEach((era, eraIndex) => {
      if (opened.has(eraIndex) || event.at < era.start || event.at > era.end) return
      opened.add(eraIndex)
      rows.push({ index: eraIndex, kind: 'era', lines: [era.label], y })
      y += NARROW.eraRow
    })
    rows.push({ index, kind: 'event', lines: wrapLabel(event.label, 30, 2), y })
    y += NARROW.eventRow
  }
  return { height: y + PAD, rows, width: NARROW.width }
}

export const layoutTimeline = (spec: TimelineSpec): TimelineLayout => ({
  narrow: layoutNarrow(spec),
  wide: layoutWide(spec),
})
