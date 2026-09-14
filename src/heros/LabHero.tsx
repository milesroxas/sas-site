import { Visual } from '@/components/Visual'
import { resolveVisual } from '@/features/immersive/visual'
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
  const visual = resolveVisual(page.hero, { fallbackMedia: page.coverAsset, seedKey: page.id })
  const centered = page.hero?.layout === 'centered'
  return (
    <header
      className={cn(
        'container mx-auto grid min-h-[70vh] items-center gap-10 py-20',
        !centered && visual && 'md:grid-cols-2',
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
      {visual && (
        // data-hero-media: takeover-menu dissolve source (src/Header/Menu).
        <div data-hero-media className="contents">
          <Visual
            frameClassName="aspect-video"
            imgClassName="h-auto w-full"
            placement="hero"
            posterClassName="object-cover"
            priority
            visual={visual}
          />
        </div>
      )}
    </header>
  )
}
