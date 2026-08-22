import { getPublishedWorkPageCards } from '@/collections/WorkPages/queries'
import { WorkPageCard } from '@/components/WorkPageCard'

export default async function WorksPage() {
  const { docs } = await getPublishedWorkPageCards()
  return (
    <main className="container mx-auto py-24">
      <h1 className="mb-12 text-display">Selected work</h1>
      <div className="grid gap-12 md:grid-cols-2">
        {docs.map((page) => (
          <WorkPageCard key={page.id} page={page} />
        ))}
      </div>
    </main>
  )
}
