import {
  IconAlertTriangle,
  IconCircleCheck,
  IconExclamationCircle,
  IconInfoCircle,
} from '@tabler/icons-react'
import type React from 'react'
// Payload website-template pattern: RichText renders embedded blocks, blocks render rich text
// fallow-ignore-next-line circular-dependency
import RichText from '@/components/RichText'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { BannerBlock as BannerBlockProps } from '@/payload-types'
import { cn } from '@/utilities/ui'

type Props = {
  className?: string
} & BannerBlockProps

const iconByStyle = {
  info: IconInfoCircle,
  error: IconExclamationCircle,
  success: IconCircleCheck,
  warning: IconAlertTriangle,
} as const

export const BannerBlock: React.FC<Props> = ({ className, content, style }) => {
  const variant = style ?? 'info'
  const Icon = iconByStyle[variant]

  return (
    <div className={cn('mx-auto my-8 w-full', className)}>
      <Alert variant={variant}>
        <Icon />
        <AlertDescription>
          <RichText data={content} enableGutter={false} enableProse={false} />
        </AlertDescription>
      </Alert>
    </div>
  )
}
