import type { SiteInfo } from '@/payload-types'

/**
 * Site Info's structured address as the lines of a postal block: street on
 * the first line, "City, ST Postal" on the second. Missing parts drop out
 * rather than leaving stray punctuation, and the country is omitted: it is
 * there for the Organization JSON-LD, not for a reader who already knows
 * which country the studio is in.
 */
export const formatPostalAddress = (address: SiteInfo['address']): string[] => {
  const street = address?.streetAddress?.trim()
  const locality = [address?.city?.trim(), address?.state?.trim()].filter(Boolean).join(', ')
  const region = [locality, address?.postalCode?.trim()].filter(Boolean).join(' ')

  return [street, region].filter((line): line is string => Boolean(line))
}
