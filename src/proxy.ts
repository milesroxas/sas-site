import { type NextRequest, NextResponse } from 'next/server'
import { inboxRedirect } from '@/collections/Inquiries/inboxView'

/**
 * Runs before the admin's inquiries list renders, and nowhere else. The rule
 * and its reasons live with the collection, in `inboxRedirect`.
 */
export function proxy(request: NextRequest) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return NextResponse.next()
  const next = inboxRedirect(new URL(request.url))
  return next ? NextResponse.redirect(next) : NextResponse.next()
}

export const config = {
  matcher: '/admin/collections/inquiries',
}
