import clsx from 'clsx'
import Image from 'next/image'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

const LOGO_SRC =
  'https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-logo-light.svg'

export const Logo = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  return (
    <Image
      alt="Payload Logo"
      className={clsx('max-w-[9.375rem] w-full h-[34px]', className)}
      decoding="async"
      height={34}
      loading={loading}
      priority={priority === 'high'}
      src={LOGO_SRC}
      width={193}
    />
  )
}
