'use client'

import { Thumbnail } from '@payloadcms/ui'
import type { DefaultCellComponentProps } from 'payload'
import { getBestFitFromSizes, isImage } from 'payload/shared'
import type { FC } from 'react'

import './index.scss'

/**
 * Payload only renders list thumbnails on the `filename` column (FileCell).
 * This cell keeps that behavior and adds an immediate Image / Video cue.
 */
export const MediaFilenameCell: FC<DefaultCellComponentProps> = ({
  cellData: filename,
  rowData,
}) => {
  const mimeType = typeof rowData?.mimeType === 'string' ? rowData.mimeType : ''
  const isFileImage = isImage(mimeType)
  const isVideo = mimeType.startsWith('video/')

  let fileSrc: string | undefined = isFileImage
    ? rowData?.thumbnailURL || rowData?.url || undefined
    : rowData?.thumbnailURL || undefined

  if (isFileImage) {
    fileSrc =
      getBestFitFromSizes({
        sizes: rowData?.sizes,
        thumbnailURL: rowData?.thumbnailURL,
        url: rowData?.url,
        width: rowData?.width,
      }) || undefined
  }

  const typeLabel = isVideo ? 'Video' : isFileImage ? 'Image' : 'File'

  return (
    <div className="media-filename-cell">
      <div
        className={[
          'media-filename-cell__preview',
          isVideo && 'media-filename-cell__preview--video',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <Thumbnail
          className="media-filename-cell__thumbnail"
          doc={{
            ...rowData,
            filename,
          }}
          fileSrc={fileSrc}
          imageCacheTag={rowData?.updatedAt}
          size="small"
        />
        {isVideo ? (
          <span aria-hidden className="media-filename-cell__play">
            <svg aria-hidden="true" fill="currentColor" height="10" viewBox="0 0 10 12" width="8">
              <path d="M1 1.2v9.6L9 6 1 1.2Z" />
            </svg>
          </span>
        ) : null}
      </div>
      <div className="media-filename-cell__meta">
        <span className="media-filename-cell__filename">{String(filename ?? '')}</span>
        <span className="media-filename-cell__type">{typeLabel}</span>
      </div>
    </div>
  )
}
