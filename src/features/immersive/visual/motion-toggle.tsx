'use client'

import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/utilities/ui'
import { useMotionPaused } from './hooks'

/**
 * Temporarily off: the floating per-effect button reads as a stray control.
 * A single site-chrome toggle replaces it later; flip this to restore.
 */
const MOTION_TOGGLE_ENABLED = false

/**
 * Pause and resume for sustained automatic motion (WCAG 2.2.2). One switch
 * for the document, so pausing a hero also parks every other live field.
 * Hidden under `prefers-reduced-motion`, where nothing animates to pause.
 * Owners place it wherever it is reachable: inside an in-flow frame, or in
 * the copy layer when the field is a background behind pointer-transparent
 * chrome.
 */
export function VisualMotionToggle({ className }: { className?: string }) {
  const [paused, setPaused] = useMotionPaused()
  const reducedMotion = usePrefersReducedMotion()
  if (!MOTION_TOGGLE_ENABLED || reducedMotion) return null
  const Icon = paused ? IconPlayerPlay : IconPlayerPause
  return (
    <button
      aria-label={paused ? 'Play background motion' : 'Pause background motion'}
      aria-pressed={paused}
      className={cn(
        'pointer-events-auto inline-flex size-9 items-center justify-center rounded-full',
        'bg-background/70 text-foreground/70 backdrop-blur-sm transition-colors',
        'hover:text-foreground focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        className,
      )}
      data-visual-motion-toggle
      onClick={() => setPaused(!paused)}
      type="button"
    >
      <Icon aria-hidden size={18} stroke={1.75} />
    </button>
  )
}
