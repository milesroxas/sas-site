# Ask + Jev benchmark

Written by `scripts/ask-bench.ts compare`. Numbers are relative: same machine, same database for every label. Each case ran several times; times are medians over the runs of the turn under test (the last turn of a case).

## Captures

| Label | Date | Git sha | Base URL | Judge mode | Answer model | Jev model | Runs |
| --- | --- | --- | --- | --- | --- | --- | --- |
| before | 2026-09-19 17:56 | 7921850 | http://localhost:55010 | off | gpt-5-mini | jev-1.13.0 | 3 |
| shadow | 2026-09-19 18:11 | 7921850 | http://localhost:55010 | shadow | gpt-5-mini | jev-1.13.0 | 3 |
| after | 2026-09-19 18:25 | 7921850 | http://localhost:55010 | on | gpt-5-mini | jev-1.13.0 | 3 |

## Summary

| Metric | before | shadow | after |
| --- | --- | --- | --- |
| Median time to first output, all turns | 3177 ms | 2950 ms | 3199 ms |
| Median total time, all turns | 3558 ms | 3174 ms | 3907 ms |
| Median time to first output, turns that must have words | 3490 ms | 3445 ms | 3795 ms |
| Median total time, turns that must have words | 3974 ms | 3741 ms | 4638 ms |
| Median time to first output, card-only turns | 2669 ms | 2581 ms | 360 ms |
| Median total time, card-only turns | 2670 ms | 2582 ms | 360 ms |
| Card accuracy | 52 of 57 | 52 of 57 | 57 of 57 |
| Words when expected, none when not | 49 of 57 | 49 of 57 | 57 of 57 |
| Expected sources present | 3 of 3 | 3 of 3 | 3 of 3 |
| Cases with the same card on every run | 17 of 19 | 18 of 19 | 19 of 19 |
| Turns with no writing-model call | 6 of 57 | 6 of 57 | 24 of 57 |

## Per case

| Case | Expected | before: first | before: total | before: card | shadow: first | shadow: total | shadow: card | after: first | after: total | after: card |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| start | no card, words | 5261 ms | 5615 ms | 2 of 3 (none/project) | 5783 ms | 6146 ms | 3 of 3 (none) | 5127 ms | 5432 ms | 3 of 3 (none) |
| clients | no card, words | 3213 ms | 3885 ms | 3 of 3 (none) | 2901 ms | 3303 ms | 3 of 3 (none) | 4099 ms | 4863 ms | 3 of 3 (none) |
| process | no card, words | 3965 ms | 4633 ms | 3 of 3 (none) | 4101 ms | 4690 ms | 3 of 3 (none) | 4006 ms | 5534 ms | 3 of 3 (none) |
| cost-general | estimate | 170 ms | 170 ms | 0 of 3 (no_answer) | 190 ms | 190 ms | 0 of 3 (no_answer) | 5269 ms | 5567 ms | 3 of 3 (estimate) |
| cost-own | estimate, no words | 2236 ms | 2237 ms | 3 of 3 (estimate) | 2090 ms | 2090 ms | 3 of 3 (estimate) | 346 ms | 346 ms | 3 of 3 (estimate) |
| person | person, no words | 2903 ms | 2903 ms | 3 of 3 (person) | 2463 ms | 2463 ms | 3 of 3 (person) | 334 ms | 334 ms | 3 of 3 (person) |
| startups | no card, words | 3606 ms | 4119 ms | 3 of 3 (none) | 2772 ms | 3174 ms | 3 of 3 (none) | 3446 ms | 4024 ms | 3 of 3 (none) |
| webflow | project, words | 3099 ms | 3099 ms | 0 of 3 (project) | 2812 ms | 2813 ms | 0 of 3 (project) | 4720 ms | 4960 ms | 3 of 3 (project) |
| timeline-own | estimate, no words | 5496 ms | 5496 ms | 3 of 3 (estimate) | 4330 ms | 4330 ms | 3 of 3 (estimate) | 403 ms | 403 ms | 3 of 3 (estimate) |
| start-date | estimate, no words | 2545 ms | 2546 ms | 3 of 3 (estimate) | 3109 ms | 3109 ms | 3 of 3 (estimate) | 348 ms | 348 ms | 3 of 3 (estimate) |
| have-project | project, no words | 2204 ms | 2205 ms | 3 of 3 (project) | 2984 ms | 2984 ms | 3 of 3 (project) | 374 ms | 374 ms | 3 of 3 (project) |
| build-x | project | 4591 ms | 4591 ms | 3 of 3 (project) | 7919 ms | 7919 ms | 3 of 3 (project) | 3864 ms | 4749 ms | 3 of 3 (project) |
| person-call | person, no words | 2877 ms | 2878 ms | 3 of 3 (person) | 2667 ms | 2668 ms | 3 of 3 (person) | 380 ms | 380 ms | 3 of 3 (person) |
| contact-details | contact_details, no words | 2881 ms | 2881 ms | 3 of 3 (contact_details) | 2761 ms | 2761 ms | 3 of 3 (contact_details) | 18 ms | 18 ms | 3 of 3 (contact_details) |
| no-answer | no_answer, no words | 286 ms | 286 ms | 3 of 3 (no_answer) | 250 ms | 250 ms | 3 of 3 (no_answer) | 497 ms | 497 ms | 3 of 3 (no_answer) |
| mixed | estimate, words | 5336 ms | 5337 ms | 0 of 3 (estimate) | 5059 ms | 5059 ms | 0 of 3 (estimate) | 6907 ms | 7384 ms | 3 of 3 (estimate) |
| followup-dependent | no card, words | 4819 ms | 5236 ms | 2 of 3 (none/no_answer) | 3668 ms | 3669 ms | 1 of 3 (no_answer/none) | 3396 ms | 3907 ms | 3 of 3 (none) |
| followup-switch | no card, words | 3490 ms | 3974 ms | 3 of 3 (none) | 3315 ms | 5636 ms | 3 of 3 (none) | 5374 ms | 5883 ms | 3 of 3 (none) |
| thanks | no card, words | 2886 ms | 3251 ms | 3 of 3 (none) | 3334 ms | 3623 ms | 3 of 3 (none) | 2871 ms | 3368 ms | 3 of 3 (none) |

