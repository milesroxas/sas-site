# prod-video-gating: capture notes

Host `https://preview.suits-sandals.com` (the `preview` branch domain, which
serves the same commit as production once `main`, `dev` and `preview` are
fast-forwarded together), commit `76f5ea0` (PR #15 merged), 2026-09-09.
Lighthouse 13.4.1, Chrome desktop app, headless. Confirms the
[after-video-gating](../after-video-gating/notes.md) preview numbers on the
live alias.

## Lighthouse medians, baseline to prod

| page | perf | lcp ms | total kb | media kb |
|---|---:|---:|---:|---:|
| vault desktop | 91 to 90 | 1886 to 1922 | 23339 to 4164 | 21097 to 1921 |
| vault mobile | 64 to 67 | 9757 to 8970 | 23305 to 4085 | 21142 to 1921 |
| adacore desktop | 98 to 98 | 1125 to 1042 | 5308 to 1858 | 3450 to 0 |
| adacore mobile | 66 to 81 | 9712 to 3456 | 5211 to 1762 | 3450 to 0 |
| home desktop | 90 to 94 | 1901 to 1403 | 3722 to 3425 | 2125 to 1856 |
| home mobile | 63 to 65 | 9107 to 9290 | 2746 to 2471 | 1233 to 956 |

## Cold-cache media capture (Playwright, 1280x800)

```
vault    at load: mp4=2 posters=10 (poster priority: High, preload link: yes)
         first R2 request: connection reused = true
         after scroll to end: mp4=10, attached at scrollY: [1800, 1800, 3000, 4200, 4800, 7800, 9600, 10200]
         video state at end: 10/10 with source, 10/10 play when centred; mp4 refetched on return: 1
adacore  at load: mp4=0 posters=2 (poster priority: Medium, preload link: no)
         first R2 request: connection reused = true
         after scroll to end: mp4=2, attached at scrollY: [6600, 6600]
         video state at end: 2/2 with source, 2/2 play when centred; mp4 refetched on return: 0
home     at load: mp4=2 posters=3 (poster priority: High, preload link: yes)
         first R2 request: connection reused = true
         after scroll to end: mp4=3, attached at scrollY: [600]
         video state at end: 2/2 with source, 2/2 play when centred; mp4 refetched on return: 0
```

## Theme guard (localStorage access throwing)

```
/                                    { theme: 'light', opacity: '1' } PASS
/works/vault-workforce-screening     { theme: 'light', opacity: '1' } PASS
```

## Reading

Identical gating behaviour to the preview deploy, and the Lighthouse medians
sit inside lab noise of the preview run. Vault and home mobile LCP remain
bounded by the hero mp4 under simulated 4G (phase 5) and script weight
(P0-2). Field check: Speed Insights on `/works/[slug]` from 2026-09-16.

Deployment note: the alias flipped only when the `preview` branch deployment
reached Ready, about five minutes after the production build, because the
alias is that branch's domain rather than the Production target.
