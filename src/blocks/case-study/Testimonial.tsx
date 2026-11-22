import { isPublicTestimonial } from '@/blocks/shared/public-testimonial'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { CaseStudyTestimonialBlock, Media as MediaDoc, Testimonial } from '@/payload-types'
import { populatedDoc } from '@/utilities/relationshipId'
import { RevealSection } from './RevealSection.client'

export const TestimonialBlock = ({
  block,
  testimonial,
}: {
  block: CaseStudyTestimonialBlock
  testimonial: Testimonial | null
}) => {
  if (!isPublicTestimonial(testimonial)) return null
  const portrait = block.showPortrait ? populatedDoc<MediaDoc>(testimonial.portrait) : null
  return (
    <RevealSection theme={block.theme} variant={portrait ? 'underMedia' : 'intro'}>
      <figure className="container mx-auto max-w-4xl text-center">
        {portrait && (
          <div data-reveal="media">
            <Media className="mx-auto mb-6 w-24 overflow-hidden rounded-full" resource={portrait} />
          </div>
        )}
        <blockquote data-reveal>
          <RichText
            className="text-heading leading-snug [&_p+p]:mt-4"
            data={testimonial.quote}
            enableGutter={false}
            enableProse={false}
          />
        </blockquote>
        <figcaption className="mt-6" data-reveal>
          <strong>{testimonial.speakerName}</strong>
          {testimonial.speakerRole && `, ${testimonial.speakerRole}`}
          {testimonial.speakerOrganization && `, ${testimonial.speakerOrganization}`}
        </figcaption>
      </figure>
    </RevealSection>
  )
}
