import type React from 'react'
import { ThemeBand } from '@/blocks/shared/section'
import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'
import type {
  Testimonial,
  TestimonialsMarqueeBlock as TestimonialsMarqueeBlockProps,
} from '@/payload-types'
import { TestimonialsMarquee } from './Marquee.client'

// Card surface: theme token with alpha, compositing slightly darker than the
// page background in both themes (dark: tertiary over background; light:
// secondary over background).
const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
  <figure className="flex flex-col gap-10 rounded-xl border border-border bg-secondary/60 p-6 dark:bg-tertiary/50">
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
    <ThemeBand theme={theme}>
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
          <TestimonialsMarquee className="h-[420px] md:h-[540px]" columns={columns} />
        </div>
      </div>
    </ThemeBand>
  )
}
