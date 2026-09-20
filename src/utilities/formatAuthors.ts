import type { PopulatedAuthor } from '@/fields/authors'

/**
 * A record's byline as one readable line.
 *
 * Reads `populatedAuthors` from any collection that carries the shared byline
 * pair (`@/fields/authors`), so posts and lab projects print the same line.
 *
 * @example
 * [Author1, Author2] becomes 'Author1 and Author2'
 * [Author1, Author2, Author3] becomes 'Author1, Author2, and Author3'
 */
export const formatAuthors = (authors: PopulatedAuthor[]) => {
  // Ensure we don't have any authors without a name
  const authorNames = authors.map((author) => author.name).filter(Boolean)

  if (authorNames.length === 0) return ''
  if (authorNames.length === 1) return authorNames[0]
  if (authorNames.length === 2) return `${authorNames[0]} and ${authorNames[1]}`

  return `${authorNames.slice(0, -1).join(', ')} and ${authorNames[authorNames.length - 1]}`
}
