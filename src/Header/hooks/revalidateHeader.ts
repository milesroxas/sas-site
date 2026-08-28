import { revalidateTag } from 'next/cache.js'
import type { GlobalAfterChangeHook } from 'payload'

export const revalidateHeader: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating header`)

    revalidateTag('global_header', 'max')
    // Menu case studies + CTA are read through the takeover-menu cache.
    revalidateTag('takeover-menu-content', 'max')
  }

  return doc
}
