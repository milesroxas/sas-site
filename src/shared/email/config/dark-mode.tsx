/**
 * Dark-mode treatment for emails (FSD: **shared**). Render inside `<Head>`.
 *
 * Declares the email as dark-mode aware (`color-scheme`) so Apple/iOS Mail don't force a blanket
 * inversion, then provides an intentional dark theme via `@media (prefers-color-scheme: dark)`:
 * surfaces, text and the CTA are restyled and the wordmark swaps to its white variant — together,
 * so the logo never lands on a mismatched background. The class hooks (`email-*`) are applied by
 * `TransactionalEmail`. Clients that ignore media queries (Outlook, Gmail) keep the light design.
 */
const DARK_MODE_CSS = `
:root { color-scheme: light dark; supported-color-schemes: light dark; }
@media (prefers-color-scheme: dark) {
  .email-body { background-color: #0B0D11 !important; }
  .email-panel { background-color: #14171E !important; }
  .email-card { background-color: #1C2027 !important; }
  .email-fg { color: #F4F5F7 !important; }
  .email-fg-2 { color: #C2C4C9 !important; }
  .email-fg-3 { color: #8C8F95 !important; }
  .email-btn { background-color: #F4F5F7 !important; color: #14171E !important; }
  .email-logo-light { display: none !important; }
  .email-logo-dark { display: block !important; }
}
`

export function EmailColorScheme() {
  return (
    <>
      <meta name="color-scheme" content="light dark" />
      <meta name="supported-color-schemes" content="light dark" />
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: a raw <style> with @media (prefers-color-scheme) is the only way to express a dark-mode swap; no React Email primitive covers it */}
      <style dangerouslySetInnerHTML={{ __html: DARK_MODE_CSS }} />
    </>
  )
}
