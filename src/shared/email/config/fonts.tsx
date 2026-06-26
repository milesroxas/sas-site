import { Font } from 'react-email'

/**
 * Inter web font for emails (FSD: **shared**). Render inside `<Head>`.
 *
 * Registers weights 400 / 500 / 600 via `@font-face` (`<Font>`), which webmail clients honor more
 * reliably than `@import`. Clients without web-font support fall back to Arial / sans-serif.
 */
const WEIGHTS = [
  { weight: 400, url: 'UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuOKfMZg' },
  { weight: 500, url: 'UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZg' },
  { weight: 600, url: 'UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZg' },
] as const

export function EmailFonts() {
  return (
    <>
      {WEIGHTS.map(({ weight, url }) => (
        <Font
          key={weight}
          fontFamily="Inter"
          fallbackFontFamily={['Arial', 'sans-serif']}
          webFont={{ url: `https://fonts.gstatic.com/s/inter/v20/${url}.ttf`, format: 'truetype' }}
          fontWeight={weight}
          fontStyle="normal"
        />
      ))}
    </>
  )
}
