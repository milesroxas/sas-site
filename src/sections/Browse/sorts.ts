/**
 * The orderings an index offers, stated once per index as a registry: the
 * strip renders the labels in declaration order and the set sorts by the
 * matching comparator, so adding an ordering is one entry. The comparators
 * every dated, titled set shares live here so no index restates them.
 */

export type SortOrder<T> = { label: string; compare: (a: T, b: T) => number }

export type SortRegistry<T> = Record<string, SortOrder<T>>

type Dated = { publishedAt?: string | null }
type Titled = { title: string }

const publishedTime = (item: Dated) => (item.publishedAt ? new Date(item.publishedAt).getTime() : 0)

export const newestFirst = (a: Dated, b: Dated) => publishedTime(b) - publishedTime(a)
const oldestFirst = (a: Dated, b: Dated) => publishedTime(a) - publishedTime(b)
const alphabetical = (a: Titled, b: Titled) => a.title.localeCompare(b.title)

/** The three orderings any published, titled set carries. */
export const DATED_SORTS = {
  newest: { label: 'Newest', compare: newestFirst },
  oldest: { label: 'Oldest', compare: oldestFirst },
  az: { label: 'A–Z', compare: alphabetical },
} satisfies SortRegistry<Dated & Titled>

/** A registry's keys in declaration order, typed as the registry's own union. */
export const sortKeys = <R extends object>(registry: R) =>
  Object.keys(registry) as (keyof R & string)[]
