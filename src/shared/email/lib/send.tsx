import type { Payload } from 'payload'
import type { ReactElement } from 'react'
import { ActivationEmail } from '../templates/activation-email'
import { InquiryNotificationEmail } from '../templates/inquiry-notification-email'
import { InquiryReceivedEmail } from '../templates/inquiry-received-email'
import { InviteEmail } from '../templates/invite-email'
import { NewsletterConfirmEmail } from '../templates/newsletter-confirm-email'
import { PasswordResetEmail } from '../templates/password-reset-email'
import { SubscriptionConfirmationEmail } from '../templates/subscription-confirmation-email'
import { WelcomeEmail } from '../templates/welcome-email'
import { type BrandOverrides, brandDefaults } from './brand-defaults'
import { renderEmail } from './render'

interface SendEmailArgs {
  payload: Payload
  /** One address, or many for a single fan-out send (team notifications). */
  to: string | string[]
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

export interface SendInquiryNotificationEmailArgs extends BrandOverrides {
  payload: Payload
  to: string | string[]
  adminUrl: string
  reference: string
  senderName: string
  senderEmail: string
  company?: string
  summary?: { label: string; value: string }[]
  excerpt: string
  typeLabel: string
  subject?: string
}

/** Tells the studio a request has landed. One send, many recipients. */
export function sendInquiryNotificationEmail({
  payload,
  to,
  subject,
  adminUrl,
  reference,
  senderName,
  senderEmail,
  company,
  summary,
  excerpt,
  typeLabel,
  ...brand
}: SendInquiryNotificationEmailArgs) {
  return sendEmail({
    payload,
    to,
    subject:
      subject ?? `${typeLabel} — ${senderName}${company ? ` (${company})` : ''} · ${reference}`,
    email: (
      <InquiryNotificationEmail
        adminUrl={adminUrl}
        company={company}
        excerpt={excerpt}
        reference={reference}
        senderEmail={senderEmail}
        senderName={senderName}
        summary={summary}
        typeLabel={typeLabel}
        {...brandDefaults(brand)}
      />
    ),
  })
}

export interface SendInquiryReceivedEmailArgs extends BrandOverrides {
  payload: Payload
  to: string
  senderName: string
  reference: string
  responseTime: string
  scheduleUrl?: string
  subject?: string
}

/** Confirms to the visitor that their note arrived, and when to expect an answer. */
export function sendInquiryReceivedEmail({
  payload,
  to,
  subject,
  senderName,
  reference,
  responseTime,
  scheduleUrl,
  ...brand
}: SendInquiryReceivedEmailArgs) {
  return sendEmail({
    payload,
    to,
    subject: subject ?? `We have your note (${reference})`,
    email: (
      <InquiryReceivedEmail
        reference={reference}
        responseTime={responseTime}
        scheduleUrl={scheduleUrl}
        senderName={senderName}
        {...brandDefaults(brand)}
      />
    ),
  })
}
