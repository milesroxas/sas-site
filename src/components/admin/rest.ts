/**
 * The admin panels' reads of Payload's REST API, as the signed-in user. A
 * failed or aborted request reads as nothing, so a panel can still render.
 */

/** How many documents match, from the count route: nothing but the total crosses the wire. */
export async function countDocs(
  api: string,
  collection: string,
  query: string,
  signal?: AbortSignal,
): Promise<number> {
  const res = await fetch(`${api}/${collection}/count?${query}`, {
    credentials: 'include',
    signal,
  })
  if (!res.ok) return 0
  const body = (await res.json()) as { totalDocs?: number }
  return body.totalDocs ?? 0
}

/** The documents a list query returns, shallow. */
export async function listDocs<Doc>(
  api: string,
  collection: string,
  query: string,
  signal?: AbortSignal,
): Promise<Doc[]> {
  const res = await fetch(`${api}/${collection}?depth=0&${query}`, {
    credentials: 'include',
    signal,
  })
  if (!res.ok) return []
  const body = (await res.json()) as { docs?: Doc[] }
  return body.docs ?? []
}

/** A `where[field][in]` clause in the REST query syntax. */
export const whereIn = (field: string, values: readonly string[]) =>
  values.map((value, index) => `where[${field}][in][${index}]=${value}`).join('&')
