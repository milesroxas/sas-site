import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { Section } from '@/blocks/shared/section'
import type {
  LabFactsBlock,
  LabMediaShowcaseBlock,
  LabPage,
  LabProject,
  LabRelatedProjectsBlock,
  LabStorySectionBlock,
  LabTransitionBlock,
} from '@/payload-types'
import { cn } from '@/utilities/ui'

const richTextSource = (project: LabProject, source: LabStorySectionBlock['source']) => {
  if (source === 'custom') return null
  return project[source]
}

const defaultHeading = (source: LabStorySectionBlock['source']) =>
  ({
    context: 'Context',
    approach: 'Approach',
    outcome: 'Outcome',
    learnings: 'Learnings',
    custom: '',
  })[source]

const StorySection = ({ block, project }: { block: LabStorySectionBlock; project: LabProject }) => {
  const content =
    block.source === 'custom'
      ? block.customBody
      : block.bodyOverride || richTextSource(project, block.source)
  if (!content) return null
  const width =
    block.width === 'narrow' ? 'max-w-3xl' : block.width === 'wide' ? 'max-w-7xl' : 'max-w-5xl'
  return (
    <Section theme={block.theme}>
      <div
        className={cn(
          'container mx-auto grid gap-10',
          width,
          block.media && block.layout !== 'text-only' && 'md:grid-cols-2',
        )}
      >
        <div className={cn(block.layout === 'text-right' && 'md:order-2')}>
          {block.eyebrow && (
            <p className="mb-3 text-sm uppercase tracking-[0.2em]">{block.eyebrow}</p>
          )}
          <h2 className="mb-6 text-3xl font-normal md:text-5xl">
            {block.headingOverride || defaultHeading(block.source)}
          </h2>
          <RichText data={content} enableGutter={false} />
        </div>
        {block.media && typeof block.media === 'object' && (
          <Media resource={block.media} imgClassName="h-auto w-full" />
        )}
      </div>
    </Section>
  )
}

const MediaShowcase = ({ block }: { block: LabMediaShowcaseBlock }) => {
  const media =
    block.media?.filter(
      (item) => typeof item === 'object' && item.usageStatus === 'public-approved',
    ) || []
  if (!media.length) return null
  return (
    <Section theme={block.theme}>
      <div className="container mx-auto">
        {block.heading && (
          <h2 className="mb-6 text-3xl font-normal md:text-5xl">{block.heading}</h2>
        )}
        {block.introduction && (
          <RichText className="mb-10 max-w-3xl" data={block.introduction} enableGutter={false} />
        )}
        <div
          className={cn(
            'grid gap-6',
            block.layout === 'grid' && 'md:grid-cols-2',
            block.layout === 'horizontal' && 'grid-flow-col auto-cols-[85%] overflow-x-auto snap-x',
          )}
        >
          {media.map(
            (item) =>
              typeof item === 'object' && (
                <figure className="snap-start" key={item.id}>
                  <Media resource={item} imgClassName="h-auto w-full" />
                  {block.showCaptions && item.caption && (
                    <RichText
                      className="mt-3 text-sm"
                      data={item.caption}
                      enableGutter={false}
                      enableProse={false}
                    />
                  )}
                  {block.showCredits && item.credit && (
                    <figcaption className="mt-2 text-xs opacity-70">
                      Credit: {item.credit}
                    </figcaption>
                  )}
                </figure>
              ),
          )}
        </div>
      </div>
    </Section>
  )
}

const statusLabels: Record<NonNullable<LabProject['status']>, string> = {
  planned: 'Planned',
  active: 'In progress',
  completed: 'Completed',
  archived: 'Archived',
}

