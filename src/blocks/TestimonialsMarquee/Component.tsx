import type React from 'react'
import { Section } from '@/blocks/shared/section'
import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'
import type {
  Testimonial,
  TestimonialsMarqueeBlock as TestimonialsMarqueeBlockProps,
} from '@/payload-types'
import { cn } from '@/utilities/ui'
import { TestimonialsMarquee } from './Marquee.client'

// Card surface: theme token with alpha, compositing slightly darker than the
// page background in both themes (dark: tertiary over background; light:
// secondary over background). Width is the caller's — the rail sizes cards to
// the swipe, the marquee lets them fill their lane.
const TestimonialCard = ({
  className,
  testimonial,
}: {
  className?: string
  testimonial: Testimonial
}) => (
  <figure
    className={cn(
      'flex flex-col gap-6 rounded-xl border border-border bg-secondary/60 p-5 md:p-6 lg:gap-10 dark:bg-tertiary/50',
      className,
    )}
  >
    <blockquote>
      <RichText
        className="text-sm leading-relaxed"
        data={testimonial.quote}
        enableGutter={false}
        enableProse={false}
        variant="emphasis"
      />
    </blockquote>
    <figcaption className="mt-auto text-xs font-medium text-foreground">
      {testimonial.speakerOrganization || testimonial.speakerName}
    </figcaption>
  </figure>
)

export const TestimonialsMarqueeBlock: React.FC<TestimonialsMarqueeBlockProps> = ({
  links,
  richText,
  testimonials,
  theme,
}) => {
  // Same public gate as the Work Pages testimonial block.
  const approved = (testimonials || []).filter(
    (item): item is Testimonial =>
      typeof item === 'object' &&
      item._status === 'published' &&
      item.approvalStatus === 'approved-public',
  )
  if (!approved.length) return null

  const laneCount = approved.length > 1 ? 2 : 1
  const columns = Array.from({ length: laneCount }, (_, lane) =>
    approved
      .filter((_, index) => index % laneCount === lane)
      .map((testimonial) => <TestimonialCard key={testimonial.id} testimonial={testimonial} />),
  )

  return (
    <Section theme={theme}>
      <div className="container">
        {/* Narrower than the site container by design — the marquee reads as a framed panel. */}
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl">
            {richText && (
              <RichText
                className="text-heading-3 leading-snug [&_p+p]:mt-4"
                data={richText}
                enableGutter={false}
                enableProse={false}
                variant="emphasis"
              />
            )}
            {(links || []).length > 0 && (
              <div className="mt-8 flex flex-wrap gap-4">
                {(links || []).map(({ link, id }) => (
                  <CMSLink key={id} {...link} />
                ))}
              </div>
            )}
          </div>
          {/* Below `lg` the quotes are the block's content, not its texture, so
              they stop moving: a swipeable rail bleeding to both screen edges,
              one card per snap with the next peeking as the affordance. Reading
              needs the card to hold still — an auto-scrolling row leaves every
              quote clipped at one edge or the other.

              A labelled `section`, not a div, because a scrollable region needs
              a name. No `tabIndex` — Chrome and Firefox make overflow containers
              keyboard-focusable on their own, and every quote is in the DOM
              regardless of scroll position, so focus and screen readers bring
              their own card into view.

              `data-lenis-prevent-horizontal`: root Lenis runs `syncTouch`, so it
              calls preventDefault on every touchmove and drives the page itself —
              a sideways swipe in here would never reach the browser, and its
              vertical component would scroll the page instead. The attribute
              releases only the gestures Lenis reads as horizontal, so panning the
              rail is native (momentum, rubber-band, snap) while an up/down swipe
              started on a card still smooth-scrolls the page.

              `snap-recede` on each card weights the row: the card being read is
              full, the one peeking in sits back. It runs on the card's own view
              timeline, so the swipe scrubs it — the peek is a card on its way in
              rather than a clipped one. */}
          <section
            aria-label="Client testimonials"
            className="no-scrollbar -mx-gutter flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-ps-gutter pe-gutter ps-gutter md:gap-6 lg:hidden"
            data-lenis-prevent-horizontal
          >
            {approved.map((testimonial) => (
              <TestimonialCard
                className="w-4/5 shrink-0 snap-start snap-always snap-recede md:w-2/5"
                key={testimonial.id}
                testimonial={testimonial}
              />
            ))}
          </section>
          <TestimonialsMarquee className="hidden lg:block lg:h-[540px]" columns={columns} />
        </div>
      </div>
    </Section>
  )
}
