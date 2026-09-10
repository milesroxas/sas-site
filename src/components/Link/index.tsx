import type { VariantProps } from 'class-variance-authority'
import Link from 'next/link'
import type React from 'react'
import { Button, type buttonVariants } from '@/components/ui/button'
import type { SitePage } from '@/fields/sitePages'
import type { ContactPage, Page, Post } from '@/payload-types'
import {
  backNavTransitionTypes,
  forwardNavTransitionTypes,
  lateralNavTransitionTypes,
} from '@/shared/lib/view-transition'
import { cn } from '@/utilities/ui'
import { resolveCmsLinkHref } from './resolve-href'

const navTransitionTypesByDirection = {
  forward: forwardNavTransitionTypes,
  back: backNavTransitionTypes,
  lateral: lateralNavTransitionTypes,
} as const

type ButtonVariants = VariantProps<typeof buttonVariants>

type CMSLinkType = {
  appearance?: 'inline' | ButtonVariants['variant']
  /** Marks the link's destination as the current page or its section. */
  'aria-current'?: React.AriaAttributes['aria-current']
  /** A link to the page itself is out of play; see the takeover menu's currentProps. */
  'aria-disabled'?: React.AriaAttributes['aria-disabled']
  tabIndex?: number
  children?: React.ReactNode
  className?: string
  label?: string | null
  newTab?: boolean | null
  reference?: {
    relationTo: 'contact-pages' | 'pages' | 'posts'
    value: ContactPage | Page | Post | string | number
  } | null
  size?: ButtonVariants['size'] | null
  sitePage?: SitePage | null
  /** Spatial relationship of the destination. CMS links default to a lateral fade. */
  transitionDirection?: 'forward' | 'back' | 'lateral'
  type?: 'custom' | 'reference' | 'site' | null
  url?: string | null
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    type,
    appearance = 'inline',
    'aria-current': ariaCurrent,
    'aria-disabled': ariaDisabled,
    tabIndex,
    children,
    className,
    label,
    newTab,
    reference,
    size: sizeFromProps,
    sitePage,
    transitionDirection = 'lateral',
    url,
  } = props

  const href = resolveCmsLinkHref({ type, reference, sitePage, url })

  if (!href) return null

  const size = appearance === 'link' ? 'clear' : sizeFromProps
  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}
  const transitionProps = !newTab
    ? { transitionTypes: [...navTransitionTypesByDirection[transitionDirection]] }
    : {}

  /* Ensure we don't break any styles set by richText */
  if (appearance === 'inline') {
    return (
      <Link
        aria-current={ariaCurrent}
        aria-disabled={ariaDisabled}
        className={cn(className)}
        href={href || url || ''}
        tabIndex={tabIndex}
        {...newTabProps}
        {...transitionProps}
      >
        {label && label}
        {children && children}
      </Link>
    )
  }

  return (
    <Button asChild className={className} size={size} variant={appearance}>
      <Link
        aria-current={ariaCurrent}
        aria-disabled={ariaDisabled}
        className={cn(className)}
        href={href || url || ''}
        tabIndex={tabIndex}
        {...newTabProps}
        {...transitionProps}
      >
        {label && label}
        {children && children}
      </Link>
    </Button>
  )
}
