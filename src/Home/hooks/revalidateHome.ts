import { revalidatePath, revalidateTag } from 'next/cache.js'
import type { GlobalAfterChangeHook } from 'payload'

export const revalidateHome: GlobalAfterChangeHook = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      payload.logger.info('Revalidating home at path: /')
      revalidatePath('/')
      revalidateTag('pages-sitemap', 'max')
      revalidateTag('global_home', 'max')
    }

    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      payload.logger.info('Revalidating unpublished home at path: /')
      revalidatePath('/')
      revalidateTag('pages-sitemap', 'max')
      revalidateTag('global_home', 'max')
    }
  }

  return doc
}
