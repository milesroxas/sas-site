'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

/**
 * Open state for the takeover site menu shared by every surface that hosts it
 * (fixed header, demo shell): the trigger ref TakeoverMenu restores focus to,
 * plus auto-close whenever a navigation lands.
 */
export function useTakeoverMenuState() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()

  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the re-run trigger, not a value the effect reads
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return { menuOpen, setMenuOpen, menuButtonRef }
}
