import { termNames } from '@/blocks/shared/resolve-work-entry'
import { Media } from '@/components/Media'
import type { CaseStudy, Organization, Project, WorkPage } from '@/payload-types'

const MetaGroup = ({ label, values }: { label: string; values: string[] }) => (
  <div className="flex flex-col gap-2 md:items-end md:text-right">
    <dt className="font-mono text-xs/none font-medium text-foreground">{label}</dt>
    <dd className="text-sm text-foreground lg:text-base">{values.join(', ')}</dd>
  </div>
)

/**
 * `centered-media` hero layout: media bands the center of the full first screen,
 * with content anchored around it — headline and taxonomy meta split the top row,
 * capabilities run along the bottom edge. No summary.
 */
export const CaseStudyHeroCenteredMedia = ({
  page,
  study,
}: {
  page: WorkPage
  study: CaseStudy
}) => {
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
  const platforms = termNames(project?.platforms)

  return (
    <header className="-mt-(--header-height) flex min-h-[calc(100svh-var(--footer-height))] flex-col pt-(--header-height)">
      <div className="container flex min-h-0 flex-1 flex-col justify-between gap-8">
        <div className="flex flex-col gap-8 pt-8 md:flex-row md:items-end md:justify-between lg:items-center">
          <div className="flex flex-col gap-6 md:max-w-md lg:max-w-xl lg:gap-8">
            <p className="flex items-center gap-4.5 font-mono text-base/none text-foreground md:font-medium">
              <span aria-hidden className="hidden h-px w-6 bg-foreground md:block" />
              {page.hero?.eyebrow || organization?.shortName || organization?.name || 'Case study'}
            </p>
            <h1 className="font-heading text-3xl/8 font-normal tracking-tight text-foreground md:text-3xl/9 lg:text-6xl/18">
              {page.hero?.titleOverride || study.title}
            </h1>
          </div>
          {(industries.length > 0 || platforms.length > 0) && (
            <dl className="flex shrink-0 flex-col gap-6">
              {industries.length > 0 && (
                <MetaGroup
                  label={industries.length > 1 ? 'Industries' : 'Industry'}
                  values={industries}
                />
              )}
              {platforms.length > 0 && (
                <MetaGroup
                  label={platforms.length > 1 ? 'Platforms' : 'Platform'}
                  values={platforms}
                />
              )}
            </dl>
          )}
        </div>
        {media && typeof media === 'object' && (
          <div className="md:px-8 lg:px-0">
            <Media
              priority
              resource={media}
              className="lg:mx-auto lg:w-4/9"
              imgClassName="aspect-8/5 w-full object-cover"
              videoClassName="aspect-8/5 w-full object-cover"
            />
          </div>
        )}
        {capabilities.length > 0 && (
          <div className="flex flex-col gap-4 pb-16">
            <p className="font-mono text-xs/none font-medium text-foreground">Capabilities</p>
            <ul className="flex flex-col gap-2 md:flex-row md:items-center">
              {capabilities.map((name, i) => (
                <li
                  key={name}
                  className="flex items-center gap-2 text-base/6 text-foreground md:text-lg/7 lg:text-xl/none"
                >
                  {i > 0 && (
                    <span aria-hidden className="hidden h-px w-10 bg-foreground md:block" />
                  )}
                  {name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </header>
  )
}
