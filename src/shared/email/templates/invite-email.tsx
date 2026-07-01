import { EMAIL_BRAND, EMAIL_PREVIEW } from '../config/brand'
import { type EmailBrandProps, EmailParagraph, TransactionalEmail } from '../ui/transactional-email'

export interface InviteEmailProps extends EmailBrandProps {
  /** Absolute URL the "Accept invite" button links to (Payload admin reset-password route). */
  inviteUrl: string
  /** Name of the teammate who sent the invite; omitted from copy when unknown. */
  inviterName?: string
  /** How long the invite link stays valid, e.g. "72 hours". */
  expiresIn?: string
  /** Inbox preview line. */
  previewText?: string
}

export const InviteEmail = ({
  inviteUrl,
  inviterName,
  expiresIn = '72 hours',
  previewText = "You've been invited to join the team",
  companyName,
  tagline = EMAIL_BRAND.tagline,
  ...brand
}: InviteEmailProps) => (
  <TransactionalEmail
    {...brand}
    companyName={companyName}
    tagline={tagline}
    previewText={previewText}
    heading="You're invited!"
    action={{ label: 'Accept invite', href: inviteUrl }}
    disclaimer={
      <>
        If you weren&apos;t expecting this invitation,
        <br />
        please ignore this email.
      </>
    }
  >
    <EmailParagraph>
      {inviterName ? `${inviterName} has invited you` : "You've been invited"} to join the{' '}
      {companyName} team. Accept the invite to set your password and access the studio workspace.
    </EmailParagraph>
    <EmailParagraph>This link expires in {expiresIn}.</EmailParagraph>
  </TransactionalEmail>
)

InviteEmail.PreviewProps = {
  companyName: EMAIL_BRAND.companyName,
  inviteUrl: 'https://example.com/admin/reset/preview-token',
  inviterName: 'Miles',
  ...EMAIL_PREVIEW,
} satisfies InviteEmailProps

export default InviteEmail
