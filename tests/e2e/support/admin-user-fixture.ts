import { getPayload } from 'payload'

import config from '../../../src/payload.config'

export const testUser = {
  email: 'dev@payloadcms.com',
  password: 'test',
}

const [operation] = process.argv.slice(2)

if (operation !== 'seed' && operation !== 'cleanup') {
  throw new Error('Usage: admin-user-fixture.ts <seed|cleanup>')
}

const payload = await getPayload({ config: await config })

try {
  await payload.delete({ collection: 'users', where: { email: { equals: testUser.email } } })
  if (operation === 'seed') {
    await payload.create({ collection: 'users', data: testUser })
  }
} finally {
  await payload.db.destroy?.()
}
