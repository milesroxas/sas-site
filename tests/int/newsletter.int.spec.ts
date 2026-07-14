import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import config from '@/payload.config'

let payload: Payload
const createdSubscriberIds: number[] = []
let audienceId: number

const uniqueEmail = (tag: string) => `${tag}-${Date.now()}@newsletter-int-test.example`

describe('Newsletter', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    const audience = await payload.create({
      collection: 'audiences',
      data: {
        name: `Int Test Audience ${Date.now()}`,
        slug: `int-test-audience-${Date.now()}`,
        allowPublicSignup: true,
      },
    })
    audienceId = audience.id
  })

  afterAll(async () => {
    for (const id of createdSubscriberIds) {
      await payload.delete({ collection: 'subscribers', id }).catch(() => null)
    }
    await payload.delete({ collection: 'audiences', id: audienceId }).catch(() => null)
  })

  it('generates a slug for audiences', async () => {
    const audience = await payload.findByID({ collection: 'audiences', id: audienceId })
    expect(audience.slug).toContain('int-test-audience')
  })

  it('normalizes subscriber emails and mints a link token on create', async () => {
    const email = uniqueEmail('CaSe')
    const subscriber = await payload.create({
      collection: 'subscribers',
      data: {
        email: `  ${email.toUpperCase()}  `,
        audiences: [audienceId],
        status: 'pending',
        source: 'manual',
      },
    })
    createdSubscriberIds.push(subscriber.id)

    expect(subscriber.email).toBe(email.toLowerCase())
    expect(subscriber.status).toBe('pending')
    expect(subscriber.token).toBeTruthy()
    expect(subscriber.token?.length).toBeGreaterThanOrEqual(32)
  })

  it('rejects duplicate emails via the unique index', async () => {
    const email = uniqueEmail('dupe')
    const first = await payload.create({
      collection: 'subscribers',
      data: { email, status: 'pending', source: 'manual' },
    })
    createdSubscriberIds.push(first.id)

    await expect(
      payload.create({
        collection: 'subscribers',
        data: { email: email.toUpperCase(), status: 'pending', source: 'manual' },
      }),
    ).rejects.toThrow()
  })

  it('stamps status transition dates', async () => {
    const email = uniqueEmail('dates')
    const created = await payload.create({
      collection: 'subscribers',
      data: { email, status: 'pending', source: 'manual' },
    })
    createdSubscriberIds.push(created.id)
    expect(created.subscribedAt).toBeFalsy()

    const subscribed = await payload.update({
      collection: 'subscribers',
      id: created.id,
      data: { status: 'subscribed' },
    })
    expect(subscribed.subscribedAt).toBeTruthy()
    expect(subscribed.confirmedAt).toBeTruthy()

    const unsubscribed = await payload.update({
      collection: 'subscribers',
      id: created.id,
      data: { status: 'unsubscribed' },
    })
    expect(unsubscribed.unsubscribedAt).toBeTruthy()
    // Original opt-in dates are part of the consent trail and must survive.
    expect(unsubscribed.subscribedAt).toBe(subscribed.subscribedAt)
  })

  it('locks sent newsletters against editor updates', async () => {
    const admin = await payload.find({ collection: 'users', limit: 1 })
    const user = admin.docs[0]
    expect(user).toBeDefined()

    const newsletter = await payload.create({
      collection: 'newsletters',
      data: {
        title: `Int Test Newsletter ${Date.now()}`,
        subject: 'Int test',
        template: 'letter',
        content: [
          {
            blockType: 'nlText',
            body: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', text: 'Hello', version: 1 }],
                    version: 1,
                  },
                ],
                direction: null,
                format: '' as const,
                indent: 0,
                version: 1,
              },
            },
          },
        ],
        audiences: [audienceId],
        deliveryStatus: 'sent',
        _status: 'published',
      },
    })

    try {
      // overrideAccess: false enforces the collection access control for the given user.
      await expect(
        payload.update({
          collection: 'newsletters',
          id: newsletter.id,
          data: { subject: 'Changed after send' },
          user,
          overrideAccess: false,
        }),
      ).rejects.toThrow()
    } finally {
      // Default overrideAccess bypasses the sent-lock so the fixture can be removed.
      await payload.delete({ collection: 'newsletters', id: newsletter.id })
    }
  })
})
