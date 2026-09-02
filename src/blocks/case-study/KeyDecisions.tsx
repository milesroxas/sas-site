import RichText from '@/components/RichText'
import type { CaseStudy, CaseStudyKeyDecisionsBlock } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { RevealSection } from './RevealSection.client'

export type CaseStudyKeyDecision = NonNullable<CaseStudy['keyDecisions']>[number]

/**
 * The decisions a case study wants credited, as cards or a single column.
 * Which of the study's decisions qualify is the renderer's call — this
 * renders every one it is given, and nothing when there are none.
 */
export const KeyDecisions = ({
  block,
  decisions,
}: {
  block: CaseStudyKeyDecisionsBlock
  decisions: CaseStudyKeyDecision[]
}) => {
  if (!decisions.length) return null
  return (
    <RevealSection theme={block.theme} variant="intro">
      <div className="container mx-auto">
        <h2 className="mb-8 text-heading-2" data-reveal>
          {block.heading || 'Key decisions'}
        </h2>
        {block.introduction && (
          <div data-reveal>
            <RichText className="mb-10 max-w-3xl" data={block.introduction} enableGutter={false} />
          </div>
        )}
        <div className={cn('grid gap-6', block.layout === 'cards' && 'md:grid-cols-2')}>
          {decisions.map((decision) => (
            <article className="border-current/20 border p-6" data-reveal key={decision.key}>
              <h3 className="mb-4 text-heading-3">{decision.title}</h3>
              {decision.decision && <p>{decision.decision}</p>}
              {decision.impact && <p className="mt-4 opacity-75">{decision.impact}</p>}
            </article>
          ))}
        </div>
      </div>
    </RevealSection>
  )
}
