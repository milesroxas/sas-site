import type { JSONField } from 'payload'
import { z } from 'zod'
import { chartSpecSchema } from './chart'
import { diagramSpecSchema } from './diagram'

/**
 * The spec schemas as JSON Schema, for Payload's `json` field. One definition
 * then reaches three readers with no restated limit or enum: the admin's JSON
 * editor (inline validation and completion), the generated `payload-types`,
 * and the MCP tool input schema an agent authors against.
 *
 * JSON Schema cannot carry the cross-field checks (an edge naming a node that
 * exists); those stay in the zod schemas and answer on save.
 */
const fieldSchema = (name: string, schema: z.ZodType): NonNullable<JSONField['jsonSchema']> => {
  // Payload types the field as draft 4 and nests it inside the collection's
  // own schema, where a second `$schema` keyword has no meaning.
  const { $schema: _, ...definition } = z.toJSONSchema(schema, { target: 'draft-4' })
  const uri = `a://figures/${name}.schema.json`
  return {
    fileMatch: [uri],
    schema: definition as NonNullable<JSONField['jsonSchema']>['schema'],
    uri,
  }
}

export const chartSpecJsonSchema = fieldSchema('chart-spec', chartSpecSchema)
export const diagramSpecJsonSchema = fieldSchema('diagram-spec', diagramSpecSchema)
