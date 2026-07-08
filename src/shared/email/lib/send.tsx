import type { Payload } from 'payload'
import type { ReactElement } from 'react'
import { getServerSideURL } from '@/utilities/getURL'
import { EMAIL_BRAND } from '../config/brand'
import { ActivationEmail } from '../templates/activation-email'
import { InviteEmail } from '../templates/invite-email'
import { PasswordResetEmail } from '../templates/password-reset-email'
import { SubscriptionConfirmationEmail } from '../templates/subscription-confirmation-email'
import { WelcomeEmail } from '../templates/welcome-email'
import type { EmailBrandProps } from '../ui/transactional-email'
import { renderEmail } from './render'

interface SendEmailArgs {
  payload: Payload
  to: string
  subject: string
  email: ReactElement
}

/**
 * Render and send any email element through Payload's configured adapter (Resend).
 *
 * Routing via `payload.sendEmail` keeps a single source of truth for transport, from-address and
 * credentials (see `email: resendAdapter(...)` in `payload.config.ts`).
 */
export async function sendEmail({ payload, to, subject, email }: SendEmailArgs) {
  const { html, text } = await renderEmail(email)
  return payload.sendEmail({ to, subject, html, text })
}

type BrandOverrides = Partial<EmailBrandProps>

/** Fill brand chrome with Suits & Sandals defaults: env from-name and the hosted logo PNGs. */
function brandDefaults<T extends BrandOverrides>({
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

export interface SendActivationEmailArgs extends BrandOverrides {
  payload: Payload
  to: string
  confirmUrl: string
  subject?: string
}

export function sendActivationEmail({
  payload,
  to,
  confirmUrl,
  subject = 'Confirm your email address',
  ...brand
}: SendActivationEmailArgs) {
  return sendEmail({
    payload,
    to,
    subject,
    email: <ActivationEmail confirmUrl={confirmUrl} {...brandDefaults(brand)} />,
  })
}

export interface SendInviteEmailArgs extends BrandOverrides {
  payload: Payload
  to: string
  inviteUrl: string
  inviterName?: string
  expiresIn?: string
  subject?: string
}

export function sendInviteEmail({
  payload,
  to,
  inviteUrl,
  inviterName,
  expiresIn,
  subject = "You're invited to join the team",
  ...brand
}: SendInviteEmailArgs) {
  return sendEmail({
    payload,
    to,
    subject,
    email: (
      <InviteEmail
        inviteUrl={inviteUrl}
        inviterName={inviterName}
        expiresIn={expiresIn}
        {...brandDefaults(brand)}
      />
    ),
  })
}

export interface SendPasswordResetEmailArgs extends BrandOverrides {
  payload: Payload
  to: string
  resetUrl: string
  subject?: string
}

export function sendPasswordResetEmail({
  payload,
  to,
  resetUrl,
  subject = 'Reset your password',
  ...brand
}: SendPasswordResetEmailArgs) {
  return sendEmail({
    payload,
    to,
    subject,
    email: <PasswordResetEmail resetUrl={resetUrl} {...brandDefaults(brand)} />,
  })
}

export interface SendWelcomeEmailArgs extends BrandOverrides {
  payload: Payload
  to: string
  workspaceUrl: string
  subject?: string
}

export function sendWelcomeEmail({
  payload,
  to,
  workspaceUrl,
  subject = 'Welcome aboard',
  ...brand
}: SendWelcomeEmailArgs) {
  return sendEmail({
    payload,
    to,
    subject,
    email: <WelcomeEmail workspaceUrl={workspaceUrl} {...brandDefaults(brand)} />,
  })
}

export interface SendSubscriptionConfirmationEmailArgs extends BrandOverrides {
  payload: Payload
  to: string
  manageUrl: string
  userName: string
  planName: string
  planPrice: string
  cycleLabel: string
  nextBillingDate: string
  subject?: string
}

export function sendSubscriptionConfirmationEmail({
  payload,
  to,
  subject = 'Your retainer is active',
  manageUrl,
  userName,
  planName,
  planPrice,
  cycleLabel,
  nextBillingDate,
  ...brand
}: SendSubscriptionConfirmationEmailArgs) {
  return sendEmail({
    payload,
    to,
    subject,
    email: (
      <SubscriptionConfirmationEmail
        manageUrl={manageUrl}
        userName={userName}
        planName={planName}
        planPrice={planPrice}
        cycleLabel={cycleLabel}
        nextBillingDate={nextBillingDate}
        {...brandDefaults(brand)}
      />
    ),
  })
}
