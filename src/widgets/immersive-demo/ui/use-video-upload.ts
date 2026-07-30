'use client'

import { useStoreContext } from 'leva'
import { useCallback, useEffect, useRef } from 'react'

/** Hard cap for playground video files — keeps decode and GPU upload snappy. */
export const MAX_VIDEO_BYTES = 10 * 1024 * 1024

/**
 * Video picker for demo playgrounds. Prompts for a video file (10 MB max),
 * wraps it in a blob URL, and writes it into the surrounding DemoSection's
 * leva store — the URL at `urlPath`, plus 'video' at `mediaPath` so the panel
 * switches modes. The file never leaves the browser: no upload, no storage,
 * no server cost. Blob URLs are revoked when the playground unmounts (not on
 * replace, which could cut off an element still streaming the old blob).
 */
export function useVideoUpload({ urlPath, mediaPath }: { urlPath: string; mediaPath: string }) {
  const store = useStoreContext()
  const blobUrlsRef = useRef<string[]>([])

  useEffect(
    () => () => {
      for (const url of blobUrlsRef.current) URL.revokeObjectURL(url)
      blobUrlsRef.current = []
    },
    [],
  )

  return useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'video/mp4,video/webm'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      if (file.size > MAX_VIDEO_BYTES) {
        window.alert('Video is too large — 10 MB max.')
        return
      }
      const url = URL.createObjectURL(file)
      blobUrlsRef.current.push(url)
      store.setValueAtPath(urlPath, url, false)
      store.setValueAtPath(mediaPath, 'video', false)
    }
    input.click()
  }, [store, urlPath, mediaPath])
}