## Answers side by side

The first run of each label. Answer quality is a human read: no invented facts, no markdown, no talk of "sources", under 120 words, and a partial answer names a real page path.

### start

> How do we start?

- **before**: We start with a focused discovery: we learn your organisation, brand, audiences, internal team, technology, existing systems and recurring needs. From there we run stakeholder interviews, define audiences and communication objectives, review existing materials and competition, then organise the story (narrative, message hierarchy and content plan) and move into design and execution. [sources: /expertise/embedded-creative-digital-services, /who-we-help/technical-b2b--expert-led-companies, /posts/the-importance-of-storytelling-in-tech-startup-branding, /expertise/sales-marketing-investor-communications]
- **shadow**: We begin by getting to know your organisation: your brand, audiences, internal team, technology, existing systems and recurring needs. For communications work we then establish what the audience needs to act—using stakeholder interviews, audience definition, objectives, material and competitive review—before organising the story, messages, proof points and design into a plan. [sources: /expertise/embedded-creative-digital-services, /who-we-help/technical-b2b--expert-led-companies, /posts/the-importance-of-storytelling-in-tech-startup-branding, /expertise/sales-marketing-investor-communications]
- **after**: We start by getting to know you: your organisation, brand, audiences, internal team, technology, existing systems and recurring needs so we can design work that fits. For communications or investor work we also define what the audience needs to act and run stakeholder interviews, audience and competitive reviews, message hierarchies and proof-point planning.    We don’t publish timelines, fees or a sample project plan here, see /expertise/embedded-creative-digital-services for the next step. [sources: /expertise/embedded-creative-digital-services, /who-we-help/technical-b2b--expert-led-companies, /posts/the-importance-of-storytelling-in-tech-startup-branding, /expertise/sales-marketing-investor-communications]

### clients

> Who have you worked with?

- **before**: We’ve worked with a range of clients from startups to agencies and specialist B2B firms — examples include Gentle Beast, Next Street Financial, ARC Research, Blindcut, and Omnibuild.    If you’d like more case examples or work in a particular industry, tell us which and we’ll share relevant projects. [sources: /expertise/embedded-creative-digital-services, /, /expertise/product-ux-ui-design-systems, /contact/project-inquiry]
- **shadow**: We’ve partnered with a range of clients including Gentle Beast, Next Street Financial, ARC Research, Blindcut, Omnibuild, and a digital marketing agency (quoted anonymously).    You can see these client highlights on our Home page at /. [sources: /expertise/embedded-creative-digital-services, /, /expertise/product-ux-ui-design-systems, /contact/project-inquiry]
- **after**: We’ve worked with a range of clients including Gentle Beast (Ben Green), Next Street Financial (Cristina Yoder), ARC Research (Andy Tuck), Blindcut (Erika Hemphill), Omnibuild (Bassam Tarazi), and a CEO of a digital marketing agency, among others.    We don’t publish a complete client roster or every case detail, see our work overview at / for more. [sources: /expertise/embedded-creative-digital-services, /, /expertise/sales-marketing-investor-communications, /expertise/product-ux-ui-design-systems]

