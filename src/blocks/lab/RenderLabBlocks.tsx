import type { ReactNode } from 'react'
import { MediaShowcaseGrid, publicApprovedMedia } from '@/blocks/shared/media-showcase-grid'
import { resolveRelatedPages } from '@/blocks/shared/related-pages'
import { blockRevealVariants } from '@/blocks/shared/reveal-variants'
import { Section } from '@/blocks/shared/section'
import { SplitContentNarrowBlock } from '@/blocks/split-content/Component'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type {
  LabFactsBlock,
  LabMediaShowcaseBlock,
  LabPage,
  LabProject,
  LabRelatedProjectsBlock,
  LabStorySectionBlock,
  LabTransitionBlock,
  Media as MediaDoc,
} from '@/payload-types'
import { RevealSection } from '@/shared/ui/reveal-section'
import { ScrollReveal } from '@/shared/ui/scroll-reveal'
import { populatedDoc, relationshipIds } from '@/utilities/relationshipId'
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

const storyWidths: Record<NonNullable<LabStorySectionBlock['width']>, string> = {
  narrow: 'max-w-3xl',
  standard: 'max-w-5xl',
  wide: 'max-w-7xl',
}

/**
 * The story section splits its copy across two fields: `custom` renders the
 * block's own body, any other source renders the project's canonical section
 * unless the editor wrote a website-only override.
 */
const resolveStorySectionBody = (block: LabStorySectionBlock, project: LabProject) =>
  block.source === 'custom'
    ? block.customBody
    : block.bodyOverride || richTextSource(project, block.source)

const StorySection = ({ block, project }: { block: LabStorySectionBlock; project: LabProject }) => {
  const content = resolveStorySectionBody(block, project)
  if (!content) return null
  const media = populatedDoc<MediaDoc>(block.media)
  const width = storyWidths[block.width ?? 'standard']
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
          <h2 className="mb-6 text-heading-2">
            {block.headingOverride || defaultHeading(block.source)}
          </h2>
          <RichText data={content} enableGutter={false} />
        </div>
        {media && <Media resource={media} imgClassName="h-auto w-full" />}
      </div>
    </Section>
  )
}

