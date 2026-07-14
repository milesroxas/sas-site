/**
 * Emails are opened outside the site, so every URL they contain must be absolute.
 * Payload media URLs are origin-relative (`/api/media/file/…`); prefix those with the
 * public origin and pass already-absolute URLs through untouched.
 */
export function absoluteUrl(baseUrl: string, url: string): string {
  if (/^https?:\/\//.test(url)) return url
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
}
