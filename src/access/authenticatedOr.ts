import type { Access, Where } from 'payload'
import { authenticated } from './authenticated'

/**
 * Read access for content with a public subset. Team members (`users`) read
 * everything; every other caller, anonymous visitors and MCP API keys over
 * REST alike, gets `where`, which Payload applies inside the database query.
 *
 * The one place this rule is written. A hand-rolled `req.user` truthiness
 * check lets API keys through, because they authenticate as `req.user` too.
 */
export const authenticatedOr =
  (where: Where): Access =>
  (args) =>
    authenticated(args) || where
