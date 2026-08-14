'use client'

import { button } from 'leva'
import { useState } from 'react'
import {
  DEMO_IMAGE_SRC,
  DEMO_VIDEO_SRC,
  useDemoAction,
  useDemoControls,
  useDemoSnippet,
  useVideoUpload,
} from '@/shared/ui/demo-kit'
import {
  ScrollReveal,
  SCROLL_REVEAL_TRIGGER_DEFAULTS as TRIGGER,
  SCROLL_REVEAL_UNDER_MEDIA as UNDER_MEDIA,
} from '@/shared/ui/scroll-reveal'
import { cn } from '@/utilities/ui'
import { revealTrackBars, TrackDiagram } from './reveal-track-diagram'
import { useEaseControl } from './use-ease-control'

/** Diagram labels mirror the preview markup so it plots the real target list. */
const TEXT_LABELS = ['heading', 'body', 'caption']

const LAYOUTS = ['stacked', 'image-left', 'image-right']

/**
 * Demo content: the complete under-media reveal — the entrance for copy paired
 * with an image or video — with every one of its values wired to the
 * surrounding DemoSection's GUI: its own text tuning, the windowed mask wipe
 * (content settles down from a zoom behind the clipped frame), and the offset
 * that syncs or sequences the two tracks. The preview swaps between stacked
 * and side-by-side layouts and takes any image or video, like the immersive
 * demos. Copy replaces the whole const. Demo-only.
 */
export function ScrollRevealUnderMediaPlayground() {
  const [replayKey, setReplayKey] = useState(0)

  const pickVideo = useVideoUpload({ urlPath: 'Preview.videoUrl', mediaPath: 'Preview.media' })
  const { layout, media, image, videoUrl } = useDemoControls('Preview', {
    layout: { value: 'stacked', options: LAYOUTS },
    media: { value: 'image', options: ['image', 'video'] },
    image: {
      image: undefined,
      label: 'upload',
      render: (get) => get('Preview.media') === 'image',
    },
    videoUrl: {
      value: DEMO_VIDEO_SRC,
      label: 'video url',
      render: (get) => get('Preview.media') === 'video',
    },
    // leva buttons ignore `render`, so this stays visible in image mode too;
    // picking a file flips the media select to video.
    'upload video (≤10 MB)': button(pickVideo),
  })

  const { textY, textBlurPx, textDuration, stagger } = useDemoControls('Text', {
    textY: { value: UNDER_MEDIA.textY, min: 0, max: 120, step: 1, label: 'drop (px)' },
    textBlurPx: { value: UNDER_MEDIA.textBlurPx, min: 0, max: 24, step: 1, label: 'blur (px)' },
    textDuration: {
      value: UNDER_MEDIA.textDuration,
      min: 0.2,
      max: 3,
      step: 0.05,
      label: 'duration',
    },
    stagger: { value: UNDER_MEDIA.stagger, min: 0, max: 0.5, step: 0.01, label: 'stagger (s)' },
  })
  const textEase = useEaseControl('Text', UNDER_MEDIA.textEase)

  const { mediaDuration, mediaScaleFrom } = useDemoControls('Media', {
    mediaDuration: {
      value: UNDER_MEDIA.mediaDuration,
      min: 0.2,
      max: 3,
      step: 0.05,
      label: 'duration',
    },
    mediaScaleFrom: {
      value: UNDER_MEDIA.mediaScaleFrom,
      min: 1,
      max: 1.5,
      step: 0.01,
      label: 'scale from',
    },
  })
  const mediaEase = useEaseControl('Media', UNDER_MEDIA.mediaEase)

  const { mediaOffset } = useDemoControls('Sync', {
    mediaOffset: {
      value: UNDER_MEDIA.mediaOffset,
      min: -1.5,
      max: 1.5,
      step: 0.05,
      label: 'media offset (s)',
    },
  })

  const { enterThreshold } = useDemoControls('Trigger', {
    enterThreshold: {
      value: TRIGGER.enterThreshold,
      min: 0,
      max: 1,
      step: 0.05,
      label: 'visible fraction',
    },
  })

  useDemoAction('replay', () => setReplayKey((n) => n + 1))

  // Copy replaces SCROLL_REVEAL_UNDER_MEDIA wholesale; the trigger gate has
  // its own const in the same file (SCROLL_REVEAL_TRIGGER_DEFAULTS) —
  // transcribe it if you tune it.
  useDemoSnippet({
    textY,
    textBlurPx,
    textDuration,
    textEase,
    stagger,
    mediaDuration,
    mediaEase,
    mediaScaleFrom,
    mediaOffset,
  })

  const isVideo = media === 'video' && Boolean(videoUrl)
  const src = isVideo ? videoUrl : (image ?? DEMO_IMAGE_SRC)
  const sideBySide = layout !== 'stacked'

  // The wrapper is the reveal's window: the timeline wipes its clip mask while
  // the img/video inside (its first element child) scales down to rest.
  const mediaFigure = (
    <div
      className={cn(
        'overflow-hidden rounded-md bg-muted',
        sideBySide ? 'aspect-4/5' : 'aspect-video',
        layout === 'image-right' && 'md:order-2',
      )}
      data-reveal="media"
    >
      {isVideo ? (
        <video autoPlay className="size-full object-cover" loop muted playsInline src={src} />
      ) : (
        // biome-ignore lint/performance/noImgElement: blob: upload URLs are not valid next/image sources
        <img alt="" className="size-full object-cover" src={src} />
      )}
    </div>
  )

  return (
    <>
      <ScrollReveal
        as="div"
        className="relative overflow-hidden rounded-md bg-background px-5 py-12 sm:px-8 sm:py-16 md:px-14"
        enterThreshold={enterThreshold}
        key={layout}
        mediaDuration={mediaDuration}
        mediaEase={mediaEase}
        mediaOffset={mediaOffset}
        mediaScaleFrom={mediaScaleFrom}
        replayKey={replayKey}
        stagger={stagger}
        textBlurPx={textBlurPx}
        textDuration={textDuration}
        textEase={textEase}
        textY={textY}
        variant="underMedia"
      >
        <div
          className={
            sideBySide ? 'grid gap-6 md:grid-cols-2 md:items-center' : 'mx-auto max-w-xl space-y-4'
          }
        >
          {mediaFigure}
          <div className="space-y-4">
            <h3 className="text-balance text-2xl font-normal sm:text-3xl" data-reveal>
              Copy that sits with the image
            </h3>
            <p
              className="text-pretty text-sm/relaxed text-muted-foreground sm:text-base/relaxed"
              data-reveal
            >
              The wipe leads and the text track starts on the offset — pull it negative to let the
              media breathe first, push it past the media duration to go fully sequential.
            </p>
            <p className="font-mono text-xs text-muted-foreground" data-reveal>
              variant=&quot;underMedia&quot; — windowed mask reveal, text on its own track
            </p>
          </div>
        </div>
      </ScrollReveal>
      <TrackDiagram
        bars={revealTrackBars({
          textLabels: TEXT_LABELS,
          stagger,
          textDuration,
          media: { label: 'media', duration: mediaDuration, offset: mediaOffset },
        })}
      />
    </>
  )
}
