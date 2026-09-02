import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import type { ReactNode } from 'react'
import { Container } from '@/components/Container'
import RichText from '@/components/RichText'
import type { LabTransitionBlock } from '@/payload-types'
import { BlockGrid } from '../shared/grid'
import { Section } from '../shared/section'

/**
 * Copy fields shared by the case-study and lab rich-transition blocks.
 * `blockType` differs per collection, so it is not part of this shape.
 *
 * Anchored on the lab block because it carries exactly these presentational
 * fields: the work-page variant adds a canonical-content picker and relaxes
 * `heading`, which its renderer resolves before it reaches this component.
 */
export type RichTransitionFields = Pick<
  LabTransitionBlock,
  'body' | 'eyebrow' | 'heading' | 'layout' | 'theme'
>

type Layout = NonNullable<RichTransitionFields['layout']>

const eyebrowClassName = 'text-sm uppercase tracking-[0.2em]'

const Body = ({ className, data }: { className?: string; data: DefaultTypedEditorState }) => (
  <div data-reveal>
    <RichText className={className} data={data} enableGutter={false} enableProse={false} />
  </div>
)

/**
 * Left: the heading cluster starts one column in (columns 2-5), with the body
 * on a narrower measure underneath (columns 2-4). The default section-heading
 * arrangement on the composition grid.
 */
const Left = ({ body, eyebrow, heading }: RichTransitionFields) => (
  <Container>
    <BlockGrid>
      <div className="text-stack md:col-span-4 md:col-start-2">
        {eyebrow ? (
          <p className={eyebrowClassName} data-reveal data-reveal-group="heading">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-heading-1" data-reveal data-reveal-group="heading">
          {heading}
        </h2>
      </div>
      {body ? (
        <div className="md:col-span-3 md:col-start-2">
          <Body className="text-lg" data={body} />
        </div>
      ) : null}
    </BlockGrid>
  </Container>
)

/**
 * Centered: heading on a 768px measure over a 640px reading column, stacked
 * and centered on the band. Matches the Paper centered frame (1024px cluster,
 * body at `w-narrow`).
 */
const Centered = ({ body, eyebrow, heading }: RichTransitionFields) => (
  <Container>
    <div className="text-stack mx-auto max-w-5xl text-center">
      {eyebrow ? (
        <p className={eyebrowClassName} data-reveal data-reveal-group="heading">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-heading-1 mx-auto max-w-3xl" data-reveal data-reveal-group="heading">
        {heading}
      </h2>
      {body ? <Body className="mx-auto max-w-160 text-base/7" data={body} /> : null}
    </div>
  </Container>
)

/** Split: heading cluster in columns 1-4, body across the gap in columns 6-8. */
const Split = ({ body, eyebrow, heading }: RichTransitionFields) => (
  <Container>
    <BlockGrid>
      <div className="text-stack md:col-span-4">
        {eyebrow ? (
          <p className={eyebrowClassName} data-reveal data-reveal-group="heading">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-heading-1" data-reveal data-reveal-group="heading">
          {heading}
        </h2>
      </div>
      {body ? (
        <div className="md:col-span-3 md:col-start-6">
          <Body className="text-lg" data={body} />
        </div>
      ) : null}
    </BlockGrid>
  </Container>
)

/** Statement: display-sized heading, body as a short caption underneath. */
const Statement = ({ body, eyebrow, heading }: RichTransitionFields) => (
  <Container>
    <div className="text-stack mx-auto max-w-5xl text-center">
      {eyebrow ? (
        <p className={eyebrowClassName} data-reveal data-reveal-group="heading">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-display" data-reveal data-reveal-group="heading">
        {heading}
      </h2>
      {body ? <Body className="mx-auto max-w-xl text-lg" data={body} /> : null}
    </div>
  </Container>
)

const layouts: Record<Layout, (props: RichTransitionFields) => ReactNode> = {
  left: Left,
  centered: Centered,
  split: Split,
  statement: Statement,
}

/**
 * Presentational rich-transition: eyebrow, heading, and optional body on a
 * themed band, arranged by `layout`. Collection-agnostic — case-study and lab
 * blocks share this shape.
 *
 * The band drops its bottom padding so the block runs straight into whatever
 * follows; only the top of the band carries rhythm.
 *
 * `bare` skips the `Section` wrapper for callers that supply their own shell
 * (the work-page renderer wraps blocks in a reveal band). The `data-reveal`
 * markers are inert unless such a shell animates them.
 *
 * Eyebrow and heading share a `data-reveal-group`, so the entrance is two
 * beats — the cluster, then the body — not three. An interstitial is one
 * thought arriving; staggering a kicker ahead of the heading it labels makes
 * the smallest element the loudest motion in the block and visibly detaches it
 * from that heading. Markers stay on the elements rather than a wrapper
 * because `text-stack` spaces the cluster through direct-child selectors.
 */
export const RichTransition = ({
  bare = false,
  ...block
}: RichTransitionFields & { bare?: boolean }) => {
  const Layout = layouts[block.layout ?? 'centered']
  const inner = <Layout {...block} />
  if (bare) return inner
  return (
    <Section className="pb-0 md:pb-0" theme={block.theme}>
      {inner}
    </Section>
  )
}
