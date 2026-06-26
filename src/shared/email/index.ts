/**
 * Email slice (FSD: **shared**) — transactional email templates and transport helpers.
 *
 * `ui` holds the shared `TransactionalEmail` shell; `templates` are thin, pure presentational
 * configs (explicit props, no app aliases) so the `email dev` preview server can bundle them in
 * isolation; `lib` wires rendering + sending through Payload's configured Resend adapter.
 */
export { EMAIL_BRAND } from './config/brand'
export { EmailFonts } from './config/fonts'
export { emailColors, emailTailwindConfig } from './config/theme'
export { renderEmail } from './lib/render'
export {
  type SendActivationEmailArgs,
  type SendPasswordResetEmailArgs,
  type SendSubscriptionConfirmationEmailArgs,
  type SendWelcomeEmailArgs,
  sendActivationEmail,
  sendEmail,
  sendPasswordResetEmail,
  sendSubscriptionConfirmationEmail,
  sendWelcomeEmail,
} from './lib/send'
export { ActivationEmail, type ActivationEmailProps } from './templates/activation-email'
export {
  PasswordResetEmail,
  type PasswordResetEmailProps,
} from './templates/password-reset-email'
export {
  SubscriptionConfirmationEmail,
  type SubscriptionConfirmationEmailProps,
} from './templates/subscription-confirmation-email'
export { WelcomeEmail, type WelcomeEmailProps } from './templates/welcome-email'
export {
  type EmailBrandProps,
  EmailParagraph,
  TransactionalEmail,
  type TransactionalEmailProps,
} from './ui/transactional-email'
