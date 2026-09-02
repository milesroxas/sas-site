import type { ReactNode } from 'react'
import { Section } from '@/blocks/shared/section'
import type { LabFactsBlock, LabProject } from '@/payload-types'

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

/**
 * The project's metadata as columns. Each column arrives already filtered:
 * a hidden status is `null`, and hidden or internal-only lists arrive empty,
 * so a block with nothing left to show renders nothing.
 */
export const Facts = ({
  block,
  links,
  status,
  technologies,
}: {
  block: LabFactsBlock
  links: NonNullable<LabProject['projectLinks']>
  status: LabProject['status'] | null
  technologies: NonNullable<LabProject['technologies']>
}) => {
  if (!technologies.length && !links.length && !status) return null
  return (
    <Section theme={block.theme}>
      <div className="container mx-auto max-w-5xl">
        {block.heading && <h2 className="mb-8 text-heading-2">{block.heading}</h2>}
        <dl className="grid gap-8 md:grid-cols-3">
          {status && (
            <FactColumn bodyClassName="mt-3 text-lg" label="Status">
              {statusLabels[status]}
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
