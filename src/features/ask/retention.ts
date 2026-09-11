/**
 * How long a stored Ask question lives. The retention job deletes against it
 * and the notice at every Ask composer quotes it, so the promise and the
 * behaviour cannot drift apart. Client-safe: no server imports.
 */
export const ASK_QUESTION_RETENTION_DAYS = 90

/**
 * The first line of every Ask transcript. Covers the EU AI Act transparency
 * duty (visitors are told they are chatting with an AI) and says chats are
 * kept. Not part of cookie consent: it is about what visitors type, which
 * is stored whatever they chose on the banner.
 */
export const ASK_NOTICE = `Heads up! You're chatting with our AI. We save chats anonymously for ${ASK_QUESTION_RETENTION_DAYS} days to improve this feature.`