### process

> What is your process like?

- **before**: We start by learning who the work is for and what you need it to achieve, then turn that understanding into a clear central idea and a structured plan for the audience and action. From there we design the system—language, visuals, interactions—prototype and produce the actual deliverables in the formats they’ll be used in, and provide templates, specs, and implementation support so the work stays consistent and buildable over time. [sources: /expertise/sales-marketing-investor-communications, /expertise/embedded-creative-digital-services, /expertise/product-ux-ui-design-systems, /contact/project-inquiry]
- **shadow**: We start by learning the problem and audience, then turn that insight into a clear argument, a structured information hierarchy, and production-ready outputs you can use.   Depending on the engagement that looks like stakeholder and user interviews, research and audits, journey and task mapping, wireframes and prototypes, visual and motion design, then production: presentation, print, digital, video, templates, and developer-ready files. We also create design systems, asset libraries, QA, and implementation support so the work stays consistent and usable over time. [sources: /expertise/sales-marketing-investor-communications, /expertise/embedded-creative-digital-services, /expertise/product-ux-ui-design-systems, /contact/project-inquiry]
- **after**: We start by understanding the problem, audience, and desired action; find a single clear argument; model the information and workflows; design a coherent visual and interaction system; then produce deliverables in the formats they’ll actually be used in and support handoff or ongoing embedded work. We also offer production, QA, templates, and ongoing support so the work stays consistent over time. We don’t publish specific timelines, scope fit, or price ranges online: see /contact/project-inquiry to tell us about your project and get a straight answer on fit, scope, and a rough range. [sources: /expertise/sales-marketing-investor-communications, /expertise/embedded-creative-digital-services, /expertise/product-ux-ui-design-systems, /contact/project-inquiry]

### cost-general

> What does it cost?

- **before**: (no words) [card: no_answer]
- **shadow**: (no words) [card: no_answer]
- **after**: Costs vary by reserved capacity, required disciplines, seniority, technical complexity, and the mix of recurring work, so there’s no single price. A useful engagement is structured around realistic recurring demand rather than an arbitrary package. If you want a tailored estimate, tell us the level of ongoing capacity you expect and the types of work and senior roles you’ll need. [card: estimate] [sources: /expertise/embedded-creative-digital-services]

### cost-own

> How much would a new website for my startup cost?

- **before**: (no words) [card: estimate] [sources: /expertise/website-strategy-ux-development, /posts/building-a-brand-that-resonates-the-ultimate-guide-for-tech-startups, /expertise/embedded-creative-digital-services, /who-we-help/saas-digital-products]
- **shadow**: (no words) [card: estimate] [sources: /expertise/website-strategy-ux-development, /posts/building-a-brand-that-resonates-the-ultimate-guide-for-tech-startups, /expertise/embedded-creative-digital-services, /who-we-help/saas-digital-products]
- **after**: (no words) [card: estimate]

### person

> Can I talk to someone on the team?

- **before**: (no words) [card: person] [sources: /contact, /expertise/product-ux-ui-design-systems, /contact/project-inquiry, /]
- **shadow**: (no words) [card: person] [sources: /contact, /expertise/product-ux-ui-design-systems, /contact/project-inquiry, /]
- **after**: (no words) [card: person]

### startups

> Do you work with startups?

- **before**: Yes — we work with startups, especially tech and SaaS companies, helping with brand identity, positioning, marketing websites, and product UX/design systems, or ongoing embedded creative and digital support. For examples and details, see /posts/building-a-brand-that-resonates-the-ultimate-guide-for-tech-startups and /who-we-help/saas-digital-products. [sources: /posts/building-a-brand-that-resonates-the-ultimate-guide-for-tech-startups, /who-we-help/saas-digital-products, /who-we-help/technical-b2b--expert-led-companies, /expertise/embedded-creative-digital-services]
- **shadow**: Yes. We work with tech startups and early-stage product companies to build brand identities, positioning, and digital experiences that help them clarify value and grow. We also support SaaS and platform teams with product UX, design systems, and marketing websites as part of repositioning or growth work. [sources: /posts/building-a-brand-that-resonates-the-ultimate-guide-for-tech-startups, /who-we-help/saas-digital-products, /who-we-help/technical-b2b--expert-led-companies, /expertise/embedded-creative-digital-services]
- **after**: Yes. Since 2011 we’ve helped growth-stage businesses and startups clarify positioning, expand brand identities, and bring those brands to life across strategy, design, digital, and creative production. We also specialise in tech startups, helping simplify technical messaging so your story connects with real people.    We don’t publish pricing, availability, or exact engagement details online; for more on who we are and where we work, see /about-us. [sources: /posts/building-a-brand-that-resonates-the-ultimate-guide-for-tech-startups, /posts/the-importance-of-storytelling-in-tech-startup-branding, /about-us]

