/**
 * Autosave cadence for every draft-enabled collection and global.
 *
 * Each autosave is a full version write on the production database, and the
 * admin's live preview refreshes the draft route on every one of them. The
 * Payload website template ships 100 ms for local dev, which on serverless
 * turned typing pauses into a stream of function invocations and starved the
 * admin's own form-state requests. 800 ms is Payload's documented default and
 * still reads as live in the preview pane.
 */
export const AUTOSAVE_INTERVAL_MS = 800
