import 'lite-youtube-embed/src/lite-yt-embed.css'
import './lite-youtube.css'
import { cn } from '@/utilities/ui'
import { RegisterLiteYouTube } from './register'
import { watchUrl, type YouTubeVideo } from './video'

/**
 * The reliable poster, the one YouTube guarantees for every video. The
 * library would upgrade it to a higher-resolution webp after load, but only
 * when it set the poster itself; setting it here instead means the poster is
 * in the HTML, so it paints with the page and costs no JavaScript.
 */
const posterUrl = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`

/**
 * A YouTube facade: poster, gradient and play button as markup, the player
 * swapped in on click by `lite-youtube-embed`. Server-rendered throughout —
 * the only client code is the custom element definition, and the anchor
 * behind the play button opens the video on YouTube if it never arrives.
 *
 * 16:9 comes from the library's stylesheet, so the frame holds its space
 * before the poster loads.
 */
export const LiteYouTube = ({
  className,
  title,
  video,
}: {
  className?: string
  title?: string | null
  video: YouTubeVideo
}) => {
  const label = title ? `Play ${title}` : 'Play video'
  const params = video.start ? `start=${video.start}` : undefined

  return (
    <>
      <RegisterLiteYouTube />
      <lite-youtube
        className={cn('rounded-lg', className)}
        params={params}
        playlabel={label}
        style={{ backgroundImage: `url("${posterUrl(video.id)}")` }}
        title={title ?? undefined}
        videoid={video.id}
      >
        {/* An anchor, not a button: without the custom element this is still a
            working link to the video. The element rewrites it to a button. */}
        <a className="lyt-playbtn lty-playbtn" href={watchUrl(video)}>
          <span className="lyt-visually-hidden">{label}</span>
        </a>
      </lite-youtube>
    </>
  )
}
