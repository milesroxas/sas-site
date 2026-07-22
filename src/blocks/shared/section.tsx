import type { ReactNode } from 'react'
import { cn } from '@/utilities/ui'

export const themeClasses = {
  light: 'bg-white text-black',
  dark: 'bg-black text-white',
  neutral: 'bg-neutral-100 text-neutral-950',
  brand: 'bg-amber-300 text-neutral-950',
}

export type SectionTheme = keyof typeof themeClasses

/** Shared vertical-rhythm + theme wrapper used across block families. */
export const Section = ({
  children,
  theme = 'light',
  className,
}: {
  children: ReactNode
  theme?: SectionTheme | null
  className?: string
}) => (
  <section className={cn('py-16 md:py-24', themeClasses[theme || 'light'], className)}>
    {children}
  </section>
)
