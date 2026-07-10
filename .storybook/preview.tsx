import { withThemeByDataAttribute } from '@storybook/addon-themes'
import type { Preview, ReactRenderer } from '@storybook/nextjs-vite'

import '@/app/(frontend)/globals.css'
// Provides the Geist font variables that RootLayout normally sets via next/font.
import './fonts.css'

const preview: Preview = {
  decorators: [
    // Mirrors the app's theming: `data-theme` on <html> drives the dark
    // variant and the CSS variables in globals.css (see RootLayout).
    withThemeByDataAttribute<ReactRenderer>({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
      attributeName: 'data-theme',
      parentSelector: 'html',
    }),
  ],
  parameters: {
    // The app uses the App Router; components calling next/navigation hooks
    // (e.g. useRouter in Card, FormBlock) need the app-router mock.
    nextjs: { appDirectory: true },
    // Backgrounds are owned by the theme switcher + `bg-background` on <body>.
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // Show axe violations in the a11y panel without failing story renders.
      test: 'todo',
    },
  },
  tags: ['autodocs'],
}

export default preview
