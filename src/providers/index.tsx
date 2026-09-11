import type React from 'react'

import { CustomCursorProvider } from '@/features/cursor'
import { AnalyticsProvider } from './Analytics'
import { ChromeThemeProvider } from './ChromeTheme'
import { ConsentProvider } from './Consent'
import { SmoothScrollProvider } from './SmoothScrollProvider'
import { ThemeProvider } from './Theme'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      {/* ConsentProvider reads useTheme, so it must sit below ThemeProvider. */}
      <ConsentProvider>
        {/* AnalyticsProvider reads useConsentManager, so it must sit below ConsentProvider. */}
        <AnalyticsProvider>
          <ChromeThemeProvider>
            <SmoothScrollProvider>
              <CustomCursorProvider>{children}</CustomCursorProvider>
            </SmoothScrollProvider>
          </ChromeThemeProvider>
        </AnalyticsProvider>
      </ConsentProvider>
    </ThemeProvider>
  )
}
