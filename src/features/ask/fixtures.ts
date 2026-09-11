import type { UIDataTypes } from 'ai'
import { createChat } from '@/shared/testing/shadcn-helpers/ai-sdk'
import { ASK_HANDOFFS, type AskHandoff, type AskHandoffReason, type AskUITools } from './handoff'

/**
 * Story fixtures for every Ask surface (the /ask widget, the menu, the
 * closing band), so each plays the same transcript shapes /api/ask streams.
 */

/** A scripted chat typed like the real transcript, so a story can play the `handoff` tool. */
export const createAskChat = () => createChat<unknown, UIDataTypes, AskUITools>()

/** A handoff as /api/ask resolves it, against the production Site Info values. */
export const askHandoffFixture = (reason: AskHandoffReason): AskHandoff => ({
  reason,
  href: ASK_HANDOFFS[reason].form === 'project' ? '/contact/project-inquiry' : '/contact',
  responseTime: 'within 3 business days',
  scheduleUrl: 'https://calendar.app.google/example',
})

/** Two source links spanning two surfaces, as a grounded answer carries them. */
export const askSourcesFixture = [
  {
    sourceId: '/who-we-help/platforms-digital-products',
    title: 'Platforms & Digital Products',
    url: '/who-we-help/platforms-digital-products',
  },
  { sourceId: '/works/interchecks', title: 'Interchecks', url: '/works/interchecks' },
]
