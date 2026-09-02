import RichText from '@/components/RichText'
import type { CaseStudy, CaseStudyMetricsBlock } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { RevealSection } from './RevealSection.client'

export type CaseStudyMetric = NonNullable<CaseStudy['metrics']>[number]

/**
 * Results as a definition list: the value leads, the label explains it.
 * Public approval is enforced upstream — every metric handed here is already
 * cleared to appear.
 */
export const Metrics = ({
  block,
  metrics,
}: {
  block: CaseStudyMetricsBlock
  metrics: CaseStudyMetric[]
}) => {
  if (!metrics.length) return null
  return (
    <RevealSection theme={block.theme} variant="intro">
      <div className="container mx-auto">
        <h2 className="mb-8 text-heading-2" data-reveal>
          {block.heading || 'Results'}
        </h2>
        {block.introduction && (
          <div data-reveal>
            <RichText className="mb-10 max-w-3xl" data={block.introduction} enableGutter={false} />
          </div>
        )}
        <dl className={cn('grid gap-8', block.layout === 'grid' && 'md:grid-cols-3')}>
          {metrics.map((metric) => (
            <div data-reveal key={metric.key}>
              <dd className="text-heading-1">
                {metric.value}
                {metric.unit}
              </dd>
              <dt className="mt-3 text-lg">{metric.label}</dt>
              {metric.qualifier && <p className="mt-2 text-sm opacity-70">{metric.qualifier}</p>}
            </div>
          ))}
        </dl>
      </div>
    </RevealSection>
  )
}
