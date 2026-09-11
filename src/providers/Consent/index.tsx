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
      consentCategories: ['necessary', 'measurement', 'marketing'],
      // c15t's stock copy promises personalized content and describes
      // `marketing` as ad targeting. This site does neither: it measures visits
      // (PostHog) and, for US visitors, identifies the company (Reb2b). Consent
      // only counts if it is informed, so the copy says what actually happens.
      // Pinned to English, the site's only language, so no visitor sees the
      // stock wording in a browser-matched translation.
      i18n: {
        locale: 'en',
        detectBrowserLanguage: false,
        messages: {
          en: {
            cookieBanner: {
              description:
                'We use cookies to see how visitors use this site and, for visitors in the United States, to learn which company is visiting. You choose what to allow.',
            },
            consentTypes: {
              marketing: {
                title: 'Business identification',
                description:
                  'Lets a data partner match your visit to the company you work for, and for US visitors possibly to your professional profile, so our team can follow up. Only used in the United States.',
              },
            },
          },
        },
      },
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
