import type React from 'react'
import { composedReadingMinutes } from '@/blocks/shared/reading-time'
import { Media } from '@/components/Media'
import { resolveOpening } from '@/features/immersive/visual'
import type { LabPage, LabProject } from '@/payload-types'
import { formatAuthors } from '@/utilities/formatAuthors'
import { formatPublishedDate } from '@/utilities/formatDateTime'
import { HERO_FURNITURE } from './furniture'
import { HeroBand } from './HeroBand'
import { HeroGround } from './HeroGround'

const kindLabels: Record<NonNullable<LabProject['kind']>, string> = {
  experiment: 'Experiment',
  prototype: 'Prototype',
  showcase: 'Showcase',
  tool: 'Tool',
  research: 'Research',
}

/** Technologies the meta row names before it stops counting. */
const NAMED_TECHNOLOGIES = 3

const MetaEntry: React.FC<{ children: React.ReactNode; label: string }> = ({ children, label }) => (
  <div className="flex flex-col gap-2">
    <dt className={`${HERO_FURNITURE} text-muted-foreground`}>{label}</dt>
    <dd className="text-sm/5 font-medium text-foreground">{children}</dd>
  </div>
)

/**
 * Built with, truncated: the first few names read as a stack, the rest as a
 * count. The full list belongs in the body, not in the opening.
 */
const BuiltWith: React.FC<{ technologies: LabProject['technologies'] }> = ({ technologies }) => {
  const names = (technologies ?? []).map(({ name }) => name).filter(Boolean)
  if (names.length === 0) return null
  const rest = names.length - NAMED_TECHNOLOGIES
  return (
    <MetaEntry label="Built with">
      <span className="flex items-baseline gap-2">
        {names.slice(0, NAMED_TECHNOLOGIES).join(', ')}
        {rest > 0 && <span className="font-mono text-xs/5 text-muted-foreground">+{rest}</span>}
      </span>
    </MetaEntry>
  )
}

/**
 * Lab page opening (Paper "Lab Page Hero", media and no-media variants).
 *
 * One composition, no layout variants: the copy sits low on the left of a
 * full-viewport field, the effect grounds that whole field behind it, and the
 * media, when the page sets one, is a 16:9 plate holding the other half of
 * the column, centred on the band while the copy stays anchored to its foot.
 *
 * The shader is ambient, not the subject: it never frames the artifact, so a
 * page can carry a Streak Field, a light leak, a picture, or any combination,
 * and the layout never changes shape (`resolveOpening`).
 *
 * The copy column stops clear of the fixed footer bar: the band pads its own
 * height by `--footer-height`, and the content row adds the 80px of open air
 * the design leaves over the bar.
 */
export const LabHero = ({ page, project }: { page: LabPage; project: LabProject }) => {
  const { ground, media, surface } = resolveOpening(page.hero, {
    fallbackMedia: page.coverAsset,
    seedKey: page.id,
  })
  const authors = formatAuthors(project.populatedAuthors ?? [])
  const published = formatPublishedDate(project.publishedAt ?? page.publishedAt)
  // The figure promises this page's read, so it counts what this page renders:
  // the blocks below, each resolved against the project the same way the
  // renderer resolves them. The project's own narrative is not the page.
  const minutes = composedReadingMinutes([page.intro, page.layout], project)

  return (
    // The band pulls under the fixed header and runs under the fixed footer,
    // so the opening is one full viewport with both bars floating over it.
    <HeroBand
      as="header"
      className="relative isolate -mt-(--header-height) flex min-h-svh flex-col overflow-clip bg-background pt-(--header-height) pb-(--footer-height) text-foreground"
      pinsChromeAtLoad
      // The lab opening is a page surface, not a fixed-palette band: it
      // paints in the visitor's theme, like the article under it, unless the
      // editor pinned the effect grounding it to one face.
      theme={surface ?? 'site'}
    >
      <HeroGround ground={ground} handoff={!media} />

      <div className="container flex flex-1 flex-col justify-end gap-12 pb-20 md:flex-row md:items-center md:justify-start">
        <div className="flex flex-col justify-end gap-4.5 md:flex-1 md:self-stretch">
          <p className={`${HERO_FURNITURE} text-muted-foreground`}>
            {page.hero?.eyebrow || `Lab / ${kindLabels[project.kind]}`}
          </p>
          <h1 className="max-w-3xl text-heading-1 text-foreground">
            {page.hero?.titleOverride || project.title}
          </h1>
          <p className="max-w-xl pt-2 text-lead text-muted-foreground">
            {page.hero?.summaryOverride ||
              project.summaries?.short ||
              project.summaries?.oneLine ||
              project.thesis}
          </p>
          {/* The staff rule: the single line in the composition, so the meta
              reads as a masthead bar rather than as a table. */}
          <dl className="mt-11.5 flex w-fit flex-col gap-4 border-t border-foreground pt-4">
            {authors && <MetaEntry label="Editor">{authors}</MetaEntry>}
            {published && <MetaEntry label="Published">{published}</MetaEntry>}
            <BuiltWith technologies={project.technologies} />
            <MetaEntry label="Read">
              <span className="font-mono font-normal">{minutes} MIN</span>
            </MetaEntry>
          </dl>
        </div>

        {media && (
          // data-hero-media: takeover-menu dissolve source (src/Header/Menu).
          <div className="md:flex-1 md:self-center" data-hero-media>
            <Media
              imgClassName="aspect-video w-full object-cover"
              priority
              resource={media}
              size="(min-width: 48rem) 45vw, 100vw"
              videoClassName="aspect-video w-full object-cover"
            />
          </div>
        )}
      </div>
    </HeroBand>
  )
}
