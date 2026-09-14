/**
 * Shape of the code the copy button writes to the clipboard. `code` means the
 * demo content registers ready-to-paste source itself (a section whose paste
 * spans more than one symbol, say); the other three format registered values.
 */
export type SnippetFormat = 'object' | 'props' | 'css-vars' | 'code'

export type PasteTarget = {
  /** Repo-relative path the values belong in. */
  file: string
  /**
   * The const being replaced (`object`), the component receiving the props
   * (`props`), the CSS selector holding the custom properties (`css-vars`),
   * or the symbol the pasted code feeds (`code`).
   */
  symbol: string
  format: SnippetFormat
  /** One line naming what to replace at that path. */
  note: string
  /** What to do after the paste, in order, when one paste is not the whole job. */
  steps?: string[]
}

/** What demo content registers: a values bag to format, or finished code. */
export type SnippetValues = Record<string, unknown> | string

/** Floats arrive from sliders with binary noise (0.30000000000000004). */
function formatNumber(value: number) {
  return String(Number(value.toFixed(4)))
}

/** One value as it reads inside an object literal: `2.8`, `'grid'`, `[0.5, 1, 1]`. */
export function formatObjectValue(value: unknown): string {
  if (typeof value === 'number') return formatNumber(value)
  if (typeof value === 'string') return JSON.stringify(value).replace(/^"|"$/g, "'")
  if (Array.isArray(value)) return `[${value.map(formatObjectValue).join(', ')}]`
  return String(value)
}

function formatPropValue(value: unknown): string {
  if (typeof value === 'string') return JSON.stringify(value)
  if (typeof value === 'number') return `{${formatNumber(value)}}`
  return `{${formatObjectValue(value)}}`
}

/**
 * Turns the live GUI values into code that can replace the corresponding
 * block at the paste target: a `const` object, a list of JSX props, or a
 * CSS rule of custom properties. Registered code passes through as is.
 */
export function formatSnippet(values: SnippetValues, target: PasteTarget): string {
  if (typeof values === 'string') return values

  const entries = Object.entries(values).filter(([, value]) => value !== undefined)

  if (target.format === 'props') {
    return entries.map(([key, value]) => `${key}=${formatPropValue(value)}`).join('\n')
  }

  if (target.format === 'css-vars') {
    // Keys arrive as full custom-property names and values as ready CSS text
    // (`150ms`, `cubic-bezier(...)`), so there is no quoting.
    const body = entries.map(([key, value]) => `  ${key}: ${String(value)};`).join('\n')
    return `${target.symbol} {\n${body}\n}`
  }

  const body = entries.map(([key, value]) => `  ${key}: ${formatObjectValue(value)},`).join('\n')
  return `const ${target.symbol} = {\n${body}\n} as const`
}