const Facts = ({ block, project }: { block: LabFactsBlock; project: LabProject }) => {
  const technologies = block.showTechnologies ? project.technologies || [] : []
  const links = block.showLinks
    ? (project.projectLinks || []).filter((link) => link.visibility !== 'internal')
    : []
  const showStatus = Boolean(block.showStatus)
  if (!technologies.length && !links.length && !showStatus) return null
  return (
    <Section theme={block.theme}>
      <div className="container mx-auto max-w-5xl">
        {block.heading && (
          <h2 className="mb-8 text-3xl font-normal md:text-5xl">{block.heading}</h2>
        )}
        <dl className="grid gap-8 md:grid-cols-3">
          {showStatus && (
            <div>
              <dt className="text-sm uppercase tracking-[0.2em] opacity-70">Status</dt>
              <dd className="mt-3 text-lg">{statusLabels[project.status]}</dd>
            </div>
          )}
          {technologies.length > 0 && (
            <div>
              <dt className="text-sm uppercase tracking-[0.2em] opacity-70">Built with</dt>
              <dd className="mt-3 flex flex-wrap gap-2">
                {technologies.map((technology) => (
                  <span
                    className="border-current/20 border px-3 py-1 text-sm"
                    key={technology.id || technology.name}
                  >
                    {technology.name}
                  </span>
                ))}
              </dd>
            </div>
          )}
          {links.length > 0 && (
            <div>
              <dt className="text-sm uppercase tracking-[0.2em] opacity-70">Links</dt>
              <dd className="mt-3 flex flex-col gap-2">
                {links.map((link) => (
                  <a className="underline" href={link.url} key={link.id || link.url}>
                    {link.label}
                  </a>
                ))}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </Section>
  )
}

const Transition = ({ block }: { block: LabTransitionBlock }) => (
  <Section theme={block.theme}>
    <div className="container mx-auto max-w-5xl text-center">
      {block.eyebrow && <p className="mb-3 text-sm uppercase tracking-[0.2em]">{block.eyebrow}</p>}
      <h2 className="text-4xl font-normal md:text-7xl">{block.heading}</h2>
      {block.body && <RichText className="mt-8" data={block.body} enableGutter={false} />}
    </div>
  </Section>
)

const RelatedProjects = async ({
  block,
  page,
  project,
}: {
  block: LabRelatedProjectsBlock
  page: LabPage
  project: LabProject
}) => {
  let pages = (page.relatedLabPages || []).filter(
    (item): item is LabPage => typeof item === 'object',
  )
  if (block.selectionMode === 'automatic-capability-match') {
    const capabilityIds = (project.capabilities || []).map((item) =>
      typeof item === 'object' ? item.id : item,
    )
    if (capabilityIds.length) {
      const payload = await getPayload({ config: configPromise })
      const result = await payload.find({
        collection: 'lab-pages',
        overrideAccess: false,
        draft: false,
        depth: 2,
        limit: block.limit || 3,
        where: {
          and: [
            { id: { not_equals: page.id } },
            { 'labProject.capabilities': { in: capabilityIds } },
          ],
        },
      })
      pages = result.docs
    }
  }
  pages = pages.slice(0, block.limit || 3)
  if (!pages.length) return null
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto">
        <h2 className="mb-8 text-3xl font-normal md:text-5xl">
          {block.heading || 'More from the lab'}
        </h2>
        <div className={cn('grid gap-8', block.layout === 'grid' && 'md:grid-cols-3')}>
          {pages.map((item) => (
            <a className="group block" href={`/lab/${item.slug}`} key={item.id}>
              {item.coverAsset && typeof item.coverAsset === 'object' && (
                <Media resource={item.coverAsset} imgClassName="h-auto w-full" />
              )}
              <h3 className="mt-4 text-2xl font-normal group-hover:underline">
                {typeof item.labProject === 'object' ? item.labProject.title : item.title}
              </h3>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export const RenderLabBlocks = async ({
  blocks,
  page,
  project,
}: {
  blocks: NonNullable<LabPage['layout']>
  page: LabPage
  project: LabProject
}) => (
  <>
    {blocks.map((block) => {
      switch (block.blockType) {
        case 'labStorySection':
          return <StorySection block={block} key={block.id} project={project} />
        case 'labMediaShowcase':
          return <MediaShowcase block={block} key={block.id} />
        case 'labFacts':
          return <Facts block={block} key={block.id} project={project} />
        case 'labTransition':
          return <Transition block={block} key={block.id} />
        case 'labRelatedProjects':
          return <RelatedProjects block={block} key={block.id} page={page} project={project} />
        default:
          return null
      }
    })}
  </>
)
