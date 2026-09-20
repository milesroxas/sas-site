'use client'

import { type PointerEvent, type RefObject, useRef } from 'react'

/** A flick this fast (px/ms) dismisses however short the drag was. */
const DISMISS_VELOCITY = 0.11
/** A slow drag dismisses once the sheet is this far down its own height. */
const DISMISS_FRACTION = 0.35
/** Upward drag past the rest position moves this much of the finger's travel. */
const OVERDRAG_FRICTION = 0.15
/** The site's settle curve (`--ease-out-quint`); WAAPI cannot read the token. */
const SETTLE_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'

/**
 * Drag a bottom sheet down to dismiss it. Bound to the sheet's handle zone,
 * never its list, so a drag and a scroll cannot be confused.
 *
 * The finger moves the sheet 1:1 through the independent `translate`
 * property, written straight to the element: it cannot collide with the
 * slide keyframes (those animate `transform`) and no React render sits
 * between the pointer and the pixels. Release decides on velocity first, so a
 * quick flick is enough, and the run-out is timed from that velocity so the
 * sheet leaves at the speed it was thrown. Below the threshold it settles
 * back. `onDismiss` runs once the sheet is off screen; the caller closes
 * without an exit animation, because the exit has already been played.
 */
export function useSheetDrag(sheetRef: RefObject<HTMLElement | null>, onDismiss: () => void) {
  const drag = useRef<{ pointerId: number; startY: number; startTime: number } | null>(null)

  const offset = (event: PointerEvent, startY: number) => {
    const delta = event.clientY - startY
    return delta < 0 ? delta * OVERDRAG_FRICTION : delta
  }

  const release = (event: PointerEvent) => {
    const sheet = sheetRef.current
    const active = drag.current
    if (!sheet || !active || event.pointerId !== active.pointerId) return
    drag.current = null

    const travelled = offset(event, active.startY)
    const height = sheet.offsetHeight
    const velocity = travelled / Math.max(event.timeStamp - active.startTime, 1)
    const dismiss =
      event.type === 'pointerup' &&
      travelled > 0 &&
      (velocity > DISMISS_VELOCITY || travelled > height * DISMISS_FRACTION)

    const from = `0 ${travelled}px`
    // Off screen with room for the sheet's own bottom inset.
    const to = dismiss ? '0 calc(100% + 2rem)' : '0 0'
    const remaining = dismiss ? height - travelled : Math.abs(travelled)
    const duration = dismiss
      ? Math.min(Math.max(remaining / Math.max(velocity, 0.5), 120), 260)
      : 300

    sheet.style.removeProperty('translate')
    const animation = sheet.animate(
      { translate: [from, to] },
      { duration, easing: SETTLE_EASING, fill: dismiss ? 'forwards' : 'none' },
    )
    if (dismiss) animation.finished.then(onDismiss, () => {})
  }

  return {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      // One finger owns the drag; a second touch must not re-anchor it.
      if (drag.current || !event.isPrimary || event.button !== 0) return
      drag.current = {
        pointerId: event.pointerId,
        startY: event.clientY,
        startTime: event.timeStamp,
      }
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      const active = drag.current
      if (event.pointerId !== active?.pointerId) return
      sheetRef.current?.style.setProperty('translate', `0 ${offset(event, active.startY)}px`)
    },
    onPointerUp: release,
    onPointerCancel: release,
  }
}
