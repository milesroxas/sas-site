'use client'

import { IconMail, IconMenu2, IconSparkles, IconTransitionRight } from '@tabler/icons-react'
import { LevaPanel, LevaStoreProvider, useCreateStore } from 'leva'
import type { StoreType } from 'leva/dist/declarations/src/types'
import Link from 'next/link'
import type { ComponentProps, ComponentType, CSSProperties, ReactNode, RefObject } from 'react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { Clock } from '@/Footer/Clock'
import { TakeoverMenu } from '@/Header/Menu'
import { useTakeoverMenuState } from '@/Header/Menu/useTakeoverMenuState'
import { lateralNavTransitionTypes } from '@/shared/lib/view-transition/constants'
import { levaTheme } from './demo-controls'
import { DemoSettingsMenu, DemoSettingsProvider } from './demo-settings'
import { type DemoSiteLink, useDemoSiteChrome } from './demo-site'
import {
  DemoSnippetProvider,
  SnippetCopyButton,
  type SnippetCopyController,
  SnippetGuide,
  useSnippetCopy,
} from './demo-snippet'
import type { PasteTarget } from './format-snippet'

type DemoShellIcon = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>

export type DemoShellSection = {
  /** Stable id — also the URL hash, so sections deep-link. */
  id: string
  /** Sidebar menu label. */
  label: string
  /** Stage heading. */
  title: string
  description: string
  icon: DemoShellIcon
  /**
   * Enables the controls panel with its copy button and paste guide. Sections
   * without one (prose sections) render the stage full-width.
   */
  paste?: PasteTarget
  /** Remounted on every activation, so demos always enter fresh. */
  content: ComponentType
}

export type DemoShellProps = {
  /** Which playground this route is — selects the expanded node in the sidebar tree. */
  playground: DemoPlaygroundHref
  sections: DemoShellSection[]
}

/**
 * Every demo playground route. The sidebar tree lists them all on every demo
 * view, so adding a route here is the single step to list it everywhere.
 */
const DEMO_PLAYGROUNDS = [
  { href: '/demo/immersive', label: 'Micro interactions', icon: IconSparkles },
  { href: '/demo/transitions', label: 'Transitions', icon: IconTransitionRight },
] as const

export type DemoPlaygroundHref = (typeof DEMO_PLAYGROUNDS)[number]['href']

/**
 * Sidebar-pattern playground shell: a left sidebar holding the demo tree
 * (playground routes at the top level, the current playground's sections
 * nested beneath it), the active demo on the main stage under a
 * playground › section breadcrumb, and a right panel holding that demo's GUI
 * and copy/paste controls. One section is live at a time, so only one leva
 * store — and at most one WebGL canvas — is ever mounted.
 *
 * Demo routes hide the fixed site chrome (components/SiteChrome): the shell
 * owns the full viewport and its sidebar re-homes the chrome's content —
 * brand + site menu in the header, footer content in the sidebar footer.
 */
export function DemoShell({ playground, sections }: DemoShellProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '')
  const active = sections.find((section) => section.id === activeId) ?? sections[0]
  const site = useDemoSiteChrome()
  const current = DEMO_PLAYGROUNDS.find((entry) => entry.href === playground) ?? DEMO_PLAYGROUNDS[0]

  // Site-menu state lives here, not in the sidebar: on mobile the sidebar
  // renders inside a sheet that unmounts on close, which would tear an open
  // takeover menu down with it.
  const { menuOpen, setMenuOpen, menuButtonRef } = useTakeoverMenuState()

  // Read after mount — the server render has no location to read a hash from.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (id && sections.some((section) => section.id === id)) setActiveId(id)
  }, [sections])

  const select = (id: string) => {
    setActiveId(id)
    window.history.replaceState(null, '', `#${id}`)
    window.scrollTo(0, 0)
  }

  if (!active) return null

  return (
    <DemoSettingsProvider>
      <SidebarProvider
        defaultOpen={site?.sidebarDefaultOpen ?? true}
        style={
          {
            '--demo-shell-bar-height': '3rem',
            '--demo-controls-width': '20rem',
          } as CSSProperties
        }
      >
        <ShellSidebar
          playground={current.href}
          sections={sections}
          activeId={active.id}
          onSelect={select}
          menuButtonRef={menuButtonRef}
          onMenuOpen={() => setMenuOpen(true)}
        />
        <SidebarInset>
          <ShellHeader playground={current} section={active} />
          {/* Keyed so switching sections tears the previous demo down whole:
              fresh leva store, fresh playground state, no canvas left behind. */}
          <SectionStage key={active.id} section={active} />
        </SidebarInset>
        <ShellSiteMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          menuButtonRef={menuButtonRef}
        />
      </SidebarProvider>
    </DemoSettingsProvider>
  )
}

