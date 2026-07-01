import Image from 'next/image'
import { cn } from '@/utilities/ui'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

const LOGO_SRC = '/logo-type.svg'

export const Logo = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  return (
    <Image
      alt="Logo"
      className={cn('max-w-88 w-full h-auto', className)}
      decoding="async"
      height={28}
      loading={loading}
      priority={priority === 'high'}
      src={LOGO_SRC}
      width={352}
    />
  )
}
