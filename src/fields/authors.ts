import type { Field } from 'payload'

/**
 * The byline a Content Hub record carries: the users who wrote it, plus the
 * read-only mirror the website reads.
 *
 * The `users` collection is access-locked to protect privacy, so a public read
 * never resolves the relationship and GraphQL refuses mutated user data.
 * `populatedAuthors` is filled by `@/hooks/populateAuthors` with names alone,
 * and `formatAuthors` turns it into the line a hero prints. Every collection
 * with a byline uses this pair, so that shape is stated once.
 */
export const authorFields = (): Field[] => [
  {
    name: 'authors',
    type: 'relationship',
    relationTo: 'users',
    hasMany: true,
    admin: { position: 'sidebar' },
  },
  {
    name: 'populatedAuthors',
    type: 'array',
    access: { update: () => false },
    admin: { disabled: true, readOnly: true },
    fields: [
      { name: 'id', type: 'text' },
      { name: 'name', type: 'text' },
    ],
  },
]

/** One entry of a record's `populatedAuthors`, as every byline reader sees it. */
export type PopulatedAuthor = { id?: string | null; name?: string | null }
