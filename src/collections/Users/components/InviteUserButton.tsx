'use client'

import { Button, Drawer, TextInput, toast, useConfig, useModal } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { type ChangeEvent, type FormEvent, useCallback, useState } from 'react'

const drawerSlug = 'invite-user'

/**
 * "Invite user" action for the Users list view. Opens a drawer that posts to the collection's
 * custom `/invite` endpoint, which creates the user and emails them a set-password link.
 */
export function InviteUserButton() {
  const { config } = useConfig()
  const { closeModal, openModal } = useModal()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (isSubmitting) return
      setIsSubmitting(true)

      try {
        const res = await fetch(`${config.serverURL}${config.routes.api}/users/invite`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name: name.trim() || undefined }),
        })
        const body = await res.json()

        if (!res.ok) {
          throw new Error(body?.errors?.[0]?.message ?? 'Failed to send invite.')
        }

        toast.success(body.message ?? 'Invite sent.')
        setEmail('')
        setName('')
        closeModal(drawerSlug)
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to send invite.')
      } finally {
        setIsSubmitting(false)
      }
    },
    [closeModal, config.routes.api, config.serverURL, email, isSubmitting, name, router],
  )

  return (
    <>
      <Button onClick={() => openModal(drawerSlug)}>Invite user</Button>
      <Drawer slug={drawerSlug} title="Invite a team member">
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Email"
            path="invite-email"
            required
            value={email}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
          />
          <TextInput
            label="Name"
            path="invite-name"
            value={name}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
          />
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Sending invite…' : 'Send invite'}
          </Button>
        </form>
      </Drawer>
    </>
  )
}
