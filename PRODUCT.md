# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audiences for the public site, confirmed 2026-09-20:

- **Prospective clients**: founders and executives, marketing and communications teams, product and digital teams, and sales and investor communications teams at growth-stage businesses, startups, and mission-driven organizations. They arrive with a complex offering and a legibility problem, and are evaluating whether this studio can be trusted with it.
- **Talent and collaborators**: designers and engineers deciding whether they want to work with the studio. Confirmed as a first-class audience for `/lab`.

For the Lab surface specifically, the user's confirmed framing is "talent and collaborators, but also proof for potential clients": the lab has to read as a live workshop to a peer and as evidence of engineering depth to a buyer, without patronizing either.

## Product Purpose

Suits & Sandals is a brand and digital design agency founded in Brooklyn in 2011, fully remote since 2019. It helps complex organizations make sense to the people who matter, bringing clarity, trust, and momentum to nuanced ideas. Work spans brand strategy, messaging, visual identity, web design, product UX/UI, design systems, and creative production.

The website is the studio's primary proof surface. Success is a qualified inquiry (the Contact form and the Ask handoff both write to the Inquiries inbox), and secondarily a reader who leaves believing the studio's strategy, design, and engineering are the same practice.

## Positioning

The studio builds the tooling behind its own work rather than assembling it. The site runs on Payload CMS and Next.js, and the studio wrote the shader Studio plugin, the RAG-backed Ask feature, the MCP authoring server, and the immersive effect system that ships on the site itself. The claim a neighboring agency could not truthfully copy: the experiments visitors see on the site are the same code the studio ships to clients, authored and tuned by the people who write the copy.

## Operating Context

- The public site runs on Next.js App Router with Payload CMS, deployed on Vercel; production is `https://www.suits-sandals.com`.
- Content is authored in the Payload admin and over an MCP server by team agents.
- Content surfaces: Home, Work (case studies), Lab (lab projects and lab pages), Insights (posts), Expertise pages, Who We Help (audience pages), Contact, Ask, plus index globals for each collection.
- `/demo/immersive` is the internal effect bench: a sidebar shell with nine sections (overview, text scramble, refraction hover, dispersion mesh, industry work media, light leak, streak field, scroll gallery, floating cards), each with a live stage and a control panel wired to every uniform, plus a copy-to-source affordance. It is currently `noindex, nofollow`.
- `/demo/transitions` is the sibling bench for route transitions and scroll reveals.

## Capabilities and Constraints

- **Confirmed direction (2026-09-20):** `/demo/immersive` ships public as-is, dev shell and control panels included. Its rawness is the intent: this is the studio's own bench, shown rather than dressed up. Copy rule already set by the user: call it the **Playground**, never "Immersive Lab"; frame it as a look behind the scenes at the team's bench, never as code visitors can take.
- **Lab index scale:** one published lab page and one lab project today; the user expects 5 to 10 deep dives within the year. Any lab index layout must look deliberate at one item and still work at ten.
- Lab content model: a Lab Project holds the narrative (context, challenge, strategy, approach, outcome summary, learnings, each with ordered story beats), `kind` (`tool`, etc.), `status` (`active`, etc.), `capabilities`, `technologies`, and dates. A Lab Page presents one project and owns the page layout. Lab projects have **no author field** today (only Posts do).
- Immersive effects ship poster-first: server HTML carries a real poster image, and WebGL only runs when the slot is hydrated, in view, on a capable device, and inside a document-level GPU budget. Reduced motion, coarse pointers, and software WebGL never get the canvas. Any lab index design must survive its live effect never starting.
- The lab index background is an optional Streak Field chosen on the lab-index global's hero; today that slot is empty and the index renders on plain ground. No cover asset exists on the one lab project, so thumbnails have no image to show yet.
- Design system constraints are recorded in `AGENTS.md`: fluid type-scale tokens, a `Section` spacing contract, an 8-column `BlockGrid`, immersive defaults/presets, and a Storybook story for every new visual UI.

## Brand Commitments

- Name: Suits & Sandals (legal: Suits & Sandals LLC). Founded 2011, Brooklyn; remote since 2019. Offices line reads "Brooklyn, NY / Philadelphia, PA".
- Voice: agency first person plural, plain and specific, no hype. **No em dashes anywhere**, including UI and placeholder copy.
- Typography and color are already committed in `src/app/(frontend)/globals.css` and mirrored into the Paper file's tokens: Geist and Geist Mono, fluid type-scale tokens, a near-neutral palette with one blue primary and an amber brand accent, light and dark themes.
- On-site glyph rule: `→` for links that stay on the site, `↗` for links that leave it.
- Contact response time: within 3 business days.

## Evidence on Hand

- One published lab page: "Building a shader studio in Payload CMS" (`/lab/building-a-shader-studio-in-payload-cms`), backed by the lab project "Payload CMS Shader Plugin" (kind `tool`, status `active`, capability Engineering, technologies Payload CMS, Next.js, React Three Fiber, three.js, GLSL, WebGL2, TypeScript, PostgreSQL). It carries real figures: 8,000 streaks in one draw call, 3,753 lines shipped then 1,545 removed, three tries in ten days, a Studio that lasted 26 hours.
- Nine live effect sections on `/demo/immersive`, each with real parameters and a real control panel.
- Published case studies, insights, expertise and audience pages elsewhere on the site.
- **Absences future work must not fabricate:** no cover asset on the lab project, no author on lab projects, no second lab page, no published article URL for the shader write-up, no client logos or testimonials on the lab surface.

## Product Principles

1. Show the work running, do not describe it. The studio's proof is executable.
2. Raw is allowed when it is true. The bench ships as a bench.
3. Poster-first: every live effect degrades to a real still, and the page must read without motion.
4. Editors, not engineers, own what a page looks like; anything the site can do, the CMS can author.
5. Plain language about complex work. Specifics over adjectives.

## Accessibility & Inclusion

Reduced motion is a first-class path, not a fallback: every immersive effect is gated on it and the site ships a visible motion toggle over index grounds. Keyboard focus is themed rather than defaulted, and the Contents and menu systems are built around focus behavior.
