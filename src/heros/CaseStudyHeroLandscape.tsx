import { Media } from '@/components/Media'
import type { CaseStudy, Organization, Project, WorkPage } from '@/payload-types'

const termNames = (terms?: (number | { name: string })[] | null): string[] =>
  (terms ?? [])
    .filter((term): term is { name: string } => typeof term === 'object' && term !== null)
    .map((term) => term.name)

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

/**
 * `landscape` hero layout: headline and detail columns (client, industry,
 * capabilities) share the top band, then a full-width landscape media strip —
 * 21:9 on large screens, 5:4 below. Flows with the page; no summary.
 */
export const CaseStudyHeroLandscape = ({ page, study }: { page: WorkPage; study: CaseStudy }) => {
  const project = typeof study.project === 'object' ? (study.project as Project) : null
  const organization =
    project && typeof project.organization === 'object'
      ? (project.organization as Organization)
      : null
  const media =
    page.hero?.media && typeof page.hero.media === 'object' ? page.hero.media : page.coverAsset
  const featured = termNames(study.featuredCapabilities)
  const capabilities = featured.length ? featured : termNames(project?.capabilities)
  const industries = termNames(project?.industries)
  const client = organization?.name || organization?.shortName

  return (
    <header className="container flex flex-col gap-20 pt-16 pb-16 md:gap-32 md:pt-20 lg:gap-8">
      <div className="flex flex-col gap-10 md:gap-32 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <h1 className="max-w-xl font-heading text-3xl/9 font-normal tracking-tight text-foreground md:text-5xl/12">
          {page.hero?.titleOverride || study.title}
        </h1>
        <dl className="flex flex-col gap-8 md:flex-row md:gap-20 lg:shrink-0 lg:gap-12 lg:justify-end xl:gap-20">
          {client && <DetailGroup label="Client" values={[client]} />}
          {industries.length > 0 && (
            <DetailGroup
              label={industries.length > 1 ? 'Industries' : 'Industry'}
              values={industries}
            />
          )}
          {capabilities.length > 0 && <DetailGroup label="Capabilities" values={capabilities} />}
        </dl>
      </div>
      {media && typeof media === 'object' && (
        <Media
          priority
          resource={media}
          imgClassName="aspect-5/4 w-full object-cover lg:aspect-21/9"
          videoClassName="aspect-5/4 w-full object-cover lg:aspect-21/9"
        />
      )}
    </header>
  )
}
