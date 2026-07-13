import { Media } from '@/components/Media'
import type { CaseStudy, Organization, Project, WorkPage } from '@/payload-types'
import { cn } from '@/utilities/ui'

export const CaseStudyHero = ({ page, study }: { page: WorkPage; study: CaseStudy }) => {
  const project = typeof study.project === 'object' ? (study.project as Project) : null
  const organization =
    project && typeof project.organization === 'object'
      ? (project.organization as Organization)
      : null
  const media =
    page.hero?.media && typeof page.hero.media === 'object' ? page.hero.media : page.coverAsset
  const centered = page.hero?.layout === 'centered'
  return (
    <header
      className={cn(
        'container mx-auto grid min-h-[70vh] items-center gap-10 py-20',
        !centered && media && 'md:grid-cols-2',
        centered && 'max-w-5xl text-center',
      )}
    >
      <div>
        <p className="mb-4 text-sm uppercase tracking-[0.2em]">
          {page.hero?.eyebrow || organization?.shortName || organization?.name || 'Case study'}
        </p>
        <h1 className="text-5xl leading-none md:text-8xl">
          {page.hero?.titleOverride || study.title}
        </h1>
        <p className="mt-8 text-xl md:text-2xl">
          {page.hero?.summaryOverride ||
            study.summaries?.short ||
            study.summaries?.oneLine ||
            study.thesis}
        </p>
      </div>
      {media && typeof media === 'object' && (
        <Media priority resource={media} imgClassName="h-auto w-full" />
      )}
    </header>
  )
}
