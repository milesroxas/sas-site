import type { JSONField } from 'payload'
import type { z } from 'zod'
import { describeIssues, readSpec } from '@/features/figures'

/**
 * The `spec` JSON field of a figure block. `jsonSchema` gives the admin's
 * editor inline validation and completion and types the field for MCP;
 * `validate` answers on publish. Draft saves skip field validation in Payload,
 * and drafts are the only thing an agent writes, so the same check also runs
 * at the document boundary for every full save (`plugins/figures`).
 */
export const specField = <T>({
  defaultValue,
  description,
  jsonSchema,
  schema,
}: {
  defaultValue: T
  description: string
  jsonSchema: NonNullable<JSONField['jsonSchema']>
  schema: z.ZodType<T>
}): JSONField => ({
  name: 'spec',
  type: 'json',
  required: true,
  defaultValue: defaultValue as JSONField['defaultValue'],
  jsonSchema,
  validate: (value) => {
    const { issues } = readSpec(schema, value)
    return issues ? describeIssues(issues) : true
  },
  admin: { description },
})
