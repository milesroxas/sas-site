/**
 * The closing band is a curtain: it parks at the bottom of the viewport while
 * the page article scrolls off it, so the last screen is *unmasked* rather
 * than scrolled to. Being sticky, the band is on screen from the first paint
 * and its own box can tell nothing about scroll — so a 1px marker in normal
 * flow stands in for it. The marker sits exactly at the band's flow position,
 * which makes one number do both jobs: how far it has risen past the fold is
 * how much of the band the page has uncovered.
 *
 * Read by the reveal gate (`FooterClosing`) and by the background's parallax
 * scrub (`ClosingMedia`), so both are timed off the same line.
 */
export const FOOTER_CLOSING_GATE_SELECTOR = '[data-footer-closing-gate]'
