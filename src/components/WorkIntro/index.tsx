import type React from 'react'
import { Container } from '@/blocks/shared/container'
import RichText from '@/components/RichText'
import type { WorkIntro as WorkIntroData } from '@/payload-types'
import { WorkIntroSection } from './Section.client'

type Props = {
  eyebrow?: WorkIntroData['eyebrow']
  title: WorkIntroData['title']
  /** Website-only rich-text override; wins over the canonical summary. */
  body?: WorkIntroData['bodyOverride']
  /** Canonical case-study summary from the Content Hub. Blank lines split paragraphs. */
  summary?: string | null
}

/**
 * Full-screen introduction band placed right after the work hero: statement
 * title on the left, eyebrow plus the canonical case-study summary offset on
 * the right. All type is regular weight by design.
 */
export const WorkIntro: React.FC<Props> = ({ eyebrow, title, body, summary }) => (
  <WorkIntroSection>
    <Container width="standard" className="grid gap-8 md:grid-cols-2 lg:grid-cols-12">
      <h2
        className="max-w-xl font-heading text-4xl/10 font-normal tracking-tight text-balance lg:col-span-5"
        data-intro-title
      >
        {title}
      </h2>
      <div className="flex flex-col gap-8 pt-20 md:pt-32 lg:col-span-5 lg:col-start-8 lg:pt-20">
        {eyebrow ? (
          <p className="text-base/none font-normal" data-intro-eyebrow>
            {eyebrow}
          </p>
        ) : null}
        {body || summary ? (
          <div className="max-w-lg text-xl/7 lg:text-2xl/8 [&_p+p]:mt-6" data-intro-body>
            {body ? (
              <RichText data={body} enableGutter={false} enableProse={false} />
            ) : (
              summary
                ?.split(/\n\s*\n/)
                .map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)
            )}
          </div>
        ) : null}
      </div>
    </Container>
  </WorkIntroSection>
)
