/** @type {import('tailwindcss').Config} */
const config = {
  theme: {
    extend: {
      // Prose headings take the fluid type tokens through `prose-h*:` modifiers
      // in components/RichText. Here prose only gives up its own ink and h1
      // weight, so copy follows the surrounding text color and the 380 base.
      typography: () => ({
        DEFAULT: {
          css: [
            {
              '--tw-prose-body': 'currentColor',
              '--tw-prose-headings': 'currentColor',
              h1: {
                fontWeight: 'inherit',
                marginBottom: '0.25em',
              },
            },
          ],
        },
      }),
    },
  },
}

export default config
