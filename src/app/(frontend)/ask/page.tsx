import { notFound } from 'next/navigation'
import type { Metadata } from 'next/types'
import { AskWidget } from '@/features/ask/AskWidget'
import { getCachedGlobal } from '@/utilities/getGlobals'

export default async function Page() {
  // Site Info › Ask › Hide Ask takes the whole feature off the site, this
  // page included (src/features/ask/README.md).
  const siteInfo = await getCachedGlobal('site-info', 1)()
  if (siteInfo?.ask?.hidden) notFound()

  return (
    <div className="pt-24 pb-24">
      <div className="container">
        <div className="prose dark:prose-invert max-w-none text-center">
          <h1 className="mb-8 lg:mb-16">Ask</h1>
        </div>
        <div className="max-w-[50rem] mx-auto">
          <AskWidget />
        </div>
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Ask | Suits & Sandals',
  }
}
