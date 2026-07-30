/** Shape of the code the copy button writes to the clipboard. */
export type SnippetFormat = 'object' | 'props'

export type PasteTarget = {
  /** Repo-relative path the values belong in. */
  file: string
  /** The const being replaced (`object`) or the component receiving the props (`props`). */
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
 * block at the paste target — a `const` object, or a list of JSX props.
 */
export function formatSnippet(values: Record<string, unknown>, target: PasteTarget): string {
  const entries = Object.entries(values).filter(([, value]) => value !== undefined)

  if (target.format === 'props') {
    return entries.map(([key, value]) => `${key}=${formatPropValue(value)}`).join('\n')
  }

  const body = entries.map(([key, value]) => `  ${key}: ${formatObjectValue(value)},`).join('\n')
  return `const ${target.symbol} = {\n${body}\n} as const`
}
