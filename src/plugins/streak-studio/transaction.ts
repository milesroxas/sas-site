import { sql } from '@payloadcms/db-vercel-postgres'
import { commitTransaction, initTransaction, killTransaction, type PayloadRequest } from 'payload'

export async function transactionDB(req: PayloadRequest) {
  const id = await req.transactionID
  return (
    id ? req.payload.db.sessions?.[id]?.db : req.payload.db.drizzle
  ) as typeof req.payload.db.drizzle
}

/** Draft saves and worker promotion serialize on the parent row, including version-only writes. */
export async function lockLook(req: PayloadRequest, id: number) {
  const db = await transactionDB(req)
  await db.execute(sql`SELECT id FROM streak_looks WHERE id = ${id} FOR UPDATE`)
}

/** Runs `work` in the request's transaction, opening (and settling) one if the request has none. */
export async function inTransaction<T>(req: PayloadRequest, work: () => Promise<T>): Promise<T> {
  const owner = await initTransaction(req)
  try {
    const result = await work()
    if (owner) await commitTransaction(req)
    return result
  } catch (error) {
    if (owner) await killTransaction(req)
    throw error
  }
}
