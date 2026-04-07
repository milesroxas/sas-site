import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import type { User } from '../payload-types'
import { getClientSideURL } from './getURL'

export const getMeUser = async (args?: {
  nullUserRedirect?: string
  validUserRedirect?: string
}): Promise<{
  token: string
  user: User
}> => {
  const { nullUserRedirect, validUserRedirect } = args || {}
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  const meUserReq = await fetch(`${getClientSideURL()}/api/users/me`, {
    headers: {
      Authorization: `JWT ${token}`,
    },
  })

  const {
    user,
  }: {
    user: User
  } = await meUserReq.json()

  if (validUserRedirect && meUserReq.ok && user) {
    redirect(validUserRedirect)
  }

  if (nullUserRedirect && (!meUserReq.ok || !user)) {
    redirect(nullUserRedirect)
  }

  if (!user) {
    if (nullUserRedirect) {
      redirect(nullUserRedirect)
    }
    throw new Error('Not authenticated')
  }

  if (!token) {
    if (nullUserRedirect) {
      redirect(nullUserRedirect)
    }
    throw new Error('Missing payload-token cookie')
  }

  return {
    token,
    user,
  }
}
