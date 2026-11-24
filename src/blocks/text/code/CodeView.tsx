import type React from 'react'

import { CodeBlock as CodeSurface } from '@/components/ui/code-block'

export type CodeViewProps = {
  code: string
  language?: string
  blockType: 'code'
}

type Props = CodeViewProps & {
  className?: string
}

/**
 * The `code` block's renderer: CMS fields onto the shared code surface
 * (components/ui/code-block.tsx), which owns every visual decision so a
 * listing reads the same inline in a post body and on the composition grid
 * (`Component.tsx`). The className a caller passes is placement, nothing else.
 */
export const CodeView: React.FC<Props> = ({ className, code, language }) => (
  <CodeSurface className={className} code={code} language={language} />
)
