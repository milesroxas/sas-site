'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { cn } from '@/utilities/ui'

/** Both studio locations are Eastern; the label (EST/EDT) tracks DST via Intl. */
const TIME_ZONE = 'America/New_York'

const formatTime = (date: Date): string => {
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: TIME_ZONE,
    timeZoneName: 'short',
  }).formatToParts(date)
  const part = (type: Intl.DateTimeFormatPart['type']) =>
    parts.find((p) => p.type === type)?.value ?? ''

  return `${part('hour')}:${part('minute')}${part('dayPeriod').toLowerCase()} ${part('timeZoneName')}`
}

export const Clock: React.FC<{ className?: string }> = ({ className }) => {
  // Starts null so server and first client render agree; time appears on mount.
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    const update = () => setTime(formatTime(new Date()))
    update()

    // Align updates to the minute boundary; background tabs throttle timers,
    // so also refresh when the tab becomes visible again.
    let interval: ReturnType<typeof setInterval> | undefined
    const timeout = setTimeout(
      () => {
        update()
        interval = setInterval(update, 60_000)
      },
      60_000 - (Date.now() % 60_000),
    )

    document.addEventListener('visibilitychange', update)

    return () => {
      clearTimeout(timeout)
      if (interval) clearInterval(interval)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  if (!time) return null

  return (
    <span className={cn('flex items-center gap-2 font-mono text-sm text-foreground', className)}>
      {/* Status green from the design — legible on both light and dark backgrounds. */}
      <span aria-hidden className="size-2 rounded-full bg-[#33952A]" />
      {time}
    </span>
  )
}
