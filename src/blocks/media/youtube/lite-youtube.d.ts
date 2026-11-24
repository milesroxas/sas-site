import type { DetailedHTMLProps, HTMLAttributes } from 'react'

/**
 * The `lite-youtube` custom element (`lite-youtube-embed`), which has no types
 * of its own. Only the attributes this repo sets are declared; the element
 * reads several more (`js-api`, `posterquality`) that nothing here uses.
 */
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'lite-youtube': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        /** Query string appended to the player URL, e.g. `start=90`. */
        params?: string
        /** Accessible label for the play button, and the player's iframe title. */
        playlabel?: string
        videoid: string
      }
    }
  }
}
