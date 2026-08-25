'use client'

import { button } from 'leva'
import { useDemoControls } from './demo-controls'
import { DEMO_IMAGE_SRC, DEMO_VIDEO_SRC } from './demo-media'
import { useVideoUpload } from './use-video-upload'

/**
 * The shared "Media" GUI folder for effect playgrounds — an image/video mode
 * select, an image upload, a video URL field, and a local video upload that
 * flips the mode — resolved into the `src` / `isVideo` pair the effect
 * components take. `initial` picks the starting mode and leads the select's
 * option order.
 */
export function useDemoMediaSource(initial: 'image' | 'video' = 'image'): {
  src: string
  isVideo: boolean
} {
  const pickVideo = useVideoUpload({ urlPath: 'Media.videoUrl', mediaPath: 'Media.media' })
  const { media, image, videoUrl } = useDemoControls('Media', {
    media: {
      value: initial,
      options: initial === 'video' ? ['video', 'image'] : ['image', 'video'],
    },
    image: {
      image: undefined,
      label: 'upload',
      render: (get) => get('Media.media') === 'image',
    },
    videoUrl: {
      value: DEMO_VIDEO_SRC,
      label: 'video url',
      render: (get) => get('Media.media') === 'video',
    },
    // leva buttons ignore `render`, so this stays visible in image mode too;
    // picking a file flips the media select to video.
    'upload video (≤10 MB)': button(pickVideo),
  })

  const isVideo = media === 'video' && Boolean(videoUrl)
  return { src: isVideo ? videoUrl : (image ?? DEMO_IMAGE_SRC), isVideo }
}
