/**
 * How long a stored Ask question lives. The retention job deletes against it
 * and the notice at every Ask composer quotes it, so the promise and the
 * behaviour cannot drift apart. Client-safe: no server imports.
 */
export const ASK_QUESTION_RETENTION_DAYS = 90

/**
 * The first line of every Ask transcript. Covers the EU AI Act transparency
 * duty (visitors are told the answers come from an AI) and says that questions
 * are kept. Not part of cookie consent: it is about what visitors type, which
 * is stored whatever they chose on the banner.
 */
export const ASK_NOTICE = `Answers are AI-generated. We keep questions for ${ASK_QUESTION_RETENTION_DAYS} days, so leave out personal details.`
