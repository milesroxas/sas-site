import type React from 'react'

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
        <HeaderThemeProvider>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </HeaderThemeProvider>
      </ConsentProvider>
    </ThemeProvider>
  )
}
