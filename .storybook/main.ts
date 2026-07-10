import type { StorybookConfig } from '@storybook/nextjs-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-themes'],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
  staticDirs: ['../public'],
  core: {
    disableTelemetry: true,
  },
  viteFinal: async (config) => {
    const { mergeConfig } = await import('vite')
    return mergeConfig(config, {
      resolve: {
        alias: [
          // App components use React experimental APIs (e.g. <ViewTransition> in
          // Card/PostHero) that only exist in the React build Next.js vendors.
          // Resolve the same copy so stories run against the app's actual runtime.
          { find: /^react$/, replacement: 'next/dist/compiled/react' },
          { find: /^react\/jsx-runtime$/, replacement: 'next/dist/compiled/react/jsx-runtime' },
          {
            find: /^react\/jsx-dev-runtime$/,
            replacement: 'next/dist/compiled/react/jsx-dev-runtime',
          },
          { find: /^react-dom$/, replacement: 'next/dist/compiled/react-dom' },
          { find: /^react-dom\/client$/, replacement: 'next/dist/compiled/react-dom/client' },
        ],
      },
    })
  },
}

export default config
