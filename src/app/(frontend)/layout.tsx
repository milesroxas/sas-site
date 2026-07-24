import { SpeedInsights } from '@vercel/speed-insights/next'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import type React from 'react'
import { AdminBar } from '@/components/AdminBar'
import { GlobalCanvasRoot } from '@/components/GlobalCanvasRoot'
import { JsonLd } from '@/components/JsonLd'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { organizationSchema, webSiteSchema } from '@/utilities/schema'
import { cn } from '@/utilities/ui'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()
  const siteInfo = await getCachedGlobal('site-info', 1)()

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <JsonLd data={[organizationSchema(siteInfo), webSiteSchema(siteInfo)]} />
      </head>
      <body>
        <SpeedInsights />
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />

          <Header />
          <Footer />
          {/* data-page-frame: the takeover menu (Header/Menu) crops this wrapper
              into a 16:9 preview window. Header/footer stay outside so they
              remain viewport-fixed chrome. */}
          <div
            data-page-frame
            className="flex min-h-svh flex-col bg-background pt-(--header-height) pb-(--footer-height)"
          >
            {/* Page transitions live in (frontend)/template.tsx, which re-mounts per navigation. */}
            {children}
          </div>
          <GlobalCanvasRoot />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
  },
}
