type LayoutBlock = {
  blockType?: string | null
  itemSource?: string | null
  blocks?: readonly unknown[] | null
}

/**
 * Whether a layout already lists Work pages in a Poster list, at the top
 * level or inside a Section. Segment pages (Expertise, Who We Help) then skip
 * their automatic related-work grid: the editor placed the work themselves,
 * and showing it twice would repeat the same entries.
 */
export const layoutListsWork = (blocks?: readonly unknown[] | null): boolean =>
  (blocks ?? []).some((value) => {
    const block = value as LayoutBlock
    if (block.blockType === 'posterList' && block.itemSource === 'collection') return true
    return layoutListsWork(block.blocks)
  })
