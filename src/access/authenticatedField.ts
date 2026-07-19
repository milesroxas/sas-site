import type { FieldAccess } from 'payload'

// Field-level counterpart of `authenticated`: visible/editable only to team
// members from the `users` collection. MCP API keys (plugin-mcp) also arrive
// as req.user over REST but must not see internal-only fields.
export const authenticatedField: FieldAccess = ({ req: { user } }) => {
  return user?.collection === 'users'
}
