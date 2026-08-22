import type { Metadata } from 'next'
import { UnsubscribeForm } from './page.client'

export const metadata: Metadata = {
  title: 'Unsubscribe',
  robots: { index: false },
}

type Args = {
  searchParams: Promise<{ token?: string }>
}

/** Target of the unsubscribe link in every newsletter footer. */
export default async function NewsletterUnsubscribePage({ searchParams }: Args) {
  const { token } = await searchParams

  return (
    <div className="container pt-32 pb-24">
      <div className="max-w-xl">
        <h1 className="text-heading-2">Unsubscribe from the newsletter</h1>
        {token ? (
          <>
            <p className="mt-4 text-muted-foreground">
              One click and you&apos;re out — no questions, no hoops.
            </p>
            <UnsubscribeForm token={token} />
          </>
        ) : (
          <p className="mt-4 text-muted-foreground">
            This unsubscribe link is incomplete. Use the link from the bottom of any newsletter
            email, or write to us and we&apos;ll take care of it.
          </p>
        )}
      </div>
    </div>
  )
}
