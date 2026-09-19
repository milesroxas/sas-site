import type { z } from 'zod'

/**
 * One reader for every spec: the save-time validation, the admin field
 * validator and the renderers all parse through here, so a spec is accepted
 * and drawn by exactly one definition of valid.
 */

/** A problem pinned to where it sits in the spec, e.g. `rows[3].revenue`. Empty path: the spec itself. */
export type SpecIssue = { message: string; path: string }

export type SpecResult<T> = { issues: SpecIssue[]; spec?: never } | { issues?: never; spec: T }

/**
 * Enough for an author to fix everything in one pass, short enough to read.
 * A 500-row chart with one wrong column would otherwise report 500 times.
 */
const MAX_ISSUES = 12

const formatPath = (path: readonly PropertyKey[]): string =>
  path.reduce<string>((out, segment) => {
    if (typeof segment === 'number') return `${out}[${segment}]`
    return out ? `${out}.${String(segment)}` : String(segment)
  }, '')

export function readSpec<T>(schema: z.ZodType<T>, value: unknown): SpecResult<T> {
  let input = value
  // A JSON field arrives as a string from some clients (the REST form body, MCP).
  if (typeof input === 'string') {
    try {
      input = JSON.parse(input)
    } catch {
      return { issues: [{ message: 'is not valid JSON', path: '' }] }
    }
  }
  if (input === null || input === undefined)
    return { issues: [{ message: 'is required', path: '' }] }

  const result = schema.safeParse(input)
  if (result.success) return { spec: result.data }
  return {
    issues: result.error.issues.map((issue) => ({
      message: issue.message,
      path: formatPath(issue.path),
    })),
  }
}

/** Issues as one sentence list, capped, for an error message a person or an agent reads. */
export function describeIssues(issues: readonly SpecIssue[]): string {
  const shown = issues
    .slice(0, MAX_ISSUES)
    .map(({ message, path }) => (path ? `${path}: ${message}` : message))
  const rest = issues.length - shown.length
  return rest > 0 ? `${shown.join('; ')}; and ${rest} more` : shown.join('; ')
}
