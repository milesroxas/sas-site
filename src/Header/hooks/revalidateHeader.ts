import { revalidateTag } from 'next/cache.js'
import type { GlobalAfterChangeHook } from 'payload'
import { MENU_CONTENT_TAG } from '../menuCache'

export const revalidateHeader: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating header`)

    revalidateTag('global_header', 'max')
    // Menu case studies + CTA are read through the takeover-menu cache.
    revalidateTag(MENU_CONTENT_TAG, 'max')
  }

  return doc
}
