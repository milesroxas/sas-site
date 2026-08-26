import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { Media as MediaDoc } from '@/payload-types'
import { cn } from '@/utilities/ui'

const ShowcaseFigure = ({
  item,
  reveal,
  showCaptions,
  showCredits,
}: {
  item: MediaDoc
  reveal: boolean
  showCaptions?: boolean | null
  showCredits?: boolean | null
}) => (
  <figure className="snap-start" data-reveal={reveal ? 'media' : undefined}>
    <Media resource={item} imgClassName="h-auto w-full" />
    {showCaptions && item.caption && (
      <RichText
        className="mt-3 text-sm"
        data={item.caption}
        enableGutter={false}
        enableProse={false}
      />
    )}
    {showCredits && item.credit && (
      <figcaption className="mt-2 text-xs opacity-70">Credit: {item.credit}</figcaption>
    )}
  </figure>
)

/**
 * Grid of showcase media with optional captions and credits, shared by the
 * case-study and lab gallery blocks. `reveal` opts the figures into the
 * scroll-reveal choreography — set on surfaces wrapped in a RevealSection.
 */
export function MediaShowcaseGrid({
  layout,
  media,
  reveal = false,
  showCaptions,
  showCredits,
}: {
  layout?: string | null
  media: MediaDoc[]
  reveal?: boolean
  showCaptions?: boolean | null
  showCredits?: boolean | null
}) {
  return (
    <div
      className={cn(
        'grid gap-6',
        layout === 'grid' && 'md:grid-cols-2',
        layout === 'horizontal' && 'grid-flow-col auto-cols-[85%] overflow-x-auto snap-x',
      )}
    >
      {media.map((item) => (
        <ShowcaseFigure
          item={item}
          key={item.id}
          reveal={reveal}
          showCaptions={showCaptions}
          showCredits={showCredits}
        />
      ))}
    </div>
  )
}

/** Public-approved media documents from a block's media field, in order. */
export const publicApprovedMedia = (media: unknown[] | null | undefined): MediaDoc[] =>
  (media ?? []).filter(
    (item): item is MediaDoc =>
      typeof item === 'object' &&
      item !== null &&
      'usageStatus' in item &&
      (item as MediaDoc).usageStatus === 'public-approved',
  )
