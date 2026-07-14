'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

// Last-resort boundary: replaces the root layout when a root-level error
// throws, so it must render its own <html>/<body> and cannot rely on
// globals.css (that lives in the route-group layouts).
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          alignItems: 'center',
          display: 'flex',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          justifyContent: 'center',
          margin: 0,
          minHeight: '100vh',
        }}
      >
        <div style={{ maxWidth: '28rem', padding: '1.5rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Something went wrong</h1>
          <p style={{ marginBottom: '1.5rem', opacity: 0.7 }}>
            The error has been reported. Please try again.
          </p>
          <button
            onClick={() => reset()}
            style={{
              border: '1px solid currentcolor',
              background: 'transparent',
              borderRadius: '0.375rem',
              color: 'inherit',
              cursor: 'pointer',
              font: 'inherit',
              padding: '0.5rem 1.25rem',
            }}
            type="button"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