### webflow

> Can you fix my Webflow site?

- **before**: (no words) [card: project] [sources: /posts/unlocking-webflow-website-potential-a-comprehensive-audit-framework, /expertise/website-strategy-ux-development, /expertise/embedded-creative-digital-services, /works/gentlebeast]
- **shadow**: (no words) [card: project] [sources: /posts/unlocking-webflow-website-potential-a-comprehensive-audit-framework, /expertise/website-strategy-ux-development, /expertise/embedded-creative-digital-services, /works/gentlebeast]
- **after**: Yes — we can fix Webflow sites. We provide Webflow development and support including bug fixes, component work, performance optimization, accessibility and QA.  If you’d like us to look, tell us what’s broken, what you’ve already tried, and any error messages or links, and we’ll take it from there. [card: project] [sources: /expertise/website-strategy-ux-development, /expertise/embedded-creative-digital-services]

### timeline-own

> How long would it take you to rebrand our company?

- **before**: (no words) [card: estimate] [sources: /who-we-help/growth--repositioning-brands, /expertise/website-strategy-ux-development, /expertise/sales-marketing-investor-communications, /who-we-help/saas-digital-products]
- **shadow**: (no words) [card: estimate] [sources: /who-we-help/growth--repositioning-brands, /expertise/website-strategy-ux-development, /expertise/sales-marketing-investor-communications, /who-we-help/saas-digital-products]
- **after**: (no words) [card: estimate]

### start-date

> When could you start on our project?

- **before**: (no words) [card: estimate] [sources: /expertise/sales-marketing-investor-communications, /expertise/embedded-creative-digital-services, /contact/project-inquiry, /privacy-policy]
- **shadow**: (no words) [card: estimate] [sources: /expertise/sales-marketing-investor-communications, /expertise/embedded-creative-digital-services, /contact/project-inquiry, /privacy-policy]
- **after**: (no words) [card: estimate]

### have-project

> I have a project I'd like to talk to you about.

- **before**: (no words) [card: project] [sources: /contact/project-inquiry, /privacy-policy, /contact, /expertise/sales-marketing-investor-communications]
- **shadow**: (no words) [card: project] [sources: /contact/project-inquiry, /privacy-policy, /contact, /expertise/sales-marketing-investor-communications]
- **after**: (no words) [card: project]

### build-x

> Can you build a mobile app for us?

- **before**: (no words) [card: project] [sources: /expertise/product-ux-ui-design-systems, /expertise/embedded-creative-digital-services, /who-we-help/saas-digital-products, /expertise/website-strategy-ux-development]
- **shadow**: (no words) [card: project] [sources: /expertise/product-ux-ui-design-systems, /expertise/embedded-creative-digital-services, /who-we-help/saas-digital-products, /expertise/website-strategy-ux-development]
- **after**: We don’t typically build full mobile apps end-to-end, but we can design and prepare everything an engineering team needs to build one: product strategy, UX and UI, interactive prototypes, development-ready Figma files, component specs, responsive behavior, state planning, and implementation QA. We’ll collaborate with your internal engineers or a specialized development partner to make the handoff smooth and support the product as it’s built. If you’d like, tell us a bit about the app and timeline and we’ll pass the details to the team. [card: project] [sources: /expertise/product-ux-ui-design-systems, /expertise/embedded-creative-digital-services, /who-we-help/saas-digital-products]

### person-call

> Can someone call me about this?

- **before**: (no words) [card: person] [sources: /contact, /contact/project-inquiry]
- **shadow**: (no words) [card: person] [sources: /contact, /contact/project-inquiry]
- **after**: (no words) [card: person]

### contact-details

> My email is jane@example.com, can you send me more information?

- **before**: (no words) [card: contact_details] [sources: /privacy-policy, /terms-and-conditions, /contact]
- **shadow**: (no words) [card: contact_details] [sources: /privacy-policy, /terms-and-conditions, /contact]
- **after**: (no words) [card: contact_details]

### no-answer

> What is the capital of Mongolia?

- **before**: (no words) [card: no_answer]
- **shadow**: (no words) [card: no_answer]
- **after**: (no words) [card: no_answer]

### mixed

> How do you work, and what would my project cost?

