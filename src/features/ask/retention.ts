/**
 * How long a stored Ask question lives. The retention job deletes against it
 * and the notice at every Ask composer quotes it, so the promise and the
 * behaviour cannot drift apart. Client-safe: no server imports.
 */
export const ASK_QUESTION_RETENTION_DAYS = 90

/**
 * Shown at every Ask composer. Covers the EU AI Act transparency duty (visitors
 * are told the answers come from an AI) and says, at the point of collection,
 * that questions are kept.
 */
export const ASK_NOTICE = `AI answers about our work, services, and insights. We keep questions for ${ASK_QUESTION_RETENTION_DAYS} days, so leave out personal details.`
