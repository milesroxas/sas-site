import type { AccessArgs } from 'payload'

import type { User } from '@/payload-types'

type isAuthenticated = (args: AccessArgs<User>) => boolean

// "Authenticated" means a team member from the `users` collection. MCP API
// keys (plugin-mcp) also authenticate as req.user but must not inherit
// team-level REST access — their capabilities are governed per-key at /api/mcp.
export const authenticated: isAuthenticated = ({ req: { user } }) => {
  return user?.collection === 'users'
}
