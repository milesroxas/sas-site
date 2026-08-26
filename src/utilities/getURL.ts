import { resolveServerSideURL } from '../../site-url.cjs'
import canUseDOM from './canUseDOM'

export const getServerSideURL = () =>
  resolveServerSideURL(process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3001')

export const getClientSideURL = () => {
  if (canUseDOM) {
    const protocol = window.location.protocol
    const domain = window.location.hostname
    const port = window.location.port

    return `${protocol}//${domain}${port ? `:${port}` : ''}`
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  return process.env.NEXT_PUBLIC_SERVER_URL || ''
}