- **before**: (no words) [card: estimate] [sources: /contact/project-inquiry, /privacy-policy, /expertise/embedded-creative-digital-services, /expertise/sales-marketing-investor-communications]
- **shadow**: (no words) [card: estimate] [sources: /contact/project-inquiry, /privacy-policy, /expertise/embedded-creative-digital-services, /expertise/sales-marketing-investor-communications]
- **after**: Tell us about the project and a partner reads your brief: we’ll reply within two business days with a straight answer on fit, scope, and a rough cost range, and if it’s a fit we’ll book 30 minutes to go deeper.   We can work as a one‑off project or as an embedded creative team (strategy, design, UX, web, video, etc.). Pricing depends on reserved capacity, disciplines required, seniority, technical complexity, and expected mix of work, so we provide a realistic range after reviewing your brief or a short call. Send some details or say you’d rather talk and we’ll get back in two business days. [card: estimate] [sources: /contact/project-inquiry, /expertise/embedded-creative-digital-services, /expertise/sales-marketing-investor-communications, /expertise/product-ux-ui-design-systems]

### followup-dependent

> Tell me about your work with Interchecks. → What results did it get?

- **before**: We don’t publish measurable results or performance metrics for the Interchecks project. We refreshed Interchecks’ visual identity and website—creating a visual system around the movement of money with full-site UI, custom illustration and motion, interaction prototypes, and a developer-ready Figma style guide; see /works/interchecks. [sources: /works/interchecks, /works/vault-workforce-screening, /, /contact/project-inquiry]
- **shadow**: (no words) [card: no_answer] [sources: /works/interchecks, /works/vault-workforce-screening, /, /contact/project-inquiry]
- **after**: The work gave Interchecks a refreshed visual identity and a complete website design that makes the platform’s speed, scale, and flexibility visible through custom illustration, motion, and a consistent graphic language. We also delivered interaction prototypes and a Figma style guide so the system can be implemented consistently in motion and production.  We don’t publish specific performance metrics, timeline, or cost; see /works/interchecks for the project writeup and visuals. [sources: /works/interchecks]

### followup-switch

> Tell me about your work with Interchecks. → What is your process like?

- **before**: We work iteratively to turn product decisions into designs engineers can build: we learn the product and users, model flows and states, prototype flows and interactions, design interfaces and components, then systematize patterns into a design system and support engineering through handoff and QA.   We also choose the visual logic before designing interfaces and make systems usable in motion and production through interaction prototypes and a developer-ready Figma style guide. [sources: /works/interchecks, /contact/project-inquiry, /expertise/product-ux-ui-design-systems, /posts/unlocking-webflow-website-potential-a-comprehensive-audit-framework]
- **shadow**: We translate product decisions into buildable designs through an iterative process that balances discovery, prototyping, and engineering handoff. Our approach: Understand — learn the product, users, friction, and constraints; Model — organize users, information, tasks, and states; Prototype — create flows, wireframes, and interactive prototypes; Design — define interface, components, behaviors, and visual hierarchy; Systematize — build a design system of reusable patterns and documentation; Support — hand off development-ready Figma files, run design reviews, QA implementations, and provide ongoing product-design support. [sources: /works/interchecks, /contact/project-inquiry, /expertise/product-ux-ui-design-systems, /posts/unlocking-webflow-website-potential-a-comprehensive-audit-framework]
- **after**: We begin by learning what the work must do for real people and the business, then turn those discoveries into a clear proposition, organized information, and buildable design or production outputs you can use. For product work that means understand, model, prototype, design, systematize, and support; for communications it means define audience and action, find the central argument, structure the story, design the system, produce the materials, and extend with templates and libraries. For ongoing needs we can embed capacity so context compounds over time.  We don’t publish timing, team makeup, or pricing here, see /contact/project-inquiry to start a conversation. [sources: /expertise/embedded-creative-digital-services, /expertise/sales-marketing-investor-communications, /expertise/product-ux-ui-design-systems, /contact/project-inquiry]

### thanks

> What is your process like? → Thanks, that helps!

- **before**: Glad it helps — happy to answer any specific questions or show examples of similar work. If you have a project in mind, send details through /contact/project-inquiry and a partner will review your brief. [sources: /who-we-help/technical-b2b--expert-led-companies, /contact/project-inquiry, /expertise/sales-marketing-investor-communications, /expertise/embedded-creative-digital-services]
- **shadow**: Glad to hear it — happy to help. Would you like examples of our work for a similar brief, or to talk through how that process would map to your project? [sources: /who-we-help/technical-b2b--expert-led-companies, /contact/project-inquiry, /expertise/sales-marketing-investor-communications, /expertise/embedded-creative-digital-services]
- **after**: Glad it helps — would you like an example timeline for a campaign or a product project, or tell us which type of work you’re planning?

