import type React from 'react'

import { CodeBlock as CodeSurface } from '@/components/ui/code-block'

export type CodeBlockProps = {
  code: string
  language?: string
  blockType: 'code'
}

type Props = CodeBlockProps & {
  className?: string
}

/**
 * The `code` block's renderer: CMS fields onto the shared code surface
 * (components/ui/code-block.tsx), which owns every visual decision so a
 * listing reads the same inline in a post body and on the composition grid
 * (`Section.tsx`). The className a caller passes is placement, nothing else.
 */
export const CodeBlock: React.FC<Props> = ({ className, code, language }) => (
  <CodeSurface className={className} code={code} language={language} />
)
