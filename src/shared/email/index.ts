/**
 * Email slice (FSD: **shared**) — transactional email templates and transport helpers.
 *
 * `ui` holds the shared `TransactionalEmail` shell; `templates` are thin, pure presentational
 * configs (explicit props, no app aliases) so the `email dev` preview server can bundle them in
 * isolation; `lib` wires rendering + sending through Payload's configured Resend adapter.
 * Rendering and newsletter helpers are imported by deep path (`@/shared/email/lib/render`,
 * `@/shared/email/newsletter/*`); this barrel only exposes the wired send entry points.
 */
export { sendInviteEmail, sendNewsletterConfirmEmail } from './lib/send'
