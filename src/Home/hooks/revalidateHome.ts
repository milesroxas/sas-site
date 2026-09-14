import { revalidatePath, revalidateTag } from 'next/cache.js'
import type { GlobalAfterChangeHook } from 'payload'
import { MENU_CONTENT_TAG } from '@/Header/menuCache'

/** The home hero also feeds the takeover menu's resting media for `/`. */
const purge = () => {
  revalidatePath('/')
  revalidateTag('pages-sitemap', 'max')
  revalidateTag('global_home', 'max')
  revalidateTag(MENU_CONTENT_TAG, 'max')
}

export const revalidateHome: GlobalAfterChangeHook = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      payload.logger.info('Revalidating home at path: /')
      purge()
    }

    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      payload.logger.info('Revalidating unpublished home at path: /')
      purge()
    }
  }

  return doc
}
