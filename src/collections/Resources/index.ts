import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOr } from '../../access/authenticatedOr'

/**
 * Files visitors download: guides, templates, decks, archives. Any file type,
 * which is why this is not Media: Media is the image and video library, with
 * image sizes, focal points, alt text and posters that mean nothing for a PDF
 * or a zip.
 *
 * Objects live in the same R2 bucket as Media under the `resources/` prefix
 * (`payload.config.ts`), so a resource can never overwrite an image of the
 * same name. The download block links the R2 custom domain directly, so the
 * bytes never pass through a Vercel function.
 *
 * Every file is served as a download, never rendered: see `modifyResponseHeaders`
 * below and `hooks/attachmentDisposition.ts`. Any type is accepted, within
 * Payload's own upload checks: executables, HTML and scripts are refused
 * (`allowRestrictedFileTypes` stays off) and SVGs are scanned.
 *
 * `usageStatus` hides a resource from the API and the site, not its bytes: the
 * object is public on the media domain to anyone who has the URL. Keep
 * confidential files out of Resources.
 *
 * Same visibility contract as Media: anonymous visitors and MCP keys only see
 * `public-approved` resources, and the download block renders nothing for any
 * other status.
 */
export const Resources: CollectionConfig = {
  slug: 'resources',
  labels: { singular: 'Resource', plural: 'Resources' },
  admin: {
    group: 'Assets',
    useAsTitle: 'title',
    defaultColumns: ['filename', 'title', 'usageStatus', 'updatedAt'],
    description: 'Downloadable files of any type, offered on insights and lab pages.',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOr({ usageStatus: { equals: 'public-approved' } }),
    update: authenticated,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description:
          'What the reader gets, e.g. "Layered design workbook". The download block shows it unless the block sets its own heading.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description:
          'One or two sentences on what is inside. The download block shows it unless the block sets its own.',
      },
    },
    {
      name: 'usageStatus',
      type: 'select',
      required: true,
      defaultValue: 'public-approved',
      options: ['internal', 'client-review', 'public-approved'],
      admin: {
        position: 'sidebar',
        description: 'Visitors only see public-approved resources.',
      },
    },
  ],
  // No `mimeTypes`: any file type is accepted. No image sizes or crop: an
  // image uploaded here is a file to hand over, not a picture to render.
  upload: {
    crop: false,
    focalPoint: false,
    // Payload's file route (`/api/resources/file/…`, local dev and any caller
    // without the CDN host) serves from the site's own origin, so it must
    // never render an uploaded file: always a download, never sniffed into
    // another type, and sandboxed with no script if a browser opens it anyway.
    // R2 serves the same `attachment` header from object metadata
    // (`hooks/attachmentDisposition.ts`).
    modifyResponseHeaders: ({ headers }) => {
      headers.set('Content-Disposition', 'attachment')
      headers.set('X-Content-Type-Options', 'nosniff')
      headers.set('Content-Security-Policy', "sandbox; default-src 'none'")
      return headers
    },
  },
}
