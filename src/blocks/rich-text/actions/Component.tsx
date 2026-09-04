import type React from 'react'
import { CMSLink } from '@/components/Link'
import type { RichTextActionsBlock as RichTextActionsBlockData } from '@/payload-types'
import { cn } from '@/utilities/ui'

type RichTextActionsProps = Pick<RichTextActionsBlockData, 'links'> & {
  className?: string
}

/**
 * Button metrics per appearance. The primary chip is the `action` size; the
 * text action owns its height (the `text` variant) and has no side padding,
 * so alone it sits flush with the copy. The row's 24px gap is the Paper
 * pair's 12px gap plus the 12px inset its text action carried.
 */
const ACTION_SIZE = { default: 'action', text: 'clear' } as const

type Appearance = keyof typeof ACTION_SIZE

const appearanceOf = (value: unknown): Appearance => (value === 'text' ? 'text' : 'default')

/**
 * The row: each link a button in its own appearance, wrapping when the
 * column is too narrow for both. `not-prose` keeps Tailwind Typography's
 * list styling off the row when a prose-mode editor renders the block.
 */
export const RichTextActions: React.FC<RichTextActionsProps> = ({ className, links }) => {
  const rows = links ?? []
  if (rows.length === 0) return null

  return (
    <ul className={cn('not-prose flex flex-wrap items-center gap-6', className)}>
      {rows.map(({ id, link }, index) => {
        const appearance = appearanceOf(link.appearance)
        return (
          <li key={id ?? index}>
            <CMSLink {...link} appearance={appearance} size={ACTION_SIZE[appearance]} />
          </li>
        )
      })}
    </ul>
  )
}
