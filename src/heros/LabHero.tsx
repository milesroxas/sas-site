import { Media } from '@/components/Media'
import type { LabPage, LabProject } from '@/payload-types'
import { cn } from '@/utilities/ui'

const kindLabels: Record<NonNullable<LabProject['kind']>, string> = {
  experiment: 'Experiment',
  prototype: 'Prototype',
  showcase: 'Showcase',
  tool: 'Tool',
  research: 'Research',
}

export const LabHero = ({ page, project }: { page: LabPage; project: LabProject }) => {
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
          {page.hero?.eyebrow || `Lab — ${kindLabels[project.kind]}`}
        </p>
        <h1 className="text-display">{page.hero?.titleOverride || project.title}</h1>
        <p className="mt-8 text-lead">
          {page.hero?.summaryOverride ||
            project.summaries?.short ||
            project.summaries?.oneLine ||
            project.thesis}
        </p>
      </div>
      {media && typeof media === 'object' && (
        <Media priority resource={media} imgClassName="h-auto w-full" />
      )}
    </header>
  )
}
