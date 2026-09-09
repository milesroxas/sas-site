/**
 * Reads a `--vt-*` time variable off `:root` as milliseconds; 0 when
 * unset/invalid. The CSS minifier may reserialize `150ms` as `.15s`, so the
 * unit must be honored, not assumed. Shared by every imperative consumer of
 * the `view-transition.css` timing block (the work-open beat split, the
 * menu's navigation curtain) so the `:root` vars stay the only tuning.
 */
export const rootMs = (styles: CSSStyleDeclaration, name: string) => {
  const raw = styles.getPropertyValue(name).trim()
  const value = parseFloat(raw)
  if (!Number.isFinite(value)) return 0
  return raw.endsWith('ms') ? value : value * 1000
}
