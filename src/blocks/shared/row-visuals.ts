import { resolveVisual, type StoredVisualSlot, type Visual } from '@/features/immersive/visual'

/** A repeating-field row with its visual slot resolved and the stored slot fields removed. */
export type RowWithVisual<Row> = Omit<Row, keyof StoredVisualSlot> & { visual: Visual | null }

/**
 * Resolve the visual slot on every row of a repeating field (the tabs of a
 * tabs block) at the server boundary, the way a block-level slot resolves
 * once in its adapter. Each row seeds from its own id, never its index:
 * reordering rows must not reshuffle a field. The stored slot fields are
 * dropped so the client component only receives the resolved `Visual`, and a
 * retained upload behind a Streak Field choice never crosses to the client.
 */
export const resolveRowVisuals = <Row extends StoredVisualSlot & { id?: string | null }>(
  rows: Row[] | null | undefined,
): RowWithVisual<Row>[] =>
  (rows ?? []).map((row) => {
    const { media: _media, visualType: _visualType, shader: _shader, ...rest } = row
    return { ...rest, visual: resolveVisual(row, { seedKey: row.id ?? undefined }) }
  })
