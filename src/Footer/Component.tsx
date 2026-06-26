import Link from 'next/link'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import type { Footer as FooterData } from '@/payload-types'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { linkNavTransitionTypes } from '@/shared/lib/view-transition'
import { getCachedGlobal } from '@/utilities/getGlobals'

export async function Footer() {
  const footerData: FooterData = await getCachedGlobal('footer', 1)()

  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto border-t border-border bg-black dark:bg-card text-white">
      <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between">
        <Link className="flex items-center" href="/" transitionTypes={[...linkNavTransitionTypes]}>
          <Logo />
        </Link>

        <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
          <ThemeSelector />
          <Link
            className="text-white/70 text-sm underline-offset-4 hover:underline"
            href="/demo/immersive"
            transitionTypes={[...linkNavTransitionTypes]}
          >
            Immersive lab
          </Link>
          <nav className="flex flex-col md:flex-row gap-4">
            {navItems.map(({ link }, i) => {
              return <CMSLink className="text-white" key={i} {...link} />
            })}
          </nav>
        </div>
      </div>
    </footer>
  )
}
