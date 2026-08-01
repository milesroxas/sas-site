'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'
import { lateralNavTransitionTypes } from '@/shared/lib/view-transition/constants'

const DEMOS = [
  { href: '/demo/immersive', label: 'Micro interactions' },
  { href: '/demo/transitions', label: 'Transitions' },
] as const

/** Switcher between the demo playground routes. Sibling moves, so nav-lateral. */
export function DemoNav() {
  const pathname = usePathname()

  return (
    <NavigationMenu aria-label="Demo pages">
      <NavigationMenuList className="gap-1">
        {DEMOS.map((demo) => (
          <NavigationMenuItem key={demo.href}>
            <NavigationMenuLink active={pathname === demo.href} asChild>
              <Link href={demo.href} transitionTypes={[...lateralNavTransitionTypes]}>
                {demo.label}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
