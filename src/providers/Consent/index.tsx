'use client'

import {
  ConsentBanner,
  ConsentDialog,
  type ConsentManagerOptions,
  ConsentManagerProvider,
} from '@c15t/nextjs'
import type React from 'react'
import { useMemo } from 'react'
import { useTheme } from '@/providers/Theme'

const backendURL = process.env.NEXT_PUBLIC_C15T_URL

export const ConsentProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const { theme } = useTheme()

  const options = useMemo<ConsentManagerOptions>(
    () => ({
      // Hosted mode (consent.io backend) when configured; otherwise consent
      // lives in the browser only (no audit trail or geo-based targeting).
      ...(backendURL ? { mode: 'hosted' as const, backendURL } : { mode: 'offline' as const }),
      consentCategories: ['necessary', 'measurement'],
      // c15t only auto-detects a `.dark` class; this site signals dark mode
      // via `data-theme`, so feed it the theme from our own provider.
      colorScheme: theme ?? 'system',
    }),
    [theme],
  )

  return (
    <ConsentManagerProvider options={options}>
      <ConsentBanner />
      <ConsentDialog />
      {children}
    </ConsentManagerProvider>
  )
}
