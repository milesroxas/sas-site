import type { Metadata } from 'next'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description:
    'We help complex organizations make sense to the people who matter. Bringing clarity, trust, and momentum to nuanced ideas.',
  siteName: 'Suits & Sandals',
  title: 'Suits & Sandals',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
