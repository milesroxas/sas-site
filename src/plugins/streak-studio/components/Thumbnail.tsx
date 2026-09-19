'use client'

import { Link, useConfig } from '@payloadcms/ui'
import type { DefaultCellComponentProps } from 'payload'
import { STUDIO_GROUND } from '@/features/immersive/studio/effect'
import type { Media } from '@/payload-types'

/**
 * Poster cell for the look list. A custom Cell replaces Payload's default
 * cell wholesale, so when it lands in the first (linked) column it has to
 * render the row link itself or the row stops opening on click.
 */
export function Thumbnail({
  cellData,
  collectionSlug,
  link,
  linkURL,
  rowData,
}: DefaultCellComponentProps) {
  const {
    config: {
      routes: { admin: adminRoute },
    },
  } = useConfig()
  const media = cellData as Media | null
  const url = media && typeof media === 'object' ? (media.sizes?.thumbnail?.url ?? media.url) : null
  const content = url ? (
    // biome-ignore lint/performance/noImgElement: admin-only list cell; next/image is not loaded in the Payload admin
    <img
      src={url}
      alt=""
      width={120}
      height={68}
      style={{ objectFit: 'cover', background: STUDIO_GROUND.dark, borderRadius: 4 }}
    />
  ) : (
    <span>Draft</span>
  )

  if (!link || !rowData?.id) return content

  return (
    <Link
      href={
        linkURL ??
        `${adminRoute}/collections/${collectionSlug}/${encodeURIComponent(String(rowData.id))}`
      }
      prefetch={false}
    >
      {content}
    </Link>
  )
}
