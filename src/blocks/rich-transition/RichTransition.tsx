import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import type { ReactNode } from 'react'
import { Container } from '@/components/Container'
import RichText from '@/components/RichText'
import type { CaseStudyTransitionBlock } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { Section } from '../shared/section'

/**
 * Copy fields shared by the case-study and lab rich-transition blocks.
 * `blockType` differs per collection, so it is not part of this shape.
 */
export type RichTransitionFields = Pick<
  CaseStudyTransitionBlock,
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
 * Left: a leading spacer then a heading column, with the body on a narrower
 * measure underneath. The 12.9% / 61% tracks are the Paper frame's 173px
 * spacer and 821px column as fractions of the 1440 inner width, so they
 * scale instead of locking to those pixels.
 */
const Left = ({ body, eyebrow, heading }: RichTransitionFields) => (
  <Container>
    <div className="flex flex-col items-start gap-12 md:grid md:grid-cols-[12.9%_minmax(0,61%)_1fr]">
      <div aria-hidden className="hidden md:block" />
      <div className="flex w-full flex-col items-start gap-12">
        <div className="flex flex-col items-start gap-3">
          {eyebrow ? (
            <p className={cn(eyebrowClassName, 'leading-none')} data-reveal>
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-heading-1" data-reveal>
            {heading}
          </h2>
        </div>
        {body ? <Body className="max-w-120 text-lg" data={body} /> : null}
      </div>
    </div>
  </Container>
)

/**
 * Centered: heading on a 768px measure over a 640px reading column, stacked
 * and centered on the band. Matches the Paper centered frame (1024px cluster,
 * body at `w-narrow`).
 */
const Centered = ({ body, eyebrow, heading }: RichTransitionFields) => (
  <Container>
    <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
      {eyebrow ? (
        <p className={cn(eyebrowClassName, 'leading-5')} data-reveal>
          {eyebrow}
        </p>
      ) : null}
      <h2 className={cn('text-heading-1 max-w-3xl', eyebrow && 'pt-3')} data-reveal>
        {heading}
      </h2>
      {body ? <Body className="max-w-[40rem] pt-8 text-base/7" data={body} /> : null}
    </div>
  </Container>
)

/** Split: heading column on the left, body on the right from `lg`. */
const Split = ({ body, eyebrow, heading }: RichTransitionFields) => (
  <Container>
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-24">
      <div className="flex flex-col gap-3 lg:col-span-6">
        {eyebrow ? (
          <p className={eyebrowClassName} data-reveal>
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-heading-1" data-reveal>
          {heading}
        </h2>
      </div>
      {body ? (
        <div className="lg:col-span-4 lg:col-start-9">
          <Body className="text-lg" data={body} />
        </div>
      ) : null}
    </div>
  </Container>
)

/** Statement: display-sized heading, body as a short caption underneath. */
const Statement = ({ body, eyebrow, heading }: RichTransitionFields) => (
  <Container>
    <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
      {eyebrow ? (
        <p className={cn(eyebrowClassName, 'mb-3')} data-reveal>
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-display" data-reveal>
        {heading}
      </h2>
      {body ? <Body className="mt-8 max-w-xl text-lg" data={body} /> : null}
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
 * `bare` skips the `Section` wrapper for callers that supply their own shell
 * (the work-page renderer wraps blocks in a full-viewport reveal section).
 * The `data-reveal` markers are inert unless such a shell animates them.
 */
export const RichTransition = ({
  bare = false,
  ...block
}: RichTransitionFields & { bare?: boolean }) => {
  const Layout = layouts[block.layout ?? 'centered']
  const inner = <Layout {...block} />
  if (bare) return inner
  return <Section theme={block.theme}>{inner}</Section>
}
