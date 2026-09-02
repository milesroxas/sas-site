import type { FieldHook, RowField } from 'payload'
import { slugField as baseSlugField } from 'payload'
import { slugify } from 'payload/shared'

type SlugFieldArgs = NonNullable<Parameters<typeof baseSlugField>[0]>

/**
 * Core's `generateSlug` hook only slugifies on create; an update stores the
 * client-sent slug verbatim, so API/MCP clients can write raw strings (emails
 * have landed in slugs this way). Normalize every incoming value; an empty
 * result becomes null so create falls back to the title/name-derived slug.
 */
const normalizeSlug: FieldHook = ({ value }) =>
  typeof value === 'string' ? slugify(value) || null : value

/**
 * Project slug field: Payload's `slugField` with `normalizeSlug` appended to
 * the slug text field's beforeValidate hooks, so a stored slug is URL-safe on
 * every write path (admin, REST, MCP). Accepts the same args as core.
 */
export const slugField = (args: SlugFieldArgs = {}): RowField =>
  baseSlugField({
    ...args,
    overrides: (field) => {
      const slugName = args.name ?? 'slug'
      const withNormalizer: RowField = {
        ...field,
        fields: field.fields.map((f) =>
          f.type === 'text' && f.name === slugName
            ? {
                ...f,
                hooks: {
                  ...f.hooks,
                  beforeValidate: [...(f.hooks?.beforeValidate ?? []), normalizeSlug],
                },
              }
            : f,
        ),
      }
      return args.overrides ? args.overrides(withNormalizer) : withNormalizer
    },
  })
