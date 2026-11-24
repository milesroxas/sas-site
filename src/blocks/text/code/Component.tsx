import type React from 'react'
import { BlockGrid } from '@/blocks/shared/grid'
import { Section } from '@/blocks/shared/section'
import { Container } from '@/components/Container'
import type { CodeBlock as CodeBlockData } from '@/payload-types'
import { CodeView } from './CodeView'

/**
 * `bare` skips the band for callers that supply their own shell (a Section
 * block's band, or a renderer's reveal band).
 */
type CodeBlockProps = Pick<CodeBlockData, 'code' | 'language'> & { bare?: boolean }

/**
 * Code as a composition block: the listing on the reading column (columns
 * 3-6), the measure rich text sets, so prose and the code it discusses share
 * an edge. The listing scrolls inside its own frame; the column never grows.
 */
export const CodeBlock: React.FC<CodeBlockProps> = ({ bare, code, language }) => (
  <Section bare={bare}>
    <Container>
      <BlockGrid>
        <CodeView
          blockType="code"
          className="min-w-0 md:col-span-4 md:col-start-3"
          code={code}
          language={language ?? undefined}
        />
      </BlockGrid>
    </Container>
  </Section>
)
