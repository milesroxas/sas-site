import type React from 'react'

import { CustomCursorProvider } from '@/features/cursor'
import { AnalyticsProvider } from './Analytics'
import { ConsentProvider } from './Consent'
import { HeaderThemeProvider } from './HeaderTheme'
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
          <HeaderThemeProvider>
            <SmoothScrollProvider>
              <CustomCursorProvider>{children}</CustomCursorProvider>
            </SmoothScrollProvider>
          </HeaderThemeProvider>
        </AnalyticsProvider>
      </ConsentProvider>
    </ThemeProvider>
  )
}
