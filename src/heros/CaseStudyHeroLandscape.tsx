import { Media } from '@/components/Media'
import type { CaseStudy, WorkPage } from '@/payload-types'
import { WorkImageTransition } from '@/shared/lib/view-transition'
import { pluralLabel } from '@/utilities/pluralLabel'
import { caseStudyHeroFacts } from './caseStudyHeroFacts'
import { HeroGround, pinnedOpening } from './HeroGround'

const DetailGroup = ({ label, values }: { label: string; values: string[] }) => (
  <div className="flex flex-col gap-4">
    <dt className="font-mono text-xs/none font-medium text-foreground">{label}</dt>
    <dd>
      <ul className="flex flex-col gap-3">
        {values.map((name) => (
          <li key={name} className="text-base/6 text-foreground lg:text-sm/5 xl:text-base/6">
            {name}
          </li>
        ))}
      </ul>
    </dd>
  </div>
)

const HeroDetails = ({
  capabilities,
  client,
  industries,
}: {
  capabilities: string[]
  client?: string | null
  industries: string[]
}) => (
  <dl className="flex flex-col gap-8 md:flex-row md:gap-20 lg:gap-12 lg:self-end xl:gap-20">
    {client && <DetailGroup label="Client" values={[client]} />}
    {industries.length > 0 && (
      <DetailGroup
        label={pluralLabel(industries.length, 'Industry', 'Industries')}
        values={industries}
      />
    )}
    {capabilities.length > 0 && <DetailGroup label="Capabilities" values={capabilities} />}
  </dl>
)

/**
 * `landscape` hero layout: title on its own row, then detail columns (client,
 * industry, capabilities) right-aligned on the next: a guttered top band, then
 * an edge-to-edge landscape media strip (21:9 lg / 5:4 below). No summary.
 *
 * An effect chosen on the page grounds the whole band behind all of it; the
 * media keeps its own strip, so a page can carry both.
 */
export const CaseStudyHeroLandscape = ({ page, study }: { page: WorkPage; study: CaseStudy }) => {
  const { capabilities, ground, industries, media, organization, surface } = caseStudyHeroFacts(
    page,
    study,
  )
  const client = organization?.name || organization?.shortName

  return (
    <header
      {...pinnedOpening(
        surface,
        'relative isolate flex flex-col gap-20 overflow-clip pt-16 pb-16 md:gap-32 lg:gap-8 lg:pt-32',
      )}
    >
      <HeroGround ground={ground} handoff={!media} />
      <div className="container flex flex-col gap-10 md:gap-32 lg:gap-8 lg:pb-4">
        <h1 className="max-w-xl text-heading-1 text-foreground">
          {page.hero?.titleOverride || study.title}
        </h1>
        <HeroDetails capabilities={capabilities} client={client} industries={industries} />
      </div>
      {media && (
        // data-hero-media: takeover-menu dissolve source (src/Header/Menu).
        <div data-hero-media className="contents">
          {/* VT name lands on the media's own wrapper (the `contents` div above can't snapshot). */}
          <WorkImageTransition slug={page.slug}>
            <Media
              imgClassName="aspect-5/4 w-full object-cover lg:aspect-21/9"
              priority
              resource={media}
              size="100vw"
              videoClassName="aspect-5/4 w-full object-cover lg:aspect-21/9"
            />
          </WorkImageTransition>
        </div>
      )}
    </header>
  )
}
