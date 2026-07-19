import type { Access } from 'payload'

// Drafts are visible to team members (`users` collection) only; MCP API keys
// authenticating over REST get the same published-only view as the public.
export const authenticatedOrPublished: Access = ({ req: { user } }) => {
  if (user?.collection === 'users') {
    return true
  }

  return {
    _status: {
      equals: 'published',
    },
  }
}
