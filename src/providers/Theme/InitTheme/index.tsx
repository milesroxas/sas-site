import type React from 'react'

import { defaultTheme, themeLocalStorageKey } from '../shared'

/**
 * Resolves the visitor's theme and stamps `data-theme` on `<html>` before the
 * document body is parsed, so the first paint is already the right palette.
 *
 * Stored preference wins; otherwise the OS `prefers-color-scheme` decides;
 * otherwise the site default. Kept as a string rather than shared helpers
 * because it has to run standalone, ahead of any bundle.
 */
const THEME_INIT_SCRIPT = `
  (function () {
    function getImplicitPreference() {
      var mediaQuery = '(prefers-color-scheme: dark)'
      var mql = window.matchMedia(mediaQuery)
      var hasImplicitPreference = typeof mql.matches === 'boolean'

      if (hasImplicitPreference) {
        return mql.matches ? 'dark' : 'light'
      }

      return null
    }

    function themeIsValid(theme) {
      return theme === 'light' || theme === 'dark'
    }

    var themeToSet = '${defaultTheme}'
    var preference = window.localStorage.getItem('${themeLocalStorageKey}')

    if (themeIsValid(preference)) {
      themeToSet = preference
    } else {
      var implicitPreference = getImplicitPreference()

      if (implicitPreference) {
        themeToSet = implicitPreference
      }
    }

    document.documentElement.setAttribute('data-theme', themeToSet)
  })();
`

/**
 * The theme bootstrap, inlined into `<head>` as a plain `<script>` — not
 * `next/script`.
 *
 * `next/script strategy="beforeInteractive"` emits no executable tag in the App
 * Router: it renders a `self.__next_s` push that Next's runtime replays once
 * the framework bundle loads. The attribute would land after first paint, so
 * the wrong theme flashes — and because that push is itself a `<script>`
 * element in the React tree, any client render of it trips React 19's
 * "Encountered a script tag while rendering React component" error (scripts
 * React creates on the client never execute).
 *
 * A plain inline script runs during head parsing, ahead of the body, and on the
 * client React hydrates the tag already in the HTML rather than creating one.
 * `<html>` carries `suppressHydrationWarning` in the root layout, which covers
 * the attribute this writes.
 */
export const InitTheme: React.FC = () => {
  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: inline theme bootstrap; no user input
      dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
      id="theme-script"
    />
  )
}
