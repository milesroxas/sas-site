import type React from 'react'
import { ViewTransition } from 'react'
import { Media } from '@/components/Media'
import { resolveOpening, VisualMotionToggle } from '@/features/immersive/visual'
import { HERO_FURNITURE } from '@/heros/furniture'
import { HeroGround, pinnedOpening } from '@/heros/HeroGround'
import type { Post } from '@/payload-types'
import { readingTimeMinutes } from '@/shared/content/reading-time'
import { POST_IMAGE_FRAME, postImageShare, postImageVtName } from '@/shared/lib/view-transition'
import { formatAuthors } from '@/utilities/formatAuthors'
import { cn } from '@/utilities/ui'

const MetaRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between gap-4 border-t border-border py-3">
    <span className={`${HERO_FURNITURE} text-muted-foreground`}>{label}</span>
    <span className={HERO_FURNITURE}>{value}</span>
  </div>
)

/**
 * Post opening: title and standfirst on the page column, a portrait crop
 * beside them, and the article's own facts (who wrote it, how long it runs)
 * pinned to the foot of the copy so the two columns end on the same line.
 *
 * In flow, on the page surface: the frame already offsets the fixed header,
 * so nothing here pulls up under it. An effect chosen on the post grounds the
 * whole band behind the copy and the crop alike; the crop keeps its frame, so
 * a post can carry both.
 */
export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const {
    categories,
    content,
    heroImage,
    meta,
    populatedAuthors,
    shader,
    slug,
    standfirst,
    title,
    visualType,
  } = post

  const kicker = (categories ?? [])
    .filter((category) => typeof category === 'object' && category !== null)
    .map((category) => category.title || 'Untitled category')
    .join(', ')

  const authors = formatAuthors(populatedAuthors ?? [])
  const readingTime = `${readingTimeMinutes(content)} min`

  /**
   * Header art: an effect grounds the band, and the crop is the post's own
   * portrait image, else the SEO image, the asset the insights cards already
   * show for this post, so a post that skips `heroImage` still opens on a
   * picture instead of an empty box. The takeover menu clones whatever lands
   * inside `data-hero-media` (an effect's poster included), so its docked
   * window inherits the same fallback (src/Header/Menu).
   */
  const { ground, media, surface } = resolveOpening(
    { media: heroImage, shader, visualType },
    { fallbackMedia: meta?.image, seedKey: post.id },
  )

  const crop = media && (
    <Media
      fill
      imgClassName="object-cover"
      priority
      resource={media}
      size="(min-width: 64rem) 42vw, 100vw"
    />
  )

  return (
    <header {...pinnedOpening(surface, 'relative isolate overflow-clip')}>
      <HeroGround ground={ground} handoff={!media} />
      {/* The effect is pointer-transparent, so its pause control sits over the
          band it grounds, clear of the copy column. */}
      {ground?.kind === 'streakField' && (
        <VisualMotionToggle className="absolute right-4 bottom-4 z-10" />
      )}
      <div className="container flex flex-col gap-12 py-12 lg:flex-row lg:gap-24">
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-12">
          <div className="flex flex-col gap-6">
            {kicker && <p className={`${HERO_FURNITURE} text-muted-foreground`}>{kicker}</p>}
            <h1 className="text-heading-2">{title}</h1>
            {standfirst && <p className="max-w-xl text-lead text-muted-foreground">{standfirst}</p>}
          </div>

          {/* Narrower than the copy above it: a two-column fact table reads at a
            glance only while the label and its value stay in one eye span. */}
          <div className="flex flex-col lg:w-96">
            {authors && <MetaRow label="Words" value={authors} />}
            <MetaRow label="Reading time" value={readingTime} />
          </div>
        </div>

        {media && (
          // data-hero-media: takeover-menu dissolve source (src/Header/Menu).
          <div
            className={cn(
              POST_IMAGE_FRAME,
              'relative w-full select-none overflow-hidden bg-muted lg:w-5/12 lg:shrink-0',
            )}
            data-hero-media
          >
            {slug ? (
              // Shared element: receives the morph from the clicked post card's
              // image (matching `name` in `Card`). Both sides paint into
              // `POST_IMAGE_FRAME`, so the pair morphs without a crop change.
              <ViewTransition default="none" name={postImageVtName(slug)} share={postImageShare}>
                {crop}
              </ViewTransition>
            ) : (
              crop
            )}
          </div>
        )}
      </div>
    </header>
  )
}
