'use client'

import { useMemo, useRef, useState } from 'react'
import { MediaShowcaseGrid } from '@/blocks/shared/media-showcase-grid'
import { BAND_SPACING } from '@/blocks/shared/section'
import { Container } from '@/components/Container'
import RichText from '@/components/RichText'
import { ScrollGallery, type ScrollGalleryItem, type ScrollGalleryMood } from '@/features/immersive'
import { useDeviceDetection } from '@/hooks/use-device-detection'
import type { Media as MediaDoc } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { webglMediaSrc } from '@/utilities/webglMediaSrc'

export type ScrollGalleryEntry = {
  id: string
  media: MediaDoc
  mood: Partial<ScrollGalleryMood>
}

/**
 * The pinned shell: the track is one screenful per item, so each step of
 * scroll walks the camera to the next plane.
 */
export const SCROLL_GALLERY_PIN = {
  /** Scroll depth (svh) each item consumes. */
  stepSvh: 100,
} as const

const padIndex = (index: number) => String(index + 1).padStart(2, '0')

/** Scroll track height: the first item's screenful plus one step per further item. */
const trackHeight = (count: number) =>
  `calc(100svh + ${Math.max(0, count - 1) * SCROLL_GALLERY_PIN.stepSvh}svh)`

/**
 * Full-viewport scroll gallery. The canvas is pinned for one screenful per
 * item while the camera dollies through the planes; the eyebrow/heading stay
 * put top-left and a counter plus the focused item's caption sit bottom-left.
 *
 * Without a GPU (or under reduced motion) the same items render as a stacked
 * media list on the shared band rhythm, so the content is never lost.
 */
export function ScrollGalleryClient({
  entries,
  eyebrow,
  heading,
}: {
  entries: ScrollGalleryEntry[]
  eyebrow?: string | null
  heading?: string | null
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const { hasGPU } = useDeviceDetection()
  const [active, setActive] = useState(0)

  const items = useMemo<ScrollGalleryItem[]>(
    () =>
      entries.map((entry) => ({
        src: webglMediaSrc(entry.media),
        video: Boolean(entry.media.mimeType?.includes('video')),
        mood: entry.mood,
      })),
    [entries],
  )

  if (!hasGPU) {
    return (
      <Container className={BAND_SPACING.loose}>
        <GalleryCopy eyebrow={eyebrow} heading={heading} />
        <MediaShowcaseGrid
          layout="stacked"
          media={entries.map((entry) => entry.media)}
          showCaptions
        />
      </Container>
    )
  }

  const focused = entries[active] ?? entries[0]

  return (
    <div className="relative" ref={trackRef} style={{ height: trackHeight(entries.length) }}>
      <div className="sticky top-0 h-svh overflow-hidden">
        <ScrollGallery items={items} pinRef={trackRef} onActiveChange={setActive} />

        {/* DOM overlay: pinned copy and the focus readout. Pointer events pass
            through so page scroll and the custom cursor behave as on any band. */}
        <Container className="pointer-events-none relative flex h-full flex-col justify-between pt-(--header-height) pb-8 md:pb-12">
          <GalleryCopy eyebrow={eyebrow} heading={heading} />
          <div className="flex items-end justify-between gap-8">
            <div className="max-w-md text-sm text-foreground/80" aria-live="polite">
              {focused?.media.caption ? (
                <RichText data={focused.media.caption} enableGutter={false} enableProse={false} />
              ) : (
                focused?.media.alt
              )}
            </div>
            <p className="font-mono text-xs/none text-muted-foreground tabular-nums">
              {padIndex(active)}
              <span className="mx-1 opacity-50">/</span>
              {padIndex(entries.length - 1)}
            </p>
          </div>
        </Container>
      </div>
    </div>
  )
}

const GalleryCopy = ({ eyebrow, heading }: { eyebrow?: string | null; heading?: string | null }) =>
  eyebrow || heading ? (
    <div className={cn('flex max-w-2xl flex-col gap-4')}>
      {eyebrow ? (
        <p className="font-mono text-xs/none font-medium text-muted-foreground">{eyebrow}</p>
      ) : null}
      {heading ? <h2 className="text-heading-2 font-light text-foreground">{heading}</h2> : null}
    </div>
  ) : (
    <div />
  )
