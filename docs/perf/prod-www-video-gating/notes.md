# prod-www-video-gating: capture notes

Host `https://www.suits-sandals.com` (Vercel Production target, built from
`main`; production since the Webflow cutover on 2026-09-09), commit `7829a73`,
2026-09-09. Lighthouse 13.4.1, Chrome desktop app, headless. This is the
production baseline for every later slice; the earlier `before`, `after` and
`prod` runs were taken on the `preview.suits-sandals.com` alias at the same
commits.

## Lighthouse medians

| page | perf | lcp ms | fcp ms | tbt ms | total kb | script kb | media kb | requests |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| vault desktop | 90 | 1938 | 556 | 15 | 4105 | 1122 | 1921 | 88 |
| vault mobile | 69 | 8814 | 2028 | 202 | 4084 | 1122 | 1921 | 88 |
| adacore desktop | 98 | 1019 | 518 | 1 | 1800 | 1122 | 0 | 77 |
| adacore mobile | 72 | 6293 | 1874 | 151 | 1761 | 1122 | 0 | 78 |
| home desktop | 91 | 1876 | 556 | 7 | 3392 | 1100 | 1852 | 80 |
| home mobile | 64 | 10181 | 2027 | 298 | 2311 | 1100 | 796 | 78 |

## Cold-cache media capture (Playwright, 1280x800)

```
vault    at load: mp4=2 posters=10 (poster priority: High, preload link: yes)
         first R2 request: connection reused = false
         after scroll to end: mp4=10, attached at scrollY: [1800, 1800, 3000, 4200, 4800, 7800, 9600, 10200]
         video state at end: 10/10 with source, 10/10 play when centred; mp4 refetched on return: 1
adacore  at load: mp4=0 posters=2 (poster priority: Medium, preload link: no)
         first R2 request: connection reused = true
         after scroll to end: mp4=2, attached at scrollY: [6600, 6600]
         video state at end: 2/2 with source, 2/2 play when centred; mp4 refetched on return: 0
home     at load: mp4=2 posters=3 (poster priority: High, preload link: yes)
         first R2 request: connection reused = false
         after scroll to end: mp4=3, attached at scrollY: [600]
         video state at end: 2/2 with source, 2/2 play when centred; mp4 refetched on return: 0
```

## Theme guard (localStorage access throwing)

```
/                                    { theme: 'light', opacity: '1' } PASS
/works/vault-workforce-screening     { theme: 'light', opacity: '1' } PASS
```

## Reading

- Gating, poster preload and the theme guard behave exactly as on the alias.
  Bytes and request counts match the alias run within a few KB.
- Adacore mobile LCP reads 6.3 s here against 3.5 s on the alias an hour
  earlier at the same commit. The two runs differ only in host, and the
  Adacore hero is an image served through `/_next/image`, whose cache is
  keyed per deployment and was cold on the first www hits (the warm-up
  requests fetch HTML only). Treat 3.5 to 6.3 s as the noise band for that
  page until a second www run settles it; the next slice's run will.
- Vault and home mobile LCP remain hero-mp4 bound under simulated 4G
  (phase 5) plus 1.1 MB of script (P0-2). Those are the two levers left for
  mobile LCP; nothing in this slice was expected to move them.
- Field: Speed Insights on www is public traffic from 2026-09-09. First
  read on 2026-09-16.
