import { getPublishedWorkPageCards } from '@/collections/WorkPages/queries'
import { Media } from '@/components/Media'

export default async function WorksPage() {
  const { docs } = await getPublishedWorkPageCards()
  return (
    <main className="container mx-auto py-24">
      <h1 className="mb-12 text-5xl md:text-8xl">Selected work</h1>
      <div className="grid gap-12 md:grid-cols-2">
        {docs.map((page) => {
          const study = typeof page.caseStudy === 'object' ? page.caseStudy : null
          return (
            <a className="group" href={`/works/${page.slug}`} key={page.id}>
              {page.coverAsset && typeof page.coverAsset === 'object' && (
                <Media resource={page.coverAsset} imgClassName="h-auto w-full" />
              )}
              <h2 className="mt-5 text-3xl group-hover:underline">{study?.title || page.title}</h2>
              {study && (
                <p className="mt-2 opacity-75">
                  {study.summaries?.oneLine || study.summaries?.short}
                </p>
              )}
            </a>
          )
        })}
      </div>
    </main>
  )
}