const MediaShowcase = ({ block }: { block: LabMediaShowcaseBlock }) => {
  const media = publicApprovedMedia(block.media)
  if (!media.length) return null
  return (
    <Section theme={block.theme}>
      <div className="container mx-auto">
        {block.heading && <h2 className="mb-6 text-heading-2">{block.heading}</h2>}
        {block.introduction && (
          <RichText className="mb-10 max-w-3xl" data={block.introduction} enableGutter={false} />
        )}
        <MediaShowcaseGrid
          layout={block.layout}
          media={media}
          showCaptions={block.showCaptions}
          showCredits={block.showCredits}
        />
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

/**
 * Every fact column shares the same term shell; only the label and the way its
 * body lays out differ, so the body classes stay with the caller.
 */
const FactColumn = ({
  bodyClassName,
  children,
  label,
}: {
  bodyClassName: string
  children: ReactNode
  label: string
}) => (
  <div>
    <dt className="text-sm uppercase tracking-[0.2em] opacity-70">{label}</dt>
    <dd className={bodyClassName}>{children}</dd>
  </div>
)

/** The project's tech list, when the block is set to show it. */
const factTechnologies = (block: LabFactsBlock, project: LabProject) =>
  block.showTechnologies ? project.technologies || [] : []

/** The project's public links, when the block is set to show them. */
const factLinks = (block: LabFactsBlock, project: LabProject) =>
  block.showLinks
    ? (project.projectLinks || []).filter((link) => link.visibility !== 'internal')
    : []

const Facts = ({ block, project }: { block: LabFactsBlock; project: LabProject }) => {
  const technologies = factTechnologies(block, project)
  const links = factLinks(block, project)
  const showStatus = Boolean(block.showStatus)
  if (!technologies.length && !links.length && !showStatus) return null
  return (
    <Section theme={block.theme}>
      <div className="container mx-auto max-w-5xl">
        {block.heading && <h2 className="mb-8 text-heading-2">{block.heading}</h2>}
        <dl className="grid gap-8 md:grid-cols-3">
          {showStatus && (
            <FactColumn bodyClassName="mt-3 text-lg" label="Status">
              {statusLabels[project.status]}
            </FactColumn>
          )}
          {technologies.length > 0 && (
            <FactColumn bodyClassName="mt-3 flex flex-wrap gap-2" label="Built with">
              {technologies.map((technology) => (
                <span
                  className="border-current/20 border px-3 py-1 text-sm"
                  key={technology.id || technology.name}
                >
                  {technology.name}
                </span>
              ))}
            </FactColumn>
          )}
          {links.length > 0 && (
            <FactColumn bodyClassName="mt-3 flex flex-col gap-2" label="Links">
              {links.map((link) => (
                <a className="underline" href={link.url} key={link.id || link.url}>
                  {link.label}
                </a>
              ))}
            </FactColumn>
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
      <h2 className="text-display">{block.heading}</h2>
      {block.body && <RichText className="mt-8" data={block.body} enableGutter={false} />}
    </div>
  </Section>
)

const RelatedProjectCard = ({ item }: { item: LabPage }) => {
  const coverAsset = populatedDoc<MediaDoc>(item.coverAsset)
  const labProject = populatedDoc<LabProject>(item.labProject)
  return (
    <a className="group pressable pressable-subtle block" href={`/lab/${item.slug}`}>
      {coverAsset && <Media resource={coverAsset} imgClassName="h-auto w-full" />}
      <h3 className="mt-4 text-heading-3 group-hover:underline">
        {labProject ? labProject.title : item.title}
      </h3>
    </a>
  )
}

const RelatedProjects = async ({
  block,
  page,
  project,
}: {
  block: LabRelatedProjectsBlock
  page: LabPage
  project: LabProject
}) => {
  const pages = await resolveRelatedPages<LabPage>({
    automatic: block.selectionMode === 'automatic-capability-match',
    capabilityIds: relationshipIds(project.capabilities || []),
    capabilityPath: 'labProject.capabilities',
    collection: 'lab-pages',
    currentId: page.id,
    limit: block.limit || 3,
    manual: (page.relatedLabPages || []).filter(
      (item): item is LabPage => typeof item === 'object',
    ),
  })
  if (!pages.length) return null
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto">
        <h2 className="mb-8 text-heading-2">{block.heading || 'More from the lab'}</h2>
        <div className={cn('grid gap-8', block.layout === 'grid' && 'md:grid-cols-3')}>
          {pages.map((item) => (
            <RelatedProjectCard item={item} key={item.id} />
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * Lab blocks enter like generic page blocks: the CSS block reveal wraps each
 * section, except `splitContentNarrow`, whose `data-reveal` markers play the
 * shared GSAP reveal — the same motion it has on every other surface.
 */
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
      if (block.blockType === 'splitContentNarrow') {
        return (
          <ScrollReveal as="div" key={block.id} variant={blockRevealVariants.splitContentNarrow}>
            <SplitContentNarrowBlock {...block} />
          </ScrollReveal>
        )
      }
      const content = (() => {
        switch (block.blockType) {
          case 'labStorySection':
            return <StorySection block={block} project={project} />
          case 'labMediaShowcase':
            return <MediaShowcase block={block} />
          case 'labFacts':
            return <Facts block={block} project={project} />
          case 'labTransition':
            return <Transition block={block} />
          case 'labRelatedProjects':
            return <RelatedProjects block={block} page={page} project={project} />
          default:
            return null
        }
      })()
      if (!content) return null
      return <RevealSection key={block.id}>{content}</RevealSection>
    })}
  </>
)
