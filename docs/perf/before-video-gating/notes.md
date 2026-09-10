# before-video-gating: capture notes

Host `https://preview.suits-sandals.com` (the public alias at the time; `www` cut over from Webflow later the same day), 2026-09-09, commit `ff16495` deployed. Lighthouse 13.4.1, Chrome desktop app, headless.

## Cold-cache media capture (Playwright, 1280x800)

```
vault    at load: mp4=10 posters=10 (poster priority: Medium, preload link: no)
         first R2 request: connection reused = false
         after scroll to end: mp4=10, attached at scrollY: []
         video state at end: 10/10 with source, 10/10 play when centred; mp4 refetched on return: 1
adacore  at load: mp4=2 posters=2 (poster priority: Medium, preload link: no)
         first R2 request: connection reused = true
         after scroll to end: mp4=2, attached at scrollY: []
         video state at end: 2/2 with source, 2/2 play when centred; mp4 refetched on return: 0
home     at load: mp4=3 posters=3 (poster priority: Medium, preload link: no)
         first R2 request: connection reused = true
         after scroll to end: mp4=3, attached at scrollY: []
         video state at end: 2/2 with source, 2/2 play when centred; mp4 refetched on return: 0
```

Reading: every video object a page uses is requested at load; nothing attaches
on scroll. Posters load at Medium priority with no preload hint. "Refetched on
return: 1" on `vault` is the hero resuming playback at the top (a range request
on an object already fetched), not a re-download.

## Theme guard (localStorage access throwing)

```
/                                    { theme: null, opacity: '0' } FAIL
/works/vault-workforce-screening     { theme: null, opacity: '0' } FAIL
```

Reading: with storage blocked the bootstrap throws before `data-theme` is set
and the page stays at `opacity: 0`. The patched script (branch
`perf/video-gating-hero-priority`) passes the same probe offline.
