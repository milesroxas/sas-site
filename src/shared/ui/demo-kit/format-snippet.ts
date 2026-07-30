/** Shape of the code the copy button writes to the clipboard. */
export type SnippetFormat = 'object' | 'props' | 'css-vars'

export type PasteTarget = {
  /** Repo-relative path the values belong in. */
  file: string
  /**
   * The const being replaced (`object`), the component receiving the props
   * (`props`), or the CSS selector holding the custom properties (`css-vars`).
   */
  symbol: string
  format: SnippetFormat
  /** One line naming what to replace at that path. */
  note: string
}

/** Floats arrive from sliders with binary noise (0.30000000000000004). */
function formatNumber(value: number) {
  return String(Number(value.toFixed(4)))
}

function formatObjectValue(value: unknown): string {
  if (typeof value === 'number') return formatNumber(value)
  if (typeof value === 'string') return JSON.stringify(value).replace(/^"|"$/g, "'")
  return String(value)
}

function formatPropValue(value: unknown): string {
  if (typeof value === 'string') return JSON.stringify(value)
  if (typeof value === 'number') return `{${formatNumber(value)}}`
  return `{${String(value)}}`
}

/**
 * Turns the live GUI values into code that can replace the corresponding
 * block at the paste target — a `const` object, a list of JSX props, or a
 * CSS rule of custom properties.
 */
export function formatSnippet(values: Record<string, unknown>, target: PasteTarget): string {
  const entries = Object.entries(values).filter(([, value]) => value !== undefined)

  if (target.format === 'props') {
    return entries.map(([key, value]) => `${key}=${formatPropValue(value)}`).join('\n')
  }

  if (target.format === 'css-vars') {
    // Keys arrive as full custom-property names and values as ready CSS text
    // (`150ms`, `cubic-bezier(...)`) — no quoting.
    const body = entries.map(([key, value]) => `  ${key}: ${String(value)};`).join('\n')
    return `${target.symbol} {\n${body}\n}`
  }

  const body = entries.map(([key, value]) => `  ${key}: ${formatObjectValue(value)},`).join('\n')
  return `const ${target.symbol} = {\n${body}\n} as const`
}
