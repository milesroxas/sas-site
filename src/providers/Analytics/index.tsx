import type React from 'react'

import { GoogleAnalytics } from './GoogleAnalytics'
import { PostHogProvider } from './PostHog'
import { Reb2b } from './Reb2b'

// Product analytics, gated on the c15t `measurement` consent category —
// must render inside ConsentProvider. Error monitoring (Sentry) is not
// consent-gated and lives in the instrumentation files instead.
export const AnalyticsProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <PostHogProvider>
      {children}
      <GoogleAnalytics />
      <Reb2b />
    </PostHogProvider>
  )
}
