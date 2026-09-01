import type { ArrayField, Field, RelationshipField, TextareaField } from 'payload'
import { authenticatedField } from '@/access/authenticatedField'

/**
 * Field sets the website page and project collections share. Each is a factory
 * so every collection gets its own object — Payload mutates field configs
 * while sanitizing them, and a shared literal would leak that between
 * collections.
 */
/**
 * Internal editorial scratchpad on a website page. Team-only at the field
 * level, so the notes never reach the public API even on a published document.
 */
export const editorialNotesField = (): TextareaField => ({
  name: 'editorialNotes',
  type: 'textarea',
  access: {
    read: authenticatedField,
    update: authenticatedField,
  },
})

/**
 * Related URLs for a project record, each publishable or internal. Internal
 * links are filtered out of public responses downstream, so editors can keep
 * working references beside the ones the site shows.
 */
export const projectLinksField = (): ArrayField => ({
  name: 'projectLinks',
  type: 'array',
  admin: { description: 'Related URLs. Set visibility per link.' },
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'url', type: 'text', required: true },
    {
      name: 'visibility',
      type: 'select',
      defaultValue: 'public',
      options: ['public', 'internal'],
      admin: { description: 'Internal links never appear in the public API.' },
    },
  ],
})

/**
 * "More like this" picker for a page collection: other documents in the same
 * collection, with the document being edited excluded from its own list.
 */
export const relatedPagesField = (
  name: string,
  relationTo: 'lab-pages' | 'posts' | 'work-pages',
): RelationshipField => ({
  name,
  type: 'relationship',
  relationTo,
  hasMany: true,
  filterOptions: ({ id }) => ({ id: { not_in: id ? [id] : [] } }),
})

/** Sidebar publishing controls every website page collection carries. */
export const pagePublishingFields = (): Field[] => [
  { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
  { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
]
