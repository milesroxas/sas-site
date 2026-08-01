import type React from 'react'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { FeatureStatementGridBlock as FeatureStatementGridBlockProps } from '@/payload-types'

export const FeatureStatementGridBlock: React.FC<FeatureStatementGridBlockProps> = ({
  eyebrow,
  heading,
  statement,
  footnote,
  cards,
}) => {
  return (
    <section className="container">
      <header
        className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-2 text-center md:mb-16"
        data-reveal
      >
        {eyebrow ? <p className="text-sm tracking-widest uppercase">{eyebrow}</p> : null}
        <h2 className="text-2xl font-normal md:text-3xl">{heading}</h2>
      </header>
      <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
        <div className="flex flex-col justify-between gap-8">
          {statement ? (
            <div data-reveal>
              <RichText
                className="text-xl md:text-2xl md:leading-tight"
                data={statement}
                enableGutter={false}
                enableProse={false}
              />
            </div>
          ) : null}
          {footnote ? (
            <p className="max-w-sm text-sm md:text-base" data-reveal>
              {footnote}
            </p>
          ) : null}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
          {(cards || []).map((card) => (
            <article
              key={card.id}
              className="overflow-hidden rounded-lg border border-border bg-card"
              data-reveal
            >
              <div className="relative aspect-[3/2] bg-muted">
                {card.media ? (
                  <Media fill imgClassName="object-cover" resource={card.media} size="33vw" />
                ) : null}
              </div>
              <div className="flex flex-col gap-2 p-4">
                <h3 className="text-sm font-normal text-card-foreground">{card.title}</h3>
                <p className="text-xs/5 text-muted-foreground">{card.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
