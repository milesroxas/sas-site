import type { SelectField } from 'payload'

/**
 * Block surface select shared by every block family. Values map to
 * `themeClasses` in `./section.tsx` — keep the two in sync.
 */
export const themeField = (name = 'theme'): SelectField => ({
  name,
  type: 'select',
  defaultValue: 'light',
  options: ['light', 'dark', 'neutral', 'brand'],
  admin: {
    description:
      'Section surface within the visitor\'s site theme. Does not force light/dark mode — "dark" is a contrasted band in whichever theme the visitor chose.',
  },
})
