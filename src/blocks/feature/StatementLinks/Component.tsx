import type React from 'react'
import { CMSLink } from '@/components/Link'
// Payload website-template pattern: RichText renders embedded blocks, blocks render rich text
// fallow-ignore-next-line circular-dependency
import RichText from '@/components/RichText'
import type { FeatureStatementLinksBlock as FeatureStatementLinksBlockProps } from '@/payload-types'

export const FeatureStatementLinksBlock: React.FC<FeatureStatementLinksBlockProps> = ({
  links,
  statement,
}) => {
  return (
    <section className="container">
      <div className="grid gap-12 lg:grid-cols-12">
        {statement ? (
          <div className="lg:col-span-7" data-reveal>
            <RichText
              className="text-4xl leading-relaxed tracking-tight"
              data={statement}
              enableGutter={false}
              enableProse={false}
              variant="emphasis"
            />
          </div>
        ) : null}
        {links?.length ? (
          <div className="flex flex-col gap-8 lg:col-span-2 lg:col-start-11 lg:pt-3" data-reveal>
            {links.map(({ id, link }) => (
              <CMSLink {...link} appearance="ruled" key={id} size="clear" />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
