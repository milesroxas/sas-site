'use client'

import { IconMoon, IconSun } from '@tabler/icons-react'
import type React from 'react'
import { useEffect, useState } from 'react'

import { useTheme } from '@/providers/Theme'
import { cn } from '@/utilities/ui'

type ThemeToggleProps = {
  className?: string
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, setTheme } = useTheme()
  /* Theme resolves client-side from the DOM, so gate the toggle icon on mount
     to keep server and hydration renders identical. */
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <button
      type="button"
      aria-label={mounted && theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={cn(
        'pressable inline-flex size-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:opacity-70',
        className,
      )}
    >
      {mounted && theme === 'dark' ? (
        <IconSun className="size-4" />
      ) : (
        <IconMoon className="size-4" />
      )}
    </button>
  )
}
