'use client'

import { ConsentDialogLink } from '@c15t/nextjs'
import type React from 'react'

/**
 * Client boundary for c15t's dialog trigger so server components (e.g. the
 * footer) can offer a way to reopen the consent dialog after first choice.
 */
export const CookiePreferencesLink: React.FC<{
  className?: string
  children?: React.ReactNode
}> = ({ className, children }) => {
  return (
    <ConsentDialogLink className={className}>{children ?? 'Cookie preferences'}</ConsentDialogLink>
  )
}
