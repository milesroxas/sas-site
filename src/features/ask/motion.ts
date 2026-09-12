/**
 * Entrance for anything that joins the transcript (messages, the Thinking
 * shimmer, the handoff, the rating's follow-up, errors): a short rise from
 * the composer's direction on the site's settle curve. Mount-once keyframes
 * are safe here: items never re-trigger.
 */
export const transcriptItemEnter =
  'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 motion-safe:ease-out-quint'

/**
 * The handoff's entrance when it follows a lead line that mounts on the same
 * render: the words land first, the offer a beat after, so the two read as
 * "here is why, and here is the way" rather than one block. An arbitrary
 * animation-delay on purpose, as the closing band's composer does: `delay-*`
 * also sets transition-delay, which would hold the chip's press feedback.
 */
export const handoffAfterLead =
  'motion-safe:[animation-delay:150ms] motion-safe:fill-mode-backwards'
