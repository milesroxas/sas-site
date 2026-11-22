import type React from 'react'
import { BlockGrid } from '@/blocks/shared/grid'
import { Section } from '@/blocks/shared/section'
import { eyebrowClassName } from '@/blocks/shared/typography'
import { Container } from '@/components/Container'
import { CtaClick } from '@/components/CtaClick'
import { CMSLink } from '@/components/Link'
import { resolveCmsLinkHref } from '@/components/Link/resolve-href'
import { LIGHT_LEAK_AMBER, LightLeak, leakScope } from '@/features/immersive'
import type { CtaBandBlock as CtaBandBlockProps } from '@/payload-types'
import { cn } from '@/utilities/ui'

type Props = CtaBandBlockProps & { bare?: boolean }

/** The first action is the solid button, the second the frosted one beside it. */
const ACTION_VARIANTS = ['default', 'glass'] as const

const Actions = ({ links, className }: { links: Props['links']; className?: string }) => {
  const actions = (links ?? []).filter(({ link }) => resolveCmsLinkHref(link))
  if (actions.length === 0) return null
  return (
    <div className={cn('flex flex-wrap gap-3', className)} data-reveal>
      {actions.slice(0, ACTION_VARIANTS.length).map(({ id, link }, index) => (
        <CtaClick
          href={resolveCmsLinkHref(link) ?? ''}
          key={id ?? index}
          label={link.label ?? ''}
          location="cta_band"
        >
          <CMSLink {...link} appearance={ACTION_VARIANTS[index]} size="xl" />
        </CtaClick>
      ))}
    </div>
  )
}

/**
 * CTA band (config: `./config.ts`). Top level: a full-bleed band on the
 * always-dark panel (`Section dark`). Nested in a Section (`bare`): the same
 * panel inset as a rounded slab inside the Section's band, laid out with flex
 * because a grid inside the slab's padding could not share the page columns.
 *
 * The leak fills the nearest positioned ancestor and listens inside its own
 * scope, so hovering an action flares this band's leak and no other. It is
 * decoration: it renders nothing without a GPU or under reduced motion, and
 * the dark ground beneath it is the poster.
 */
export const CtaBandBlock: React.FC<Props> = ({
  bare,
  body,
  caption,
  eyebrow,
  heading,
  layout,
  links,
}) => {
  const compact = layout === 'compact'

  const headingCluster = (
    <div className="text-stack">
      {!compact && eyebrow ? (
        <p
          className={cn(eyebrowClassName, 'text-muted-foreground')}
          data-reveal
          data-reveal-group="heading"
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(compact ? 'text-lead' : 'text-heading', 'text-balance')}
        data-reveal
        data-reveal-group="heading"
      >
        {heading}
      </h2>
    </div>
  )
  const bodyCopy =
    !compact && body ? (
      <p className="text-body text-pretty whitespace-pre-line text-muted-foreground" data-reveal>
        {body}
      </p>
    ) : null
  const cornerNote =
    !compact && caption ? (
      <p className={cn(eyebrowClassName, 'text-muted-foreground')} data-reveal>
        {caption}
      </p>
    ) : null

  const compactRow = (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-grid">
      {headingCluster}
      <Actions className="shrink-0" links={links} />
    </div>
  )

  if (bare) {
    return (
      <Container>
        <div
          className={cn(
            'relative isolate overflow-clip rounded-xl bg-background text-foreground',
            compact ? 'px-6 py-8 md:px-12 md:py-10' : 'px-6 py-12 md:px-12 md:py-20',
          )}
          data-band="dark"
          {...leakScope()}
        >
          <LightLeak {...LIGHT_LEAK_AMBER} />
          <div className="relative">
            {compact ? (
              compactRow
            ) : (
              <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-grid">
                <div className="flex max-w-2xl flex-col gap-8">
                  {headingCluster}
                  {bodyCopy}
                  <Actions links={links} />
                </div>
                {cornerNote ? <div className="shrink-0 md:text-end">{cornerNote}</div> : null}
              </div>
            )}
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Section className="relative isolate overflow-clip" dark spacing={compact ? 'tight' : 'loose'}>
      <LightLeak {...LIGHT_LEAK_AMBER} />
      <Container className="relative">
        {compact ? (
          compactRow
        ) : (
          <BlockGrid>
            <div className="md:col-span-5">{headingCluster}</div>
            {bodyCopy ? <div className="md:col-span-4 md:row-start-2">{bodyCopy}</div> : null}
            <Actions className="md:col-span-5 md:row-start-3" links={links} />
            {cornerNote ? (
              <div className="md:col-span-2 md:col-start-7 md:row-start-3 md:self-end md:text-end">
                {cornerNote}
              </div>
            ) : null}
          </BlockGrid>
        )}
      </Container>
    </Section>
  )
}
