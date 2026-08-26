# Browser verification — duplication refactor (2026-08-26)

Manual checks for the change that took `fallow dupes` from **59 clone groups / 4.52%** to **0 / 0%**.

Already verified automatically — do not re-check by hand:

| Check | Result |
|---|---|
| `pnpm exec tsc --noEmit` | clean |
| `pnpm lint` (biome) | clean |
| `pnpm test:int` (vitest) | 120/120 across 17 files |
| `pnpm build` + postbuild sitemap | succeeds, all `[slug]` routes prerender |
| `pnpm generate:types` | output **byte-identical** — Payload config refactors are schema-neutral, **no migration needed** |

What follows is what those checks *cannot* see: rendering, admin layout, animation, and draft/published behaviour.

Run `pnpm dev` → <http://localhost:3001>. Ordered by risk — the first three sections are where a break is actually plausible.

---

## 1. Contact form — biggest rewrite

Text, Email, Number, Textarea, Country, State, Select and Checkbox were rebuilt on new shared primitives (`FieldShell`, `SelectInput`), and Text + Email + Number collapsed into a single `createTextInput` factory.

Find a page embedding a Form block (`/admin` → Forms shows which), then:

- [ ] Every field renders with its **label**; required fields show the red `*`
- [ ] Email field rejects `foo@`, accepts `a@b.co` — the pattern moved into the factory
- [ ] Number field renders a **number** input (spinner / numeric keyboard), not text
- [ ] Country and State dropdowns populate and hold their selection
- [ ] The Select block's dropdown uses **its CMS options** and honours a configured default value
- [ ] Checkbox toggles; its label sits *after* the box
- [ ] Submit empty → error text under each required field, `aria-invalid` styling applies
- [ ] Submit valid → confirmation / redirect path works

## 2. Payload admin — field order and layout

Identical generated types prove the *schema*, not the *rendering*. Field order, collapsibles and conditions are what moved.

- [ ] **Who We Help** + **Expertise** — both now come from one `segmentPageCollection` factory. Check tab order (Opening / Composition / Positioning / SEO), the industries-vs-capabilities relationship field, its description copy, and that Composition offers the right block list
- [ ] **Work Pages** + **Lab Pages** — hero group → "Content" collapsible (eyebrow, show-overrides toggle, title/summary overrides appear **only** when toggled); "Media & layout" collapsible → theme then mediaTreatment; sidebar still shows featured + publishedAt
- [ ] **Capabilities / Industries / Platforms** — name, slug, description. Platforms keeps its longer editor guidance
- [ ] **Projects / Lab Projects** — `projectLinks` array (label / url / visibility)
- [ ] Open a **case-study block** and a **lab block** in the layout editor — story-section fields (eyebrow, headingOverride, bodyOverride, and customBody only when `source` is `custom`), rich transition, related-work selection
- [ ] Save a document in each collection — no validation surprises

## 3. Immersive demos

The GSAP timelines and the WebGL canvas shell were restructured.

### `/demo/transitions`

- [ ] `#text-load-in` and `#text-load-in-raymarched` — eyebrow scrambles, headline resolves through the shader, body sharpens after. Press **replay**. Both should look exactly as before
- [ ] **Toggle the site theme while `#text-load-in-raymarched` is on screen** — the heading must redraw in the new colour. This exercises the new `watchTheme` flag on the shared `GlHeading` shell and is the single most likely regression in the whole change
- [ ] Resize the window mid-reveal — the heading texture re-measures rather than stretching
- [ ] leva panels — folder order (Content, Eyebrow, Heading, Smear/Timing, Body, Trigger) and every slider still drives the effect
- [ ] `#reveal-intro` / `#reveal-media` — the "visible fraction" slider under Trigger still works

> The emitted **copy snippet** now lists props in a different order. Cosmetic, expected — one object now feeds both the snippet and the render, so they can no longer drift.

### `/demo/immersive`

- [ ] `#refraction`, `#dispersion`, `#floating-cards`, `#industry-work` — images and video load, glass effect renders. The shared texture-swap path changed; a broken swap shows as a black or blank panel
- [ ] Switch a media source in the panel — the old texture is replaced, not leaked or frozen

## 4. Pages touched directly

- [ ] `/expertise` and `/who-we-help` — index cards render (both now one shared `SegmentIndex` component)
- [ ] `/expertise/[slug]`, `/who-we-help/[slug]` — hero, blocks, **Related Work** section
- [ ] `/works/[slug]` — hero on **both** layouts, `centered-media` and `landscape` (shared `caseStudyHeroFacts`), intro band, blocks, related work
- [ ] `/lab/[slug]` — hero, blocks, related lab projects
- [ ] A work page and a lab page with a **media gallery block** — grid vs horizontal layout, captions, credits. On the case-study one the figures still scroll-reveal; on the lab one they do not. Both are correct
- [ ] `/` — Featured Work and Industry Work blocks (shared work-page fetch)
- [ ] `/llms.txt` and `/llms-full.txt` — header, section links, full bodies

## 5. Quick confirmations

- [ ] **Draft / live preview** — open a page in `/admin`, hit preview. Unpublished content must appear in draft mode and **must not** on the public URL. The draft-vs-published branch moved into the shared slug query and the shared work-page fetch
- [ ] `/admin` media upload → asset-library folder auto-assign still works (shared relation-id helper)
- [ ] Newsletter → **Send test** from `/admin` (lands in your own inbox)
- [ ] Browser console clean on load — Sentry init was restructured. It is disabled locally, so this only confirms it does not throw
- [ ] `POST /next/seed` now 404s. Intentional: that was Payload template scaffold, superseded by `pnpm seed`

---

## Not verifiable locally

**Revalidation.** Publishing now also purges the **old** path when a slug changes, and Posts additionally purges its index — a deliberate behaviour change, previously only handled on unpublish.

`revalidatePath` is effectively inert in dev, so this only surfaces on a deployed environment. To check it on a preview deploy: publish a post, rename its slug, and confirm the old URL 404s rather than serving a stale render.
