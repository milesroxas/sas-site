import { payloadAiPlugin } from '@ai-stack/payloadcms'
import type { Plugin } from 'payload'
import { authenticated } from '@/access/authenticated'
import { actionPrompts } from './actionPrompts'
import { promptFields } from './promptFields'
import { seedPrompts } from './seeds'

/**
 * AI compose/rephrase/etc. in the admin editor (OPENAI_API_KEY from env; the
 * plugin silently deactivates without it).
 *
 * Per-field prompts are seeded declaratively from ./seeds.ts into the
 * `plugin-ai-instructions` collection at boot, one row per field schema-path.
 * Boot never overwrites existing rows: edits made in the AI Instructions
 * collection survive restarts, and the code seeds act as defaults only. After
 * changing seeds, re-seed with: pnpm payload run scripts/reset-ai-instructions.ts
 */
export const aiPlugin: Plugin = payloadAiPlugin({
  collections: {
    // Website — publishing surfaces
    pages: true,
    posts: true,
    'work-pages': true,
    'lab-pages': true,
    'expertise-pages': true,
    'audience-pages': true,
    // Content Hub — canonical source material
    organizations: true,
    projects: true,
    'case-studies': true,
    'lab-projects': true,
    testimonials: true,
  },
  // Plugin defaults gate generation/settings on Boolean(req.user), which an
  // MCP API key satisfies over REST. Restrict to team.
  access: {
    generate: authenticated,
    settings: authenticated,
  },
  overrideInstructions: {
    access: {
      create: authenticated,
      delete: authenticated,
      read: authenticated,
      update: authenticated,
    },
    // Visible so the team can tune per-field prompts without a deploy.
    admin: { group: 'System', hidden: false },
  },
  prompts: actionPrompts,
  promptFields,
  seedPrompts,
  debugging: false,
  disableSponsorMessage: true,
  uploadCollectionSlug: 'media',
})
