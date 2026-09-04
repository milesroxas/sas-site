/**
 * Cache tag for the takeover menu's editorial content (`getCachedMenuContent`).
 * Purged by the Header global and by every collection the menu lists, so a
 * publish, rename, or drag-reorder shows in the menu without waiting out the
 * hourly revalidation.
 */
export const MENU_CONTENT_TAG = 'takeover-menu-content'
