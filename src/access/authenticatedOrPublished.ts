import { authenticatedOr } from './authenticatedOr'

// Drafts are visible to team members (`users` collection) only; MCP API keys
// authenticating over REST get the same published-only view as the public.
export const authenticatedOrPublished = authenticatedOr({ _status: { equals: 'published' } })
