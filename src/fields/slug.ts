import type { FieldHook, RowField } from 'payload'
import { slugField as baseSlugField, ValidationError } from 'payload'
import { slugify } from 'payload/shared'
import { isValidEmailAddress } from '@/utilities/emailAddress'

type SlugFieldArgs = NonNullable<Parameters<typeof baseSlugField>[0]>

/**
 * Refuse an email address on its way into a slug. Browser and password
 * manager autofill drop the signed-in address into a new document's title or
 * an unlocked slug input, and slugify turns `name@example.com` into a
 * plausible `nameexamplecom` that nobody notices. Checked before
 * normalization, on the raw slug and on the field the slug is generated from,
 * so the save fails with the offending field highlighted.
 */
const refuseEmail =
  (slugName: string, useAsSlug: string): FieldHook =>
  ({ collection, data, global, value }) => {
    const errors = []
    if (typeof value === 'string' && value.includes('@')) {
      errors.push({
        message:
          'This holds an email address, usually from browser or password manager autofill. Clear it so it generates from the title.',
        path: slugName,
      })
    }
    const source: unknown = data?.[useAsSlug]
    if (typeof source === 'string' && isValidEmailAddress(source.trim())) {
      errors.push({
        message:
          'This is an email address, usually from browser or password manager autofill. Replace it before saving.',
        path: useAsSlug,
      })
    }
    if (errors.length)
      throw new ValidationError({ collection: collection?.slug, errors, global: global?.slug })
    return value
  }

/**
 * Core's `generateSlug` hook only slugifies on create; an update stores the
 * client-sent slug verbatim, so API/MCP clients can write raw strings.
 * Normalize every incoming value; an empty result becomes null so create
 * falls back to the title/name-derived slug.
 */
const normalizeSlug: FieldHook = ({ value }) =>
  typeof value === 'string' ? slugify(value) || null : value

/**
 * Project slug field: Payload's `slugField` with `refuseEmail` and
 * `normalizeSlug` appended to the slug text field's beforeValidate hooks, so a
 * stored slug is URL-safe and never an address on every write path (admin,
 * REST, MCP). Accepts the same args as core.
 */
export const slugField = (args: SlugFieldArgs = {}): RowField =>
  baseSlugField({
    ...args,
    overrides: (field) => {
      const slugName = args.name ?? 'slug'
      const useAsSlug = args.fieldToUse || args.useAsSlug || 'title'
      const withGuards: RowField = {
        ...field,
        fields: field.fields.map((f) =>
          f.type === 'text' && f.name === slugName
            ? {
                ...f,
                hooks: {
                  ...f.hooks,
                  beforeValidate: [
                    ...(f.hooks?.beforeValidate ?? []),
                    refuseEmail(slugName, useAsSlug),
                    normalizeSlug,
                  ],
                },
              }
            : f,
        ),
      }
      return args.overrides ? args.overrides(withGuards) : withGuards
    },
  })
