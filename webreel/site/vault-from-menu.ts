import type { InputVideoConfig } from 'webreel'
import { dismissCookies } from '../steps/dismiss-cookies'
import { openMenu } from '../steps/open-menu'

const vaultMenuLink = '#site-menu a[href="/works/vault-workforce-screening"]'

export const vaultFromMenu = {
  'vault-from-menu': {
    url: '/?webreel',
    output: 'site/vault-from-menu.mp4',
    waitFor: { selector: 'button[aria-label="Open menu"]' },
    steps: [
      { action: 'pause', ms: 1000 },
      ...dismissCookies,
      ...openMenu,
      { action: 'hover', selector: vaultMenuLink },
      { action: 'pause', ms: 1000 },
      { action: 'click', selector: vaultMenuLink },
      {
        action: 'wait',
        text: 'Redefining a health brand for a new market',
        timeout: 15000,
      },
      { action: 'pause', ms: 4000 },
    ],
  },
} satisfies Record<string, InputVideoConfig>
