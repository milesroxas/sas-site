import { getServerSideURL } from '@/utilities/getURL'
import { EMAIL_BRAND } from '../config/brand'
import type { EmailBrandProps } from '../ui/email-chrome'

export type BrandOverrides = Partial<EmailBrandProps>

/** Fill brand chrome with Suits & Sandals defaults: env from-name and the hosted logo PNGs. */
export function brandDefaults<T extends BrandOverrides>({
  companyName,
  logomarkUrl,
  logoUrl,
  logoDarkUrl,
  ...rest
}: T) {
  // Email clients fetch images from the recipient's machine, so logo URLs must be publicly
  // reachable — never localhost. EMAIL_ASSET_BASE_URL points at always-public hosting (Vercel
  // Blob) so emails render correctly from any environment, including local dev.
  const assetBaseUrl = process.env.EMAIL_ASSET_BASE_URL ?? getServerSideURL()
  return {
    companyName: companyName ?? process.env.RESEND_FROM_NAME ?? EMAIL_BRAND.companyName,
    logomarkUrl: logomarkUrl ?? `${assetBaseUrl}/email/logomark.png`,
    logoUrl: logoUrl ?? `${assetBaseUrl}/email/logo.png`,
    logoDarkUrl: logoDarkUrl ?? `${assetBaseUrl}/email/logo-dark.png`,
    ...rest,
  }
}
