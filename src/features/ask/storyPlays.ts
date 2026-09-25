import type { StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor } from 'storybook/test'
import { ASK_HANDOFF_ACTION } from './handoff'

/**
 * Play steps shared by every Ask surface's stories: opening the handoff from
 * its offer, sending it, and standing in for the inquiries intake. Kept out
 * of `fixtures.ts`, which the unit tests import and which must stay free of
 * Storybook's runtime.
 */

type PlayContext = Parameters<NonNullable<StoryObj['play']>>[0]
type Canvas = Pick<PlayContext, 'canvas' | 'userEvent'>

/**
 * Never assert `toBeVisible()` on anything inside the transcript. Every
 * `MessageScrollerItem` carries `content-visibility: auto`, and the browser
 * reports `checkVisibility()` false for a subtree under it however plainly the
 * element is on screen, so the matcher fails on a field the visitor can read
 * and type into. Wait on presence, which is what the swap actually decides.
 */
const present = (el: HTMLElement) => expect(el).toBeInTheDocument()

/**
 * Opens the handoff form and waits for the swap to land: the fields mount on
 * the swap's entrance half and cannot be typed into before. The reply's chip
 * and the surface's own "Email a partner" open the same form, so the first
 * one found will do; a form that opened by itself needs no tap.
 */
export async function openAskHandoff({ canvas, userEvent }: Canvas) {
  if (!canvas.queryByLabelText('Name')) {
    await userEvent.click(canvas.getAllByRole('button', { name: ASK_HANDOFF_ACTION })[0])
  }
  await waitFor(() => present(canvas.getByLabelText('Name')))
}

/** Fills the open form and sends it, waiting for the receipt to land. Pair with `stubInquiryIntake`. */
export async function sendAskHandoff(
  { canvas, userEvent }: Canvas,
  { name, email }: { name: string; email: string },
) {
  await userEvent.type(canvas.getByLabelText('Name'), name)
  await userEvent.type(canvas.getByLabelText('Email'), email)
  await userEvent.click(canvas.getByRole('button', { name: 'Send to the team' }))
  await waitFor(() => present(canvas.getByText('Sent to the team')))
}

/**
 * Answers the inquiries intake the way /api/inquiries/submit does, with no
 * network. Returns the restore function, so a story's `beforeEach` can return
 * it as its cleanup.
 */
export function stubInquiryIntake(reference = 'SS-7K2Q') {
  const fetch = window.fetch
  window.fetch = async (input, init) =>
    String(input).endsWith('/api/inquiries/submit')
      ? Response.json({ reference, submittedAt: new Date().toISOString() })
      : fetch(input, init)
  return () => {
    window.fetch = fetch
  }
}
