/** @type {import('tailwindcss').Config} */
const config = {
  theme: {
    extend: {
      typography: () => ({
        DEFAULT: {
          css: [
            {
              '--tw-prose-body': 'var(--text)',
              '--tw-prose-headings': 'var(--text)',
              h1: {
                fontWeight: 'var(--heading-weight)',
                marginBottom: '0.25em',
              },
            },
          ],
        },
        // Rich-text headings ride the same fluid scale as the rest of the
        // site (tokens in globals.css @theme) — no breakpoint variants needed.
        base: {
          css: [
            {
              h1: {
                fontSize: 'var(--text-heading-2)',
                lineHeight: 'var(--text-heading-2--line-height)',
                letterSpacing: 'var(--text-heading-2--letter-spacing)',
              },
              h2: {
                fontSize: 'var(--text-heading-3)',
                lineHeight: 'var(--text-heading-3--line-height)',
                fontWeight: 'var(--heading-weight)',
              },
            },
          ],
        },
      }),
    },
  },
}

export default config
