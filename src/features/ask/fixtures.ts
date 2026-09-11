import type { UIDataTypes } from 'ai'
import { createChat } from '@/shared/testing/shadcn-helpers/ai-sdk'
import type { AskHandoff, AskHandoffReason, AskHandoffTerms, AskUITools } from './handoff'

/**
 * Story fixtures for every Ask surface (the menu, the closing band, and the
 * /ask widget), so each plays the same transcript shapes /api/ask streams.
 */

/** A scripted chat typed like the real transcript, so a story can play the `handoff` tool. */
export const createAskChat = () => createChat<unknown, UIDataTypes, AskUITools>()

/** Site Info's promise as production has it: what every surface receives as `terms`. */
export const askHandoffTermsFixture: AskHandoffTerms = {
  responseTime: 'within 3 business days',
  scheduleUrl: 'https://calendar.app.google/example',
}

/** A handoff as /api/ask resolves it, against the production Site Info values. */
export const askHandoffFixture = (reason: AskHandoffReason): AskHandoff => ({
  reason,
  ...askHandoffTermsFixture,
})

/** A pricing question answered with the handoff alone: the reason's lead line, then the offer. */
export const askHandoffChat = createAskChat()
  .user('What does a website cost, and when can you start?')
  .assistant(({ writer }) => {
    writer.tool('handoff', { input: { reason: 'estimate' }, output: askHandoffFixture('estimate') })
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
