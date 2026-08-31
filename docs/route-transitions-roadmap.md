# Route transitions — audit & roadmap

Working doc for the navigation-experience overhaul, started **2026-08-31**. This is the in-flight surface: audit of what exists, issues found, edge-case policy, staged plan, and an append-only decision log. Update **Progress** and **Decision log** as work lands. The canonical system reference stays [animations.md](animations.md) — fold anything durable back into it when a stage ships.

**Scope:** what a user experiences navigating *between* pages. In-page motion (scroll reveals, takeover menu internals, marquee) is out of scope except where it collides with navigation. The work-entry transitions (`work-open` takeover, menu hero handoff) are **kept as-is** — polish is a later stage, not this one.

---

## 1. What exists (audit, 2026-08-31)

One engine for route transitions: React's experimental `<ViewTransition>` (Next `experimental.viewTransition: true`, [next.config.ts:26](../next.config.ts)). No transition library, no GSAP page-transition provider. GSAP touches navigation in exactly two places, both deliberate: the menu hero handoff (runs *instead of* a view transition, over an untagged push) and the `work-open` landing plan (GSAP-authored curves sampled into WAAPI).

| Piece | File | Role |
|---|---|---|
| Page wrapper | [src/app/(frontend)/template.tsx](../src/app/(frontend)/template.tsx) → [DirectionalTransition.tsx](../src/shared/ui/view-transition/DirectionalTransition.tsx) | Remounts per navigation; maps transition types → CSS classes; `default: 'none'` everywhere |
| Types (SSOT) | [src/shared/lib/view-transition/constants.ts](../src/shared/lib/view-transition/constants.ts) | `nav-forward`, `nav-back`, `nav-lateral`, `work-open` + shared-element name builders |
| Recipes + timing | [src/shared/ui/view-transition/view-transition.css](../src/shared/ui/view-transition/view-transition.css) | All `--vt-*` vars in `:root`; slide/fade/morph recipes; chrome isolation; reduced-motion collapse |
| Link tagging | [src/components/Link/index.tsx](../src/components/Link/index.tsx) (`CMSLink`, `transitionDirection` prop, default `lateral`) + raw `next/link` with explicit `transitionTypes` | Declarative tagging |
| Imperative tagging | [src/components/Pagination/index.tsx:34](../src/components/Pagination/index.tsx) | Only production `addTransitionType` call site |
| Post image morph | [Card/index.tsx](../src/components/Card/index.tsx) ↔ [PostHero](../src/heros/PostHero/index.tsx) (`share="morph"`, `postImageVtName`) | Insights list → post detail |
| Work takeover | [IndustryWork/Component.client.tsx](../src/blocks/IndustryWork/Component.client.tsx) ↔ [WorkImageTransition.tsx](../src/shared/ui/view-transition/WorkImageTransition.tsx), beats in [work-image-morph.ts](../src/shared/ui/view-transition/work-image-morph.ts), landing in [hero-landing.ts](../src/shared/ui/hero-landing/hero-landing.ts) | `work-open`: center → expand → hold → clip landing → settle |
| Menu hero handoff | [src/Header/Menu/heroHandoff.ts](../src/Header/Menu/heroHandoff.ts) | GSAP traveler over an intentionally untagged push; VT root un-named while frame is docked |
| Scroll coupling | [src/providers/SmoothScrollProvider.tsx](../src/providers/SmoothScrollProvider.tsx) (`LenisRouteReset`) | Layout-effect reset inside the VT update callback |
| Chrome isolation | header / footer / global canvas named groups, `animation: none` | Persistent elements never participate |
| Tuning surface | `/demo/transitions` ([transition-simulator.tsx](../src/widgets/transition-demo/ui/transition-simulator.tsx)) | Live-overrides `--vt-*` vars; copy button emits the `:root` block |

### Navigation map (behavior at audit time — Stages 1–2 have since landed; §7 has what changed)

