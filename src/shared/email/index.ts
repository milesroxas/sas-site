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
  type SendInviteEmailArgs,
  type SendNewsletterConfirmEmailArgs,
  type SendPasswordResetEmailArgs,
  type SendSubscriptionConfirmationEmailArgs,
  type SendWelcomeEmailArgs,
  sendActivationEmail,
  sendEmail,
  sendInviteEmail,
  sendNewsletterConfirmEmail,
  sendPasswordResetEmail,
  sendSubscriptionConfirmationEmail,
  sendWelcomeEmail,
} from './lib/send'
export {
  buildNewsletterEmail,
  newsletterOneClickUnsubscribeUrl,
  newsletterUnsubscribePageUrl,
  UNSUBSCRIBE_TOKEN_PLACEHOLDER,
} from './newsletter/build'
export {
  DEFAULT_NEWSLETTER_TEMPLATE,
  NEWSLETTER_TEMPLATES,
  type NewsletterTemplateKey,
  newsletterTemplateOptions,
} from './newsletter/registry'
export { ActivationEmail, type ActivationEmailProps } from './templates/activation-email'
export { InviteEmail, type InviteEmailProps } from './templates/invite-email'
export {
  NewsletterConfirmEmail,
  type NewsletterConfirmEmailProps,
} from './templates/newsletter-confirm-email'
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
