'use client'

import { Thumbnail, useConfig, useListDrawerContext } from '@payloadcms/ui'
import Link from 'next/link'
import type { DefaultCellComponentProps } from 'payload'
import { formatAdminURL, getBestFitFromSizes, isImage } from 'payload/shared'
import type { FC, ReactNode } from 'react'

import './index.scss'

/**
 * Payload only renders list thumbnails on the `filename` column (FileCell).
 * This cell keeps that behavior and adds an immediate Image / Video cue.
 *
 * A custom Cell replaces Payload's RenderDefaultCell entirely, so it must
 * also reproduce the linked-column wrapper: an edit link in list views and
 * an onSelect button inside relationship/upload list drawers — otherwise
 * media pickers show rows that cannot be selected.
 */
export const MediaFilenameCell: FC<DefaultCellComponentProps> = ({
  cellData: filename,
  collectionSlug,
  link,
  linkURL,
  rowData,
}) => {
  const { isInDrawer, onSelect } = useListDrawerContext()
  const {
    config: {
      routes: { admin: adminRoute },
    },
  } = useConfig()

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

  const content = (
    <>
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
    </>
  )

  const wrap = (children: ReactNode) => {
    if (link !== false && isInDrawer && typeof onSelect === 'function') {
      return (
        <button
          className="media-filename-cell media-filename-cell--button"
          onClick={() =>
            onSelect({
              collectionSlug,
              doc: rowData,
              docID: String(rowData.id),
            })
          }
          type="button"
        >
          {children}
        </button>
      )
    }
    if (link) {
      return (
        <Link
          className="media-filename-cell"
          href={
            linkURL ||
            formatAdminURL({
              adminRoute,
              path: `/collections/${collectionSlug}/${encodeURIComponent(String(rowData.id))}`,
            })
          }
          prefetch={false}
        >
          {children}
        </Link>
      )
    }
    return <div className="media-filename-cell">{children}</div>
  }

  return wrap(content)
}