| Navigation | Mechanism | Result today |
|---|---|---|
| CMS-driven links everywhere (heros, blocks, footer, buttons) | `CMSLink`, default `lateral` | Fade + 3px blur (`vt-fade`) |
| Header logo, menu links, menu CTA, 404 → home, demo sidebar | tagged `nav-lateral` | Same fade |
| Post card **title** → post | tagged `nav-forward` + image `morph` | Slide + shared-element morph |
| Post card **body** click | `useClickableCard` push, untagged ([useClickableCard.ts:64](../src/utilities/useClickableCard.ts)) | **Hard cut** — same card, two behaviors |
| Featured-work roll → case study | tagged `nav-forward` | Slide |
| IndustryWork spotlight → case study | tagged `work-open` | Media takeover (keep) |
| `/works` index card → case study | **raw `<a>`** ([WorkPageCard/index.tsx:18](../src/components/WorkPageCard/index.tsx)) | **Full document reload** — bypasses router entirely |
| Segment index pages | **raw `<a>`** ([SegmentIndex.tsx:35-39](../src/sections/SegmentIndex.tsx)) | **Full document reload** |
| Pagination | `addTransitionType` forward/back | Directional slide |
| Search-as-you-type → `/search` | untagged push ([search/Component.tsx:16](../src/search/Component.tsx)) | Hard cut |
| Form success redirect | untagged push ([Form/Component.tsx:112](../src/blocks/Form/Component.tsx)) | Hard cut |
| Menu link with hero media | untagged push, GSAP traveler | Handoff (keep; untagged **by design**) |
| Browser back / forward | popstate | Hard cut (platform limitation — sync popstate can't start a VT) |
| Slow route (uncached RSC) | — no `loading.tsx`, no `Suspense`, no progress UI | Page sits still until payload arrives, then transitions |

### What's working well (don't touch)

- `default: 'none'` discipline — Suspense resolves and revalidations never animate by accident.
- Chrome isolation (header/footer/canvas) and the docked-frame escape hatches ([view-transition.css:289-300](../src/shared/ui/view-transition/view-transition.css)).
- `LenisRouteReset` as a layout effect — snapshot correctness under smooth scroll.
- Reduced motion collapses every path, including the WAAPI beats (bail at [work-image-morph.ts:46](../src/shared/ui/view-transition/work-image-morph.ts)).
- Timing SSOT in `:root` + the demo simulator's copy workflow.
- The `work-open` and menu-handoff engines themselves — elaborate but sound, each beat documented.

---

## 2. Findings

Ranked. **C** = coverage gap, **X** = complexity/correctness, **D** = docs drift. *(Status 2026-08-31: 1–5 and 8 resolved by Stages 1–2; 6 deferred to polish; 7 partially closed — reveal vars are simulator-tunable, the work-open approach vars still aren't.)*

1. **C — `/works` index doesn't client-navigate at all.** `WorkPageCard` and `SegmentIndex` render raw `<a>`, so the flagship index → case-study path is a full document reload: no transition, Lenis/WebGL/menu state torn down and rebooted. The site's most designed destination has its least designed approach.
2. **C — split-brain post cards.** Title link slides forward with an image morph; a click on the card body (`useClickableCard`) hard-cuts. Same element, luck-of-the-pixel behavior. Fix in `useClickableCard` itself (one `startTransition` + `addTransitionType` around the push) so every consumer inherits it.
3. **C — `transitionDirection` is dead API.** No call site ever passes it, so every CMS link is `lateral`. Either the default fade is *the* site grammar (fine — then say so and simplify), or hierarchical CMS navigations (e.g. into case studies / posts via CMS buttons) should tag `forward`. Decide, don't leave it half-used.
4. **C — search and form-redirect pushes untagged.** Two-line fixes once the default policy is decided. Search-as-you-type may deserve `default: 'none'` on purpose (URL-sync, not navigation) — decide in §3.
5. **X — the default fade animates `filter: blur(3px)` on full-viewport snapshots** (`vt-fade`, both directions of every lateral navigation — the most common transition on the site). Blur over a viewport-sized texture is the single most expensive thing in the default path, and it runs on low-end GPUs on *every* CMS link. **Settled by the standard (§4):** the whole-page fade is off-brand and gets replaced by the mask-reveal default in Stage 2; blur survives only inside same-media morph pairs.
6. **X — `home-hero` group is misnamed and broader than "home".** `vt-home-hero` is applied by both the Home hero and `HighImpact` ([HighImpact/index.tsx:17](../src/heros/HighImpact/index.tsx)), so any page pair with those heroes forms a named pair: the recede plays on every tagged navigation type, and the UA's default group rect-tween (unstyled for this group) tweens between the two heroes' rects. Works today mostly by geometry luck. Rename (`page-hero`), and give the group an explicit duration/ease so the rect tween is designed, not inherited.
7. **X — the demo can't tune the whole system.** Simulator overrides 6 of 9 `:root` vars; `--vt-duration-hero-center`, `--vt-duration-hero-expand`, `--vt-ease-hero-travel` aren't wired ([transition-simulator.tsx:74-79](../src/widgets/transition-demo/ui/transition-simulator.tsx)). The work-open approach beats are tuned blind. Fold into whichever stage next touches those values.
8. **D — [animations.md:25](animations.md) undercounts untagged navigations** (omits clickable-card, search, form-redirect; the demo overview already names the first). Also silent that `/works` uses raw `<a>` — a reader of the `work-open` paragraph would assume the index animates. Update alongside Stage 1.

Not a finding, but named so nobody "fixes" it: **three engines on `work-open` (CSS fallback → WAAPI beats → GSAP-planned curves) is intentional** — CSS is the degradation path, WAAPI is the only way to animate VT pseudos imperatively, GSAP authors the curves once for both the menu handoff and the takeover. Leave it.

---

## 3. Edge-case policy

| Case | Today | Policy (proposed — confirm in decision log) |
|---|---|---|
| Browser back/forward | Hard cut | **Accept.** Sync popstate can't start a VT (React/platform). Never emulate with `router.push` hacks. Revisit if React ships popstate support. |
| Unsupported browser (no VT / no `linear()`) | Hard cut / CSS fallback glide | **Accept.** Everything already gates on `@supports` + capability checks. |
| Reduced motion | All paths collapse to instant | **Keep.** Any new default must collapse the same way. |
| Modified click / new tab | `CMSLink` skips tagging when `newTab` | **Keep.** |
| Slow navigation (uncached RSC payload) | Stillness — no pending UI at all | **Decide.** Options: (a) keep stillness as the brand (current, documented in demo overview); (b) minimal pending affordance on the *trigger* (pressed/waiting state via `useLinkStatus`, cursor state) with no global spinner; (c) `loading.tsx` — rejected: it changes VT semantics (fallback becomes the enter target) and fights the morphs. Recommendation: **(b)** — stillness at page level, honesty at the control level. |
| Search-as-you-type URL sync | Untagged push per keystroke (debounced) | Treat as **state sync, not navigation** — deliberately no transition; add a comment so it stops reading as a gap. |
| Menu hero handoff | Untagged by design; traveler owns motion | **Keep.** The `default: 'none'` contract is what makes it safe. |
| Mid-transition click (rapid nav) | Browser skips/queues; React handles | Verify during Stage 2 QA on throttled network; no code until a real defect shows. |
| Hash/anchor + same-route param changes | Unaudited | Audit in Stage 2 (Lenis anchor reset exists; check no VT fires on param-only changes). |

---

## 4. Motion identity — the animation standard

Agency brand grammar, set 2026-08-31. Every transition — route-level now, in-page motion when next touched — is checked against this before any tuning begins.

| Move | Allowed when | Never for |
|---|---|---|
| **Mask reveal** (clip-path wipe / one-axis collapse) | **The default.** The confident identity move for any content change: page enters, media reveals, surface uncovers | — |
| **Fade / dissolve** | Only to blend the **same media** together — spotlight→hero settle, post-image morph pairs, menu hover dissolve | Crossfading two different pages or unrelated content; the default navigation |
| **Scale** | A surface-level context switch where the page itself doesn't change (in-place swaps), or an element mid-sequence where scaling produces a confident, purposeful beat (work-open expand, hero recede) | Ambient / decorative scaling |

How the existing system measures up:

- **The set pieces already comply.** Hero landing = mask (one-axis clip collapse); `work-open` = scale beats + mask landing + a same-media dissolve; post image morph = same-media blend; scroll-reveal media = mask wipe. The standard codifies what the signature moments already do.
- **The current lateral default is the outlier.** `vt-fade` crossfades two *different* pages (plus blur) — precisely the move the standard rejects. Replaced in Stage 2; it survives Stage 1 only as the interim behavior while coverage lands.
- **Directional slides (`nav-forward`/`nav-back`) are also off-grammar** — translate + fade, no mask. If hierarchy stays expressed (D2), direction should migrate to mask edge/origin, not slides.
- In-page swaps outside this doc's scope (filter swap, audience-tabs text fades) owe the same review whenever they're next touched — the "surface-level context switch" row is their lane.

## 5. The default transition (target)

**Goal:** one DRY, reusable, performant default for every non-work navigation. **The infrastructure already exists** — `DirectionalTransition` + type constants + `:root` timing are the right shape. This is a design-and-coverage problem, not an architecture problem.

Principles:

1. **`default: 'none'` stays.** The default transition is delivered by *tagging every navigation*, never by loosening the fallback (that would animate Suspense resolves and revalidations).
2. **One grammar, few words — and the grammar is §4.** A single mask-reveal default site-wide; hierarchy (if kept, D2) expressed through mask edge/origin; `work-open` and the menu handoff stay the two set pieces.
3. **Tuning lives in `:root` only**, dialed on `/demo/transitions`, pasted via the copy button — same contract as every other motion system.
4. **Compositor-only by default.** VT snapshots are already composited layers, and the work-open landing proves clip-path on the group pseudo holds up — but carry [animations.md](animations.md)'s full-viewport-wipe caveat (promotion isn't guaranteed in Chrome) into Stage 2 QA. No blur on full-viewport layers.
5. Every path collapses under reduced motion and degrades to hard cut without VT support.

Open design decisions (answer in the decision log). Per §4 the default **is a mask reveal** — D1 picks which one:

- **D1 — Which mask reveal?** Candidates: (a) single-edge wipe — new page's snapshot clips open top-down, echoing the scroll-reveal media wipe; (b) one-axis collapse/expand — the hero-landing language (horizontal then vertical, never diagonal) applied at page scale, the strongest brand echo; (c) canvas-gap reveal — old page masks *out* to the persistent WebGL canvas, new page masks *in* over it, so the ever-live canvas breathes in the gap (most "this site"; costs a longer two-beat sequence). Whichever wins, the choreography (edge, axis order, timing) becomes the reusable default recipe.
- **D2 — Does hierarchy survive?** If yes: expressed as mask origin (forward reveals from one edge, back from the opposite), replacing the translate+fade slides. If no: one origin everywhere, direction retired outside pagination.
- **D3 — Slow-nav pending affordance:** option (b) in §3?
- ~~**D4 — Blur in the default**~~ — **resolved by §4**: blur-fade cut from the default entirely. Fades (and `vt-via-blur`) survive only inside same-media blends — the morph pairs and settle dissolves.

---

## 6. Plan

- **Stage 0 — Audit.** ✅ 2026-08-31 (this document).
- **Stage 1 — Coverage.** Every navigation tagged; no accidental hard cuts. Convert `WorkPageCard` + `SegmentIndex` to `next/link` with types (works index gets `nav-forward`; whether it later joins the takeover is a Stage 4 question). Tag `useClickableCard` (fixes every card consumer at once). Tag the form redirect. Comment the search push as intentional non-transition. Update [animations.md:24-25](animations.md). *No visual redesign in this stage — coverage only, current fade.*
- **Stage 2 — The default recipe.** Decide D1–D3, build the mask-reveal default per §4 (retiring `vt-fade` and the translate+fade slides from the default path), wire any new vars into the simulator (close finding 7 for the vars this touches), implement in `view-transition.css` + `DirectionalTransition`, tune on `/demo/transitions`, paste. Rename `home-hero` → designed group (finding 6). QA matrix: throttled network, reduced motion, Safari/Firefox, back/forward, rapid clicks, clip-path promotion check (§5 principle 4).
- **Stage 3 — Edge-case hardening.** Land the pending-affordance decision (D3), audit hash/param navigations, verify mid-transition interrupts.
- **Stage 4 — Work-entry polish.** (Later, per scope note.) Revisit takeover tuning, possibly extend takeover grammar to `/works` index, close the remaining simulator gaps.

## 7. Progress

- [x] Stage 0 — audit
- [x] Animation standard adopted (§4)
- [x] Stage 1 — coverage *(2026-08-31: `useClickableCard` tags its push — `transitionType` option, default `nav-forward`; `WorkPageCard` + `SegmentIndex` converted from raw `<a>` to tagged `next/link`; form redirect tags `nav-lateral`; search push annotated as intentional URL sync; [animations.md](animations.md) corrected)*
- [x] Stage 2 — default recipe, v1 *(2026-08-31: mask-reveal default shipped — `reveal-hold` old layer + `reveal-down`/`reveal-right`/`reveal-left` new-layer wipes, `--vt-duration-reveal: 480ms` + `--vt-ease-reveal`; fade/slide recipes and `--vt-slide-distance` removed; simulator + demo copy retuned to the reveal model. **Pending:** in-browser QA on `/demo/transitions` (throttle, reduced motion, Safari/Firefox, morph-over-reveal, hero-recede-over-reveal, clip-path promotion), and dialing the duration/ease by feel)*
- [ ] Stage 3 — edge-case hardening (D3 open)
- [ ] Stage 4 — work-entry polish

## 8. Decision log

*Append-only. Date — decision — why.*

- **2026-08-31** — Audit created. Keep the existing `<ViewTransition>` architecture; the overhaul is coverage + one designed default, not a rebuild. Work-entry transitions (`work-open`, menu handoff) explicitly out of scope until Stage 4.
- **2026-08-31** — `default: 'none'` is non-negotiable (principle 1); the default transition ships via tagging coverage.
- **2026-08-31** — **Animation standard adopted (§4).** Brand call: no reliance on fades except to blend the same media together; mask reveals are the identity move and the default; scale for surface-level context switches (page unchanged) or where an element mid-sequence earns a confident, purposeful beat. Consequences: the default page transition will be a mask reveal; D4 resolved (blur-fade cut from the default; fades persist only in same-media blends); directional slides slated for replacement by mask origin if D2 keeps hierarchy.
- **2026-08-31** — **Clean default before the index/hero redesign** (user call): ship Stages 1–2 now so the insights/work redesign builds on the finished default; shared-element morph tuning and Stage 4 wait until the new geometry exists. During the redesign, carry the thin VT wrappers (`postImageVtName` + `share="morph"`, `WorkImageTransition`) into the new markup without polishing choreography.
- **2026-08-31** — **D1: edge-wipe reveal, v1.** Lateral reveals top-down (scroll-reveal wipe at page scale); one beat, `--vt-duration-reveal: 480ms`, site ease. The richer candidates (page-scale one-axis collapse, canvas-gap reveal) stay on the table as polish-phase upgrades — the recipe classes localize any swap to `view-transition.css` + the `DirectionalTransition` map.
- **2026-08-31** — **D2: hierarchy kept, expressed as mask origin.** `nav-forward` reveals from the right edge, `nav-back` from the left; the translate+fade slides are retired. Existing type tagging is untouched — direction now only picks the reveal's origin.
- **2026-08-31** — Hero recede (`home-hero` group) left as-is over the new reveal for v1; re-judge it against the standard (its crossfade component) during polish, together with the `home-hero` → `page-hero` rename (finding 6).
- **2026-08-31** — **Hero recede retired; docked navigations hard-cut totally** (supersedes the entry above — user reported pages without hero media looking broken). Two root causes fixed: (a) `.vt-home-hero` was a raw always-on `view-transition-name`, so under `reveal-hold` the old root snapshot held a transparent hero-shaped hole (new page popping through instantly) with a recede ghost floating above — and the recede's crossfade blends *different* media, off-grammar per §4. The class, keyframes, group rules and `--vt-duration-hero` are removed; heroes now ride the page reveal as part of the page (finding 6 resolved by removal — rename moot). (b) The menu's no-handoff fallback let the tagged `nav-lateral` Link navigate while the frame was docked — snapshots ignore the dock's transform, so full-size page snapshots painted over the open menu. `onNavItemClick` now intercepts every in-app menu click with an untagged push (the undock reverse owns all visible motion — a scale beat, allowed by §4), menu links dropped their dead `transitionTypes`, and a belt-and-braces CSS guard zeroes every view-transition animation while `[data-page-frame][inert]` is set.
- **2026-08-31** — **Shared-element `share` props are type-gated** (user reported menu → work page broken). Root cause: `share="morph-hero"` as a plain string activates on *any* transition where the name pair forms — so a menu hero-handoff push to a case study, from a page rendering that work's IndustryWork spotlight, started a view transition on a navigation the GSAP traveler owns; the `onShare` sequencer correctly refused (gated to `work-open`), which left the *CSS fallback glide* painting a full-size media snapshot (captured from the docked frame at undocked geometry) in the top layer, over the traveler. The docked CSS guard races the frame-unfreeze at route commit, so it can't reliably catch this. Fix: `share` is now a type map on every shared element — `workImageShare` (`work-open` only) on IndustryWork + `WorkImageTransition`, `postImageShare` (`nav-forward`/`nav-back` only) on `Card` + `PostHero`/`Banner` — both maps in `shared/lib/view-transition/constants.ts`. **Rule going forward: no plain-string `share` — every pair names the types it participates in.**
- **2026-08-31** — **Handoff guard made deterministic** (user report: menu → work media "snaps out of the mask" mid-expansion — the signature of the top-layer morph glide still painting over the traveler). The `[data-page-frame][inert]` CSS guard races the frame-unfreeze at route commit — exactly when a transition would be captured. `startHeroHandoff` now stamps `data-menu-handoff` on `<html>` for the traveler's whole flight (removed in `finish`), and `view-transition.css` unnames the root + zeroes every VT animation under it. With the share maps this is belt-and-braces; the attribute guarantees "the traveler owns all visible motion" structurally, restoring the pre-morph (d2dbb0f-era) pure-traveler experience on this path. Both `morph-hero` sides now also read the shared `workImageShare` const. Note: `WorkImageTransition` is a server component — its share-map fix needs a dev-server restart / hard reload to take effect, which may explain a "still broken" observation after the previous fix.
- *(pending)* D3 pending affordance · reveal duration/ease final values (dial on `/demo/transitions`).
