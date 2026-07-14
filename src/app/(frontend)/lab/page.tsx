import { getPublishedLabPageCards } from '@/collections/LabPages/queries'
import { LabPageCard } from '@/components/LabPageCard'

export default async function LabPage() {
  const { docs } = await getPublishedLabPageCards()
  return (
    <main className="container mx-auto py-24">
      <h1 className="mb-12 text-5xl md:text-8xl">The lab</h1>
      <div className="grid gap-12 md:grid-cols-2">
        {docs.map((page) => (
          <LabPageCard key={page.id} page={page} />
        ))}
      </div>
    </main>
  )
}
