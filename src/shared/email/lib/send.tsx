import type { Payload } from 'payload'
import type { ReactElement } from 'react'
import { ActivationEmail } from '../templates/activation-email'
import { InviteEmail } from '../templates/invite-email'
import { NewsletterConfirmEmail } from '../templates/newsletter-confirm-email'
import { PasswordResetEmail } from '../templates/password-reset-email'
import { SubscriptionConfirmationEmail } from '../templates/subscription-confirmation-email'
import { WelcomeEmail } from '../templates/welcome-email'
import { type BrandOverrides, brandDefaults } from './brand-defaults'
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

export interface SendNewsletterConfirmEmailArgs extends BrandOverrides {
  payload: Payload
  to: string
  confirmUrl: string
  subject?: string
}

/** Double-opt-in confirmation for newsletter signups. */
export function sendNewsletterConfirmEmail({
  payload,
  to,
  confirmUrl,
  subject = 'Confirm your subscription',
  ...brand
}: SendNewsletterConfirmEmailArgs) {
  return sendEmail({
    payload,
    to,
    subject,
    email: <NewsletterConfirmEmail confirmUrl={confirmUrl} {...brandDefaults(brand)} />,
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
