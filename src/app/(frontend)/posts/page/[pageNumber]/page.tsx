import { permanentRedirect } from 'next/navigation'

type Args = {
  params: Promise<{
    pageNumber: string
  }>
}

/** Old archive pages; the Insights Index singleton does not paginate. */
export default async function Page({ params }: Args) {
  await params
  permanentRedirect('/posts')
}
