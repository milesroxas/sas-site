import { gsap } from 'gsap'
import type { CarouselApi } from '@/components/ui/carousel'
import type { DissolveMap } from './filters'

/** Poster dissolve: peak displacement (px) and duration (s). */
const DISSOLVE_SCALE = 90
const DISSOLVE_DURATION = 0.9

/** Poster overlay lifecycle — animated only on state change, never re-triggered. */
type PosterState = 'covered' | 'revealing' | 'revealed' | 'covering'

export type SlideRefs = {
  node: HTMLElement
  video: HTMLVideoElement | null
  poster: HTMLElement | null
  posterState: PosterState
}

/** Read a slide's animation targets off its embla slide node. */
export const collectSlideRefs = (slideNode: HTMLElement): SlideRefs | null => {
  const node = slideNode.firstElementChild as HTMLElement | null
  if (!node) return null
  return {
    node,
    video: slideNode.querySelector('video'),
    poster: slideNode.querySelector<HTMLElement>('[data-carousel-poster]'),
    posterState: 'covered',
  }
}

type ContextSafe = (fn: (refs: SlideRefs) => void) => (refs: SlideRefs) => void

type PlaybackOptions = {
  api: NonNullable<CarouselApi>
  contextSafe: ContextSafe
  dissolveId: string
  dissolveMap: DissolveMap
  getSlideRefs: () => (SlideRefs | null)[]
  reducedMotion: boolean
}

const isCovered = (refs: SlideRefs): boolean =>
  refs.posterState === 'covered' || refs.posterState === 'covering'

const isRevealed = (refs: SlideRefs): boolean =>
  refs.posterState === 'revealed' || refs.posterState === 'revealing'

const playVideo = (video: HTMLVideoElement): void => {
  video.play().catch((error) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[carousel] video play failed', error)
    }
  })
}

/**
 * Drives the active slide's video playback and the poster overlays.
 *
 * Keyed off `settle` (never `select`, which fires mid-drag and would thrash
 * poster fades): the active slide's video plays once frames exist while its
 * poster melts through the displacement filter; deselected videos pause and
 * their posters fade back. Reveals wait for frames — otherwise the poster
 * would melt into a black rectangle.
 */
export const createPlaybackController = ({
  api,
  contextSafe,
  dissolveId,
  dissolveMap,
  getSlideRefs,
  reducedMotion,
}: PlaybackOptions) => {
  // The page-load reveal skips the displacement melt: on a static page it
  // reads as a smoke glitch — it only makes sense paired with slide motion.
  let hasRevealedOnce = false
  const pendingCanplay = new Map<HTMLVideoElement, () => void>()

  const finishReveal = (refs: SlideRefs, poster: HTMLElement) => () => {
    poster.style.filter = ''
    dissolveMap.current?.setAttribute('scale', '0')
    refs.posterState = 'revealed'
  }

  const dissolvePoster = (poster: HTMLElement, onComplete: () => void): void => {
    const proxy = { scale: 0 }
    poster.style.filter = `url(#${dissolveId})`
    gsap
      .timeline({
        onUpdate: () => {
          dissolveMap.current?.setAttribute('scale', proxy.scale.toFixed(1))
        },
        onComplete,
      })
      .to(proxy, { scale: DISSOLVE_SCALE, duration: DISSOLVE_DURATION, ease: 'power2.in' }, 0)
      .to(poster, { autoAlpha: 0, duration: DISSOLVE_DURATION, ease: 'power2.inOut' }, 0)
  }

  const revealPoster = contextSafe((refs: SlideRefs) => {
    const { poster } = refs
    if (!poster) return
    const plainFade = reducedMotion || !hasRevealedOnce
    hasRevealedOnce = true
    refs.posterState = 'revealing'
    gsap.killTweensOf(poster)
    const onComplete = finishReveal(refs, poster)
    if (plainFade) {
      gsap.to(poster, { autoAlpha: 0, duration: 0.5, ease: 'power1.out', onComplete })
    } else {
      dissolvePoster(poster, onComplete)
    }
  })

  const coverPoster = contextSafe((refs: SlideRefs) => {
    const { poster } = refs
    if (!poster) return
    refs.posterState = 'covering'
    gsap.killTweensOf(poster)
    poster.style.filter = ''
    gsap.to(poster, {
      autoAlpha: 1,
      duration: 0.25,
      ease: 'power1.out',
      onComplete: () => {
        refs.posterState = 'covered'
      },
    })
  })

  const revealWhenReady = (refs: SlideRefs, video: HTMLVideoElement, index: number): void => {
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      if (isCovered(refs)) revealPoster(refs)
      return
    }
    if (pendingCanplay.has(video)) return
    // play() on a not-ready video starts the fetch; reveal once frames arrive.
    const onCanPlay = () => {
      pendingCanplay.delete(video)
      if (api.selectedScrollSnap() === index) revealPoster(refs)
    }
    pendingCanplay.set(video, onCanPlay)
    video.addEventListener('canplay', onCanPlay, { once: true })
  }

  const activateSlide = (refs: SlideRefs, index: number): void => {
    const { video } = refs
    if (!video) return
    if (video.paused) playVideo(video)
    revealWhenReady(refs, video, index)
  }

  const deactivateSlide = (refs: SlideRefs): void => {
    const { video } = refs
    if (!video) return
    if (!video.paused) video.pause()
    if (isRevealed(refs)) coverPoster(refs)
  }

  const syncVideos = (): void => {
    const selected = api.selectedScrollSnap()
    getSlideRefs().forEach((refs, index) => {
      if (!refs) return
      if (index === selected) {
        activateSlide(refs, index)
      } else {
        deactivateSlide(refs)
      }
    })
  }

  const dispose = (): void => {
    pendingCanplay.forEach((handler, video) => {
      video.removeEventListener('canplay', handler)
    })
    pendingCanplay.clear()
  }

  return { dispose, syncVideos }
}
