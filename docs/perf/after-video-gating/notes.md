# after-video-gating: capture notes

Host `https://sas-site-1btrzwimc-sas-team.vercel.app` (Vercel preview of
`perf/video-gating-hero-priority` at `52e61b4`), 2026-09-09. Lighthouse 13.4.1,
Chrome desktop app, headless. Compare with
[before-video-gating](../before-video-gating/summary.md).

## Lighthouse medians, before to after

| page | perf | lcp ms | total kb | media kb | requests |
|---|---:|---:|---:|---:|---:|
| vault desktop | 91 to 91 | 1886 to 1859 | 23339 to 4164 | 21097 to 1921 | 105 to 95 |
| vault mobile | 64 to 65 | 9757 to 9344 | 23305 to 4085 | 21142 to 1921 | 99 to 90 |
| adacore desktop | 98 to 98 | 1125 to 1098 | 5308 to 1859 | 3450 to 0 | 85 to 84 |
| adacore mobile | 66 to 79 | 9712 to 4264 | 5211 to 1762 | 3450 to 0 | 82 to 80 |
| home desktop | 90 to 91 | 1901 to 1805 | 3722 to 3427 | 2125 to 1857 | 86 to 87 |
| home mobile | 63 to 63 | 9107 to 9325 | 2746 to 2440 | 1233 to 925 | 79 to 80 |

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

- Gating works as designed. Vault requests 2 video objects at load (hero plus
  the first inline loop, which sits within two screens) instead of 10; the
  other 8 attach progressively as the reader scrolls, every one plays when
  centred, and nothing re-downloads on the way back up. Adacore's two videos
  are both below the fold and now cost nothing at load.
- Hero poster is preloaded at High priority on the video-hero pages (`vault`,
  `home`). Adacore's hero is an image and goes through `next/image` priority
  as before.
- Bytes: Vault 23.3 MB to 4.1 MB, Adacore 5.3 MB to 1.8 MB.
- Mobile LCP moved only on Adacore (9.7 s to 4.3 s). On the video-hero pages
  the LCP subparts sum to about 270 ms observed (TTFB 88, load delay 35, load
  duration 89, render delay 55 on `vault`), so the 9.3 s is Lighthouse's
  simulated-4G estimate for painting the hero video's first frame: the Vault
  hero mp4 is 1.78 MB, which is about 9 s at 1.6 Mbps. That is the encoding
  budget item (audit phase 5: hero at or under 1.5 MB, poster-first) and is
  not affected by gating. Adacore's 4.3 s is the image-hero floor and is
  mostly script weight (1.1 MB transferred), which is the bundle diet's
  problem.
- Desktop numbers are within noise before and after, as expected: desktop
  Lighthouse barely throttles, so bandwidth contention never showed there.
