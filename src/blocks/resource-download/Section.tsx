import type React from 'react'
import { BlockGrid } from '@/blocks/shared/grid'
import { Section } from '@/blocks/shared/section'
import { Container } from '@/components/Container'
import { ResourceDownload, type ResourceDownloadProps } from './Component'
import { downloadableResource } from './resource'

/**
 * `bare` skips the band for callers that supply their own shell (a Section
 * block's band, or a renderer's reveal band).
 */
type ResourceDownloadSectionProps = Omit<ResourceDownloadProps, 'className'> & { bare?: boolean }

/**
 * Download as a composition block: the card on the reading column (columns
 * 3-6), the measure rich text sets, so a download shares an edge with the
 * prose that introduces it, exactly as Code does.
 */
export const ResourceDownloadSection: React.FC<ResourceDownloadSectionProps> = ({
  bare,
  ...props
}) => {
  // No band at all for a file visitors cannot have, not an empty one.
  if (!downloadableResource(props.resource)) return null
  return (
    <Section bare={bare}>
      <Container>
        <BlockGrid>
          <ResourceDownload className="md:col-span-4 md:col-start-3" {...props} />
        </BlockGrid>
      </Container>
    </Section>
  )
}
