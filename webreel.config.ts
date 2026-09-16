import { defineConfig } from 'webreel'
import { vaultFromMenu } from './webreel/site/vault-from-menu'

const config = defineConfig({
  outDir: './videos',
  baseUrl: 'https://www.suits-sandals.com',
  viewport: { width: 1920, height: 1080 },
  defaultDelay: 500,
  videos: {
    ...vaultFromMenu,
  },
})

// webreel 0.1.4 reads TS configs as a module namespace, so the CLI fields
// have to be named exports (export default is ignored).
export const outDir = config.outDir
export const baseUrl = config.baseUrl
export const viewport = config.viewport
export const defaultDelay = config.defaultDelay
export const videos = config.videos
