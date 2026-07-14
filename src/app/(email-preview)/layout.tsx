import type { ReactNode } from 'react'

/**
 * Bare root layout for the newsletter email preview: the page renders an email document inside
 * an iframe, so none of the site chrome (header, footer, canvas, fonts) belongs here.
 */
export default function EmailPreviewLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
