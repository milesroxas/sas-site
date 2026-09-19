import { LIGHT_LEAK_SCOPE_ATTR } from '../ui/light-leak-excite'

/**
 * A block root a bleeding visual may wash across: `Section`, the work-page
 * reveal shell. The root spreads `VISUAL_HOST`; a visual that bleeds portals
 * its layer onto the nearest one, and globals.css ("Visual bleed") makes the
 * root the layer's containing block and blend group while it holds one. Kept
 * apart from the client slot so server components can spread it.
 *
 * The same root is the band a light leak answers hover inside
 * (`LIGHT_LEAK_SCOPE_ATTR`): one root, one bleed, one hover scope, so a leak
 * in a block never flares at a link in the block above it.
 */
export const VISUAL_HOST_ATTR = 'data-visual-host'
export const VISUAL_HOST = { [VISUAL_HOST_ATTR]: '', [LIGHT_LEAK_SCOPE_ATTR]: '' } as const
/** On the layer a block root is holding. */
export const VISUAL_BLEED_ATTR = 'data-visual-bleed'
