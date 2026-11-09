import type { S3ClientConfig } from '@aws-sdk/client-s3'

/**
 * Cloudflare R2 through its S3 API: the one statement of the bucket and the
 * client config, shared by the storage adapter (`payload.config.ts`) and any
 * hook that writes object metadata after an upload.
 */
export const R2_BUCKET = process.env.R2_BUCKET || ''

export const r2ClientConfig: S3ClientConfig = {
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: 'auto',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
}
