'use client'

import type { DefaultCellComponentProps } from 'payload'
import type { Media } from '@/payload-types'

export function Thumbnail({ cellData }: DefaultCellComponentProps) {
  const media = cellData as Media | null
  const url = media && typeof media === 'object' ? (media.sizes?.thumbnail?.url ?? media.url) : null
  return url ? (
    <img
      src={url}
      alt=""
      width={120}
      height={68}
      style={{ objectFit: 'cover', background: '#090b10', borderRadius: 4 }}
    />
  ) : (
    <span>Draft</span>
  )
}
