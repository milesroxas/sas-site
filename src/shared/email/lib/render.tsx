import type { ReactElement } from 'react'
import { render } from 'react-email'

/**
 * Render any email element to both HTML and plain-text (accessibility + deliverability).
 */
export async function renderEmail(email: ReactElement) {
  const [html, text] = await Promise.all([render(email), render(email, { plainText: true })])
  return { html, text }
}
