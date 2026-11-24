/**
 * YouTube links as an editor pastes them. One parser so the field's
 * validation, the block, and the rich text converter all read a link the same
 * way, and so nothing downstream ever handles a raw URL: every consumer takes
 * the video id, which is the only thing the embed needs.
 */

export type YouTubeVideo = {
  /** The video id, as YouTube writes it (11 url-safe characters). */
  id: string
  /** Seconds into the video playback starts, when the link carried a time. */
  start?: number
}

const VIDEO_ID = /^[\w-]{11}$/

/** Hosts a YouTube link can arrive on, including the share and no-cookie ones. */
const HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'youtu.be',
  'www.youtu.be',
])

/** Paths that carry the id in the next segment: /embed/ID, /shorts/ID, … */
const ID_IN_PATH = new Set(['embed', 'shorts', 'live', 'v'])

const SECONDS = /^(\d+)s?$/
const DURATION = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/

/**
 * The `t` (or `start`) parameter in either form YouTube writes: plain seconds
 * from the player's share panel (`90`, `90s`) or a duration from a hand-typed
 * link (`1h2m3s`). Anything else is dropped rather than guessed at — a start
 * time is a convenience, never a reason to reject a good link.
 */
const parseStart = (value: string | null): number | undefined => {
  if (!value) return undefined

  const seconds = SECONDS.exec(value)
  if (seconds) {
    const total = Number.parseInt(seconds[1], 10)
    return total > 0 ? total : undefined
  }

  const duration = DURATION.exec(value)
  if (!duration) return undefined
  const [, hours, minutes, secs] = duration
  if (!hours && !minutes && !secs) return undefined
  const total =
    Number.parseInt(hours ?? '0', 10) * 3600 +
    Number.parseInt(minutes ?? '0', 10) * 60 +
    Number.parseInt(secs ?? '0', 10)
  return total > 0 ? total : undefined
}

/** The id a YouTube URL carries, by the shape of the link. */
const idFromUrl = (url: URL): string | undefined => {
  const segments = url.pathname.split('/').filter(Boolean)
  const host = url.hostname.toLowerCase()

  if (host.endsWith('youtu.be')) return segments[0]
  if (segments[0] === 'watch') return url.searchParams.get('v') ?? undefined
  if (segments[0] && ID_IN_PATH.has(segments[0])) return segments[1]
  return undefined
}

/**
 * A YouTube link (or a bare id) as `{ id, start }`, or `null` when the input
 * is not one. Accepts every form YouTube hands out — watch, youtu.be, shorts,
 * live, embed — with or without a scheme, and ignores the tracking parameters
 * the share panel appends.
 */
export const parseYouTube = (input: string | null | undefined): YouTubeVideo | null => {
  const raw = input?.trim()
  if (!raw) return null
  if (VIDEO_ID.test(raw)) return { id: raw }

  let url: URL
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
  } catch {
    return null
  }
  if (!HOSTS.has(url.hostname.toLowerCase())) return null

  const id = idFromUrl(url)
  if (!id || !VIDEO_ID.test(id)) return null

  const start = parseStart(url.searchParams.get('t') ?? url.searchParams.get('start'))
  return start ? { id, start } : { id }
}

/** The public watch page for a video: the no-JS fallback behind the play button. */
export const watchUrl = ({ id, start }: YouTubeVideo): string =>
  `https://www.youtube.com/watch?v=${id}${start ? `&t=${start}` : ''}`
