import { checkBotId } from 'botid/server'
import type { PayloadRequest } from 'payload'

/** BotID answers in tens of milliseconds; past this it is an outage, not a verdict. */
const CHECK_TIMEOUT_MS = 3000

/** `checkBotId` takes no abort signal, so the deadline is raced beside it. */
async function checkWithDeadline() {
  let timer: ReturnType<typeof setTimeout> | undefined
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`BotID check exceeded ${CHECK_TIMEOUT_MS}ms`)),
      CHECK_TIMEOUT_MS,
    )
  })
  try {
    return await Promise.race([checkBotId(), deadline])
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Is this request an automated client we should refuse? Vercel BotID does the
 * classifying; the path must be listed in ./routes or every caller reads as a
 * bot.
 *
 * - Verified bots pass. Vercel authenticates them (signature or published IP
 *   range), so a spammer cannot claim the label, and an assistant acting for a
 *   real person (ChatGPT agent and the like) can still file an inquiry.
 * - Fails open. `checkBotId` throws when the OIDC token is missing or the
 *   BotID API is unreachable. A Vercel outage must not cost a real lead, or
 *   hold a form's transaction open. The honeypots and the WAF rate limit still
 *   stand behind it, and the error is logged so a silent loss of protection
 *   shows up in the logs.
 * - Local development always reads as human (BotID only classifies on Vercel).
 */
export async function isBlockedBot(req: PayloadRequest): Promise<boolean> {
  try {
    const verdict = await checkWithDeadline()
    return verdict.isBot && !verdict.isVerifiedBot
  } catch (error) {
    req.payload.logger.error({ err: error }, 'BotID check failed; request allowed through')
    return false
  }
}
