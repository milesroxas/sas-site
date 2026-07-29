import type { CollectionSlug, PayloadRequest } from 'payload'

export const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  'work-pages': '/works',
  'lab-pages': '/lab',
  'expertise-pages': '/expertise',
  'audience-pages': '/who-we-help',
  posts: '/posts',
  pages: '',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
  req: PayloadRequest
}

export const generatePreviewPath = ({ collection, slug }: Props) => {
  if (slug === undefined || slug === null) {
    return null
  }

  // Encode to support slugs with special characters
  const encodedSlug = encodeURIComponent(slug)

  const encodedParams = new URLSearchParams({
    slug: encodedSlug,
    collection,
    path: `${collectionPrefixMap[collection]}/${encodedSlug}`,
    previewSecret: process.env.PREVIEW_SECRET || '',
  })

  return `/next/preview?${encodedParams.toString()}`
}

/** Preview URL for the Home global (always `/`). */
export const generateHomePreviewPath = (_args: { req: PayloadRequest }) => {
  const encodedParams = new URLSearchParams({
    path: '/',
    global: 'home',
    previewSecret: process.env.PREVIEW_SECRET || '',
  })

  return `/next/preview?${encodedParams.toString()}`
}
