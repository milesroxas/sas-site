import type { Resource } from '@/payload-types'
import { getCdnMediaUrl } from '@/utilities/getMediaUrl'

type ResourceFile = Pick<Resource, '_objectKey' | 'filename' | 'prefix' | 'url'>

/**
 * Where the file downloads from: the R2 custom domain when one is configured
 * (edge cached, bytes never touch Vercel), else Payload's file route, which is
 * what local development without a CDN host serves.
 *
 * The object key is the storage plugin's: the collection `prefix`, then the
 * per-upload `_objectKey` segment when the plugin wrote one, then the filename.
 */
export const resourceHref = (resource: ResourceFile): string => {
  if (!resource.filename) return resource.url || ''
  const key = [resource.prefix, resource._objectKey, resource.filename].filter(Boolean).join('/')
  return getCdnMediaUrl(key) || resource.url || ''
}

/**
 * Short type label for the button and meta line: the file extension when the
 * name has one ("PDF", "ZIP", "FIG"), else the MIME subtype, else nothing.
 * Extensions are what readers recognise; MIME types are not ("vnd.openxml…").
 */
export const fileTypeLabel = (resource: Pick<Resource, 'filename' | 'mimeType'>): string => {
  const extension = resource.filename?.match(/\.([a-z0-9]{1,8})$/i)?.[1]
  if (extension) return extension.toUpperCase()
  const subtype = resource.mimeType?.split('/')[1]
  return subtype && /^[a-z0-9]{1,8}$/i.test(subtype) ? subtype.toUpperCase() : ''
}

const UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const

/**
 * "2.4 MB", "640 kB", "512 bytes". Empty when the size is unknown. Bytes take
 * the long unit: the short one is the singular "byte" at every count.
 */
export const formatFileSize = (bytes: number | null | undefined): string => {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes < 0) return ''
  let value = bytes
  let unit = 0
  while (value >= 1000 && unit < UNITS.length - 1) {
    value /= 1000
    unit += 1
  }
  return new Intl.NumberFormat('en', {
    maximumFractionDigits: unit === 0 || value >= 100 ? 0 : 1,
    style: 'unit',
    unit: UNITS[unit],
    unitDisplay: unit === 0 ? 'long' : 'short',
  }).format(value)
}

/**
 * The resource when a visitor may have it: populated (not a bare id) and
 * public-approved. A page fetched with drafts, or a pick whose status changed
 * after the page was saved, gets `null` and renders nothing.
 */
export const downloadableResource = (resource: number | Resource | null | undefined) =>
  resource && typeof resource === 'object' && resource.usageStatus === 'public-approved'
    ? resource
    : null
