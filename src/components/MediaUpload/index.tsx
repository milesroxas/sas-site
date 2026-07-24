'use client'

import { Upload, useDocumentInfo, useField } from '@payloadcms/ui'
import type { SanitizedCollectionConfig } from 'payload'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import './index.scss'

/**
 * Payload's stock Upload passes `fileSrc` to Thumbnail only for images
 * (`isImage(mime)`), so a freshly selected video shows the generic file glyph.
 * Extract a still in the browser and paint it into the thumbnail slot until
 * save, when the server-generated poster takes over via `adminThumbnail`.
 */
async function extractPosterFromVideoFile(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file)
  const video = document.createElement('video')
  video.muted = true
  video.playsInline = true
  video.preload = 'auto'
  video.src = objectUrl

  try {
    await new Promise<void>((resolve, reject) => {
      video.addEventListener('loadeddata', () => resolve(), { once: true })
      video.addEventListener(
        'error',
        () => reject(new Error('Browser could not decode video for poster preview')),
        { once: true },
      )
    })

    // Slightly past 0 avoids an all-black first sample on some encodes.
    const seekTo = Math.min(0.1, Number.isFinite(video.duration) ? video.duration * 0.05 : 0.1)
    if (seekTo > 0) {
      video.currentTime = seekTo
      await new Promise<void>((resolve, reject) => {
        video.addEventListener('seeked', () => resolve(), { once: true })
        video.addEventListener(
          'error',
          () => reject(new Error('Browser could not seek video for poster preview')),
          { once: true },
        )
      })
    }

    const width = video.videoWidth
    const height = video.videoHeight
    if (!width || !height) {
      throw new Error('Video has no display dimensions')
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Canvas 2D context unavailable')
    }
    ctx.drawImage(video, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.9)
    })
    if (!blob) {
      throw new Error('Failed to encode poster preview')
    }

    return URL.createObjectURL(blob)
  } finally {
    video.removeAttribute('src')
    video.load()
    URL.revokeObjectURL(objectUrl)
  }
}

export function MediaUpload() {
  const { collectionSlug, docConfig, initialState } = useDocumentInfo()
  const { value } = useField<File>({ path: 'file' })
  const rootRef = useRef<HTMLDivElement>(null)
  const [posterSrc, setPosterSrc] = useState<string | null>(null)
  const [thumbnailHost, setThumbnailHost] = useState<Element | null>(null)

  useEffect(() => {
    let cancelled = false
    let generatedUrl: string | null = null

    setPosterSrc(null)

    const run = async () => {
      if (!(value instanceof File) || !value.type.startsWith('video/')) return

      try {
        const url = await extractPosterFromVideoFile(value)
        if (cancelled) {
          URL.revokeObjectURL(url)
          return
        }
        generatedUrl = url
        setPosterSrc(url)
      } catch {
        // Leave Payload's default file icon if the browser cannot decode the file.
      }
    }

    void run()

    return () => {
      cancelled = true
      if (generatedUrl) URL.revokeObjectURL(generatedUrl)
    }
  }, [value])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || !posterSrc) {
      setThumbnailHost(null)
      return
    }

    const findHost = () => root.querySelector('.file-field__thumbnail-wrap .thumbnail')

    const host = findHost()
    if (host) {
      setThumbnailHost(host)
      return
    }

    const frame = requestAnimationFrame(() => {
      setThumbnailHost(findHost())
    })
    return () => cancelAnimationFrame(frame)
  }, [posterSrc])

  const uploadConfig =
    docConfig && 'upload' in docConfig
      ? (docConfig.upload as SanitizedCollectionConfig['upload'])
      : undefined

  if (!collectionSlug || !uploadConfig) {
    return null
  }

  return (
    <div
      className={posterSrc ? 'media-upload media-upload--video-poster' : 'media-upload'}
      ref={rootRef}
    >
      <Upload
        collectionSlug={collectionSlug}
        initialState={initialState}
        uploadConfig={uploadConfig}
      />
      {thumbnailHost &&
        posterSrc &&
        createPortal(
          // biome-ignore lint/performance/noImgElement: blob: preview URLs are not valid next/image sources
          <img alt="" className="media-upload__poster" src={posterSrc} />,
          thumbnailHost,
        )}
    </div>
  )
}
