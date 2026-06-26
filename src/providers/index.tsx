import type React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { SmoothScrollProvider } from './SmoothScrollProvider'
import { ThemeProvider } from './Theme'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}
