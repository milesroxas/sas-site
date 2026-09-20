import { Media } from '@/components/Media'
import type { CaseStudy, Organization, WorkPage } from '@/payload-types'
import { WorkImageTransition } from '@/shared/lib/view-transition'
import { pluralLabel } from '@/utilities/pluralLabel'
import { caseStudyHeroFacts } from './caseStudyHeroFacts'
import { HeroGround } from './HeroGround'

const MetaGroup = ({ label, values }: { label: string; values: string[] }) => (
  <div className="flex flex-col gap-2 md:items-end md:text-right">
    <dt className="font-mono text-xs/none font-medium text-foreground">{label}</dt>
    <dd className="text-sm text-foreground lg:text-base">{values.join(', ')}</dd>
  </div>
)

const HeroTaxonomy = ({ industries, platforms }: { industries: string[]; platforms: string[] }) => {
  if (industries.length === 0 && platforms.length === 0) return null

  return (
    <dl className="flex shrink-0 flex-col gap-6">
      {industries.length > 0 && (
        <MetaGroup
          label={pluralLabel(industries.length, 'Industry', 'Industries')}
          values={industries}
        />
      )}
      {platforms.length > 0 && (
        <MetaGroup
          label={pluralLabel(platforms.length, 'Platform', 'Platforms')}
          values={platforms}
        />
      )}
    </dl>
  )
}

const CapabilityRail = ({ capabilities }: { capabilities: string[] }) => {
  if (capabilities.length === 0) return null

  return (
    <div className="flex flex-col gap-4 pb-16">
      <p className="font-mono text-xs/none font-medium text-foreground">Capabilities</p>
      <ul className="flex flex-col gap-2 md:flex-row md:items-center">
        {capabilities.map((name, i) => (
          <li
            key={name}
            className="flex items-center gap-2 text-base/6 text-foreground md:text-lg/7 lg:text-xl/none"
          >
            {i > 0 && <span aria-hidden className="hidden h-px w-10 bg-foreground md:block" />}
            {name}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * What the eyebrow reads: the editor's override, else the client's name — the
 * short form first, since it sits on one line beside the rule — else the
 * generic label.
 */
const heroEyebrow = (page: WorkPage, organization: Organization | null) =>
  page.hero?.eyebrow || organization?.shortName || organization?.name || 'Case study'

/**
 * `centered-media` hero layout: media bands the center of the full first screen,
 * with content anchored around it. Headline and taxonomy meta split the top row,
 * capabilities run along the bottom edge. No summary.
 *
 * An effect chosen on the page grounds the whole band behind all of it; the
 * media keeps its own plate, so a page can carry both.
 */
export const CaseStudyHeroCenteredMedia = ({
  page,
  study,
}: {
  page: WorkPage
  study: CaseStudy
}) => {
  const { capabilities, ground, industries, media, organization, platforms } = caseStudyHeroFacts(
    page,
    study,
  )

  return (
    <header className="relative isolate -mt-(--header-height) flex min-h-[calc(100svh-var(--footer-height))] flex-col overflow-clip pt-(--header-height)">
      <HeroGround ground={ground} handoff={!media} />
      <div className="container flex min-h-0 flex-1 flex-col justify-between gap-8">
        <div className="flex flex-col gap-8 pt-8 md:flex-row md:items-end md:justify-between lg:items-center">
          <div className="flex flex-col gap-6 md:max-w-md lg:max-w-xl lg:gap-8">
            <p className="flex items-center gap-4.5 font-mono text-base/none text-foreground md:font-medium">
              <span aria-hidden className="hidden h-px w-6 bg-foreground md:block" />
              {heroEyebrow(page, organization)}
            </p>
            <h1 className="text-heading-1 text-foreground">
              {page.hero?.titleOverride || study.title}
            </h1>
          </div>
          <HeroTaxonomy industries={industries} platforms={platforms} />
        </div>
        {media && (
          // data-hero-media: takeover-menu dissolve source (src/Header/Menu).
          <div data-hero-media className="md:px-8 lg:px-0">
            <WorkImageTransition slug={page.slug}>
              <Media
                className="lg:mx-auto lg:w-1/2"
                imgClassName="aspect-8/5 w-full object-cover"
                priority
                resource={media}
                videoClassName="aspect-8/5 w-full object-cover"
              />
            </WorkImageTransition>
          </div>
        )}
        <CapabilityRail capabilities={capabilities} />
      </div>
    </header>
  )
}
