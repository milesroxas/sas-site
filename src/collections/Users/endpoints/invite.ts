import crypto from 'node:crypto'
import { APIError, addDataAndFileToRequest, type Endpoint } from 'payload'
import { sendInviteEmail } from '@/shared/email'
import { getServerSideURL } from '@/utilities/getURL'

/** Invite links stay valid for 72 hours. */
const INVITE_EXPIRATION_MS = 72 * 60 * 60 * 1000
const INVITE_EXPIRES_IN_LABEL = '72 hours'

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

/**
 * `POST /api/users/invite` — invite a teammate by email.
 *
 * Creates the user with an unguessable throwaway password, issues a Payload reset-password token
 * (the canonical invite mechanism — no parallel token system to maintain), and emails an invite
 * link to the admin reset route where the invitee sets their own password. If the email fails to
 * send, the created user is removed so the invite can simply be retried.
 */
export const inviteEndpoint: Endpoint = {
  path: '/invite',
  method: 'post',
  handler: async (req) => {
    // Custom endpoints skip auth by default — only logged-in team members may invite.
    if (!req.user) {
      throw new APIError('Unauthorized', 401)
    }

    await addDataAndFileToRequest(req)
    const { email, name } = (req.data ?? {}) as { email?: unknown; name?: unknown }

    if (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) {
      throw new APIError('A valid email address is required.', 400)
    }
    if (name !== undefined && typeof name !== 'string') {
      throw new APIError('Name must be a string.', 400)
    }

    const normalizedEmail = email.trim().toLowerCase()
    const { payload } = req

    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: normalizedEmail } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs.length > 0) {
      throw new APIError('A user with this email already exists.', 409)
    }

    // Throwaway password: never shared, replaced when the invitee accepts via the reset link.
    const invited = await payload.create({
      collection: 'users',
      data: {
        email: normalizedEmail,
        name: name?.trim() || undefined,
        password: crypto.randomBytes(32).toString('hex'),
      },
      user: req.user,
      overrideAccess: false,
    })

    try {
      const token = await payload.forgotPassword({
        collection: 'users',
        data: { email: normalizedEmail },
        disableEmail: true,
        expiration: INVITE_EXPIRATION_MS,
      })

      await sendInviteEmail({
        payload,
        to: normalizedEmail,
        inviteUrl: `${getServerSideURL()}${payload.config.routes.admin}/reset/${token}`,
        inviterName: req.user.name ?? undefined,
        expiresIn: INVITE_EXPIRES_IN_LABEL,
      })
    } catch (err) {
      // Roll back the half-finished invite so a retry starts clean.
      payload.logger.error({ msg: `Failed to send invite email to ${normalizedEmail}`, err })
      await payload.delete({ collection: 'users', id: invited.id }).catch((deleteErr: unknown) =>
        payload.logger.error({
          msg: `Failed to roll back invited user ${invited.id}`,
          err: deleteErr,
        }),
      )
      throw new APIError('Could not send the invite email. Please try again.', 502)
    }

    return Response.json({ message: `Invite sent to ${normalizedEmail}.` }, { status: 201 })
  },
}
