import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Subscription confirmed',
  robots: { index: false },
}

type Args = {
  searchParams: Promise<{ state?: string }>
}

/** Landing page for the double-opt-in confirm link (see /api/newsletter/confirm). */
export default async function NewsletterConfirmedPage({ searchParams }: Args) {
  const { state } = await searchParams
  const invalid = state === 'invalid'

  return (
    <div className="container pt-32 pb-24">
      <div className="max-w-xl">
        {invalid ? (
          <>
            <h1 className="text-3xl font-medium">That link didn&apos;t work</h1>
            <p className="mt-4 text-muted-foreground">
              The confirmation link is invalid or was already used. If you&apos;re trying to
              subscribe, sign up again and we&apos;ll send a fresh link.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-medium">You&apos;re on the list</h1>
            <p className="mt-4 text-muted-foreground">
              Your subscription is confirmed. The next letter from the studio will land in your
              inbox — until then, feel free to browse our latest thinking.
            </p>
          </>
        )}
        <p className="mt-8">
          <Link href="/" className="underline underline-offset-4">
            Back to the site
          </Link>
        </p>
      </div>
    </div>
  )
}
