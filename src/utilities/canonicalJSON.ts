/**
 * JSON with object keys in sorted order and `undefined` members dropped, so
 * two values that mean the same thing serialize to the same string however
 * they were built. Postgres `jsonb` returns keys by length then bytewise, never
 * in authored order, which is why anything hashed or compared across a save
 * goes through here first.
 */
export function canonicalJSON(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJSON).join(',')}]`
  if (value && typeof value === 'object') {
    const object = value as Record<string, unknown>
    const entries = Object.keys(object)
      .filter((key) => object[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJSON(object[key])}`)
    return `{${entries.join(',')}}`
  }
  return JSON.stringify(value)
}
