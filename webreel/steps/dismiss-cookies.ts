import type { Step } from 'webreel'

/** Fresh Chrome profiles hit the c15t banner on the live site. */
export const dismissCookies: Step[] = [
  { action: 'wait', text: 'Accept All', timeout: 10000 },
  { action: 'click', text: 'Accept All', delay: 800 },
]
