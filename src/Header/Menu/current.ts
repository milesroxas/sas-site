/**
 * `aria-current` for a menu row against the route. `page` on the row that is
 * the page itself; `true` on a section row the page sits under (Case Studies
 * for /works/foo), so the branch reads as current too. Only paths compare:
 * a row's query or hash is dropped, an off-site row never matches, and a
 * trailing slash on either side does not break the match. The root row only
 * ever matches itself.
 */
export const ariaCurrent = (
  href: string | null | undefined,
  pathname: string,
): 'page' | 'true' | undefined => {
  if (!href?.startsWith('/')) return undefined
  const target = trimSlash(href.split(/[?#]/, 1)[0])
  const current = trimSlash(pathname)
  if (target === current) return 'page'
  if (target !== '/' && current.startsWith(`${target}/`)) return 'true'
  return undefined
}

const trimSlash = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path)

/**
 * The menu's marks as one decision: the deepest row wins. A section row
 * (Case Studies for /works/foo) is marked only when no row in the menu is
 * the page itself, so a featured work page marks its own row and not the
 * section above it as well, while a work the menu does not list still marks
 * the section. `hrefs` is every row the menu renders, visible or not.
 */
export const menuCurrent = (
  hrefs: readonly (string | null | undefined)[],
  pathname: string,
): ((href: string | null | undefined) => 'page' | 'true' | undefined) => {
  const onPage = hrefs.some((href) => ariaCurrent(href, pathname) === 'page')
  return (href) => {
    const mark = ariaCurrent(href, pathname)
    return mark === 'true' && onPage ? undefined : mark
  }
}