function ShellSidebar({
  playground,
  sections,
  activeId,
  onSelect,
  menuButtonRef,
  onMenuOpen,
}: {
  playground: DemoPlaygroundHref
  sections: DemoShellSection[]
  activeId: string
  onSelect: (id: string) => void
  menuButtonRef: RefObject<HTMLButtonElement | null>
  onMenuOpen: () => void
}) {
  const { setOpenMobile } = useSidebar()

  return (
    <Sidebar>
      <SidebarHeader>
        <ShellBrand menuButtonRef={menuButtonRef} onMenuOpen={onMenuOpen} />
      </SidebarHeader>
      {/* data-lenis-prevent: root Lenis stays mounted on demo routes and would
          otherwise consume wheel input over this nested scroll container. */}
      <SidebarContent data-lenis-prevent>
        <SidebarGroup>
          <SidebarGroupLabel>Playgrounds</SidebarGroupLabel>
          <SidebarGroupContent>
            {/* One tree: playground routes at the top level, sections nested
                under the playground you are on. Only the current playground
                expands — its sections are what this route renders; a sibling
                is a plain link whose sections appear once you arrive. The
                current-state pill marks the deepest row only (the section),
                so the expanded parent reads as structure, not selection. */}
            <SidebarMenu>
              {DEMO_PLAYGROUNDS.map((entry) => {
                const Icon = entry.icon
                const expanded = entry.href === playground
                return (
                  <SidebarMenuItem key={entry.href}>
                    <SidebarMenuButton
                      asChild
                      aria-current={expanded ? 'location' : undefined}
                      className="aria-[current]:font-medium"
                    >
                      {/* Sibling playground moves, so nav-lateral. */}
                      <Link href={entry.href} transitionTypes={[...lateralNavTransitionTypes]}>
                        <Icon aria-hidden />
                        <span>{entry.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {expanded ? (
                      <SidebarMenuSub>
                        {sections.map((section) => {
                          const isActive = section.id === activeId
                          return (
                            <SidebarMenuSubItem key={section.id}>
                              <SidebarMenuSubButton
                                href={`#${section.id}`}
                                isActive={isActive}
                                aria-current={isActive ? 'page' : undefined}
                                onClick={(event) => {
                                  // The shell owns the hash (replaceState) so
                                  // section hops never stack history entries.
                                  event.preventDefault()
                                  onSelect(section.id)
                                  setOpenMobile(false)
                                }}
                              >
                                <span>{section.label}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    ) : null}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <ShellFooter />
      <SidebarRail />
    </Sidebar>
  )
}

/**
 * Internal site links carry the lateral nav transition; new-tab links open
 * plainly. Spreads props so it composes with `asChild` slots.
 */
function SiteLink({
  link,
  children,
  ...props
}: { link: DemoSiteLink; children: ReactNode } & Omit<ComponentProps<'a'>, 'href'>) {
  return link.newTab ? (
    <a href={link.href} rel="noopener noreferrer" target="_blank" {...props}>
      {children}
    </a>
  ) : (
    <Link href={link.href} transitionTypes={[...lateralNavTransitionTypes]} {...props}>
      {children}
    </Link>
  )
}

/**
 * Brand row re-homing the hidden site header: the wordmark linking home plus
 * the MENU trigger for the takeover site menu — the same menu the fixed
 * header opens on every other route. The trigger hides when no site chrome
 * is provided (stories, tests). The row carries no playground caption: the
 * tree below marks the playground, and the stage breadcrumb names it.
 */
function ShellBrand({
  menuButtonRef,
  onMenuOpen,
}: {
  menuButtonRef: RefObject<HTMLButtonElement | null>
  onMenuOpen: () => void
}) {
  const site = useDemoSiteChrome()
  const { setOpenMobile } = useSidebar()

  return (
    <div className="px-2 pt-1 pb-0.5">
      <div className="flex h-7 items-center justify-between gap-2">
        <Link
          href="/"
          transitionTypes={[...lateralNavTransitionTypes]}
          className="whitespace-nowrap text-sm font-medium tracking-[0.19em] transition-opacity hover:opacity-70"
        >
          SUITS &amp; SANDALS
        </Link>
        {site ? (
          <Button
            ref={menuButtonRef}
            variant="ghost"
            size="icon"
            aria-controls="site-menu"
            aria-label="Open site menu"
            className="pressable -mr-1 size-7"
            onClick={() => {
              // The takeover crops the page frame; close the mobile sheet so
              // it isn't left floating above the menu.
              setOpenMobile(false)
              onMenuOpen()
            }}
          >
            <IconMenu2 aria-hidden />
          </Button>
        ) : null}
      </div>
    </div>
  )
}

/**
 * The takeover site menu (Header/Menu), portaled to <body>: it freezes and
 * crops `[data-page-frame]` into a preview window, and the whole demo shell
 * lives inside that frame — mounted in place it would be cropped and inert
 * along with the page. On regular routes the fixed header's CLOSE button
 * (z-50, outside the frame) dismisses it; demo routes have no header, so the
 * portal carries its own CLOSE pill echoing that control.
 */
function ShellSiteMenu({
  open,
  onClose,
  menuButtonRef,
}: {
  open: boolean
  onClose: () => void
  menuButtonRef: RefObject<HTMLButtonElement | null>
}) {
  const site = useDemoSiteChrome()
  // Portal after mount — the server render has no document.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!site || !mounted) return null

  return createPortal(
    <>
      <TakeoverMenu
        data={site.header}
        menuContent={site.menuContent}
        open={open}
        onClose={onClose}
        menuButtonRef={menuButtonRef}
      />
      {open ? (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex h-(--header-bar-height) items-center justify-center">
          <button
            type="button"
            aria-controls="site-menu"
            aria-label="Close menu"
            onClick={onClose}
            className="pressable pointer-events-auto h-8 rounded-full bg-secondary px-6 text-sm font-black tracking-[0.58em] text-secondary-foreground outline-none transition-opacity duration-200 ease-out starting:opacity-0 hover:opacity-70 focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {/* -mr compensates the trailing letter-space so the label centers. */}
            <span className="mr-[-0.58em]">CLOSE</span>
          </button>
        </div>
      ) : null}
    </>,
    document.body,
  )
}

/**
 * Re-homes the hidden site footer as a vertical stack: the get-in-touch CTA
 * as the action row, then a quiet meta block — location and live clock on
 * their own lines so neither ever truncates in the narrow rail.
 */
function ShellFooter() {
  const site = useDemoSiteChrome()
  if (!site) return null

  return (
    <SidebarFooter>
      {site.getInTouch ? (
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <SiteLink link={site.getInTouch}>
                <IconMail aria-hidden />
                <span>{site.getInTouch.label}</span>
              </SiteLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      ) : null}
      <SidebarSeparator className="mx-0" />
      <div className="flex flex-col gap-1.5 px-2 pt-0.5 pb-1">
        <span className="font-mono text-[0.625rem]/relaxed uppercase tracking-widest text-sidebar-foreground/60">
          {site.location}
        </span>
        <Clock className="text-[0.625rem] text-sidebar-foreground/60" />
      </div>
    </SidebarFooter>
  )
}

/**
 * Stage bar with a two-level breadcrumb mirroring the sidebar tree: the
 * playground (a link back to its first section) then the section you are on.
 * The playground crumb steps aside on narrow screens so the section title,
 * the more specific of the two, always has the room.
 */
function ShellHeader({
  playground,
  section,
}: {
  playground: (typeof DEMO_PLAYGROUNDS)[number]
  section: DemoShellSection
}) {
  return (
    <header className="sticky top-0 z-10 flex h-(--demo-shell-bar-height) shrink-0 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur-sm">
      <SidebarTrigger />
      {/* data-vertical: — the component's own self-stretch is variant-scoped,
          so the overrides must ride the same variant to replace it. */}
      <Separator orientation="vertical" className="data-vertical:h-4 data-vertical:self-center" />
      <nav aria-label="Breadcrumb" className="min-w-0">
        <ol className="flex min-w-0 items-center gap-1.5 text-sm">
          <li className="hidden min-w-0 items-center gap-1.5 sm:flex">
            <Link
              href={playground.href}
              className="truncate text-muted-foreground transition-colors hover:text-foreground"
            >
              {playground.label}
            </Link>
            <span aria-hidden className="text-muted-foreground/60">
              /
            </span>
          </li>
          <li className="min-w-0">
            <span aria-current="page" className="block truncate font-medium">
              {section.title}
            </span>
          </li>
        </ol>
      </nav>
      <div className="ml-auto">
        <DemoSettingsMenu />
      </div>
    </header>
  )
}

/**
 * The active demo: description and content on the main stage, its GUI and
 * copy/paste controls in the right panel when the section declares a paste
 * target.
 */
function SectionStage({ section }: { section: DemoShellSection }) {
  const store = useCreateStore()
  const snippetCopy = useSnippetCopy(section.paste)
  const Content = section.content
  const Icon = section.icon

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto w-full max-w-3xl space-y-6">
          <header className="space-y-2">
            {/* The section's icon lives here, not on its sidebar row: nested
                rows stay text-only so the tree's two levels read apart. */}
            <h1 className="flex items-center gap-2.5 text-balance text-heading-3">
              <Icon aria-hidden className="size-5 shrink-0 text-muted-foreground" />
              {section.title}
            </h1>
            <p className="max-w-prose text-pretty text-sm/relaxed text-muted-foreground">
              {section.description}
            </p>
          </header>
          <DemoSnippetProvider register={snippetCopy.register}>
            <LevaStoreProvider store={store}>
              <Content />
            </LevaStoreProvider>
          </DemoSnippetProvider>
        </div>
      </div>
      {section.paste ? (
        <ControlsPanel store={store} paste={section.paste} snippetCopy={snippetCopy} />
      ) : null}
    </div>
  )
}

/**
 * The right controls panel: the section's leva GUI, the copy button emitting
 * the registered snippet values, and the paste target they belong to. Sticky
 * beside the stage on desktop, stacked below it on small screens.
 */
function ControlsPanel({
  store,
  paste,
  snippetCopy,
}: {
  store: StoreType
  paste: PasteTarget
  snippetCopy: SnippetCopyController
}) {
  return (
    <aside
      aria-label="Demo controls"
      className="w-full shrink-0 border-t border-sidebar-border bg-sidebar text-sidebar-foreground lg:w-(--demo-controls-width) lg:border-t-0 lg:border-l"
    >
      {/* data-lenis-prevent: keeps wheel input over the pinned panel scrolling
          the controls, not the page under root Lenis. */}
      <div
        data-lenis-prevent
        className="lg:sticky lg:top-(--demo-shell-bar-height) lg:max-h-[calc(100svh-var(--demo-shell-bar-height))] lg:overflow-y-auto"
      >
        <div className="flex h-(--demo-shell-bar-height) items-center justify-between gap-2 px-4">
          <span className="text-xs font-medium uppercase tracking-wider text-sidebar-foreground/70">
            Controls
          </span>
          <SnippetCopyButton controller={snippetCopy} variant="ghost" />
        </div>
        <Separator className="bg-sidebar-border" />
        <div className="p-2">
          <LevaPanel store={store} theme={levaTheme} fill titleBar={false} hideCopyButton />
        </div>
        <p className="px-4 pb-4 font-mono text-xs text-sidebar-foreground/60">
          {paste.file} · {paste.symbol}
        </p>
      </div>

      <SnippetGuide controller={snippetCopy} paste={paste} />
    </aside>
  )
}
