# Ask + Jev benchmark

Written by `scripts/ask-bench.ts compare`. Numbers are relative: same machine, same database for every label. Each case ran several times; times are medians over the runs of the turn under test (the last turn of a case).

## Captures

| Label | Date | Git sha | Base URL | Judge mode | Answer model | Jev model | Runs |
| --- | --- | --- | --- | --- | --- | --- | --- |
| before | 2026-09-19 17:56 | 7921850 | http://localhost:55010 | off | gpt-5-mini | jev-1.13.0 | 3 |
| shadow | 2026-09-19 18:11 | 7921850 | http://localhost:55010 | shadow | gpt-5-mini | jev-1.13.0 | 3 |
| after | 2026-09-19 18:40 | c9227fa | http://localhost:55010 | on | gpt-5-mini | jev-1.13.0 | 3 |
| after-model | 2026-09-19 18:49 | c9227fa | http://localhost:55010 | on | gpt-5-mini | jev-1.13.0 | 3 |

## Summary

| Metric | before | shadow | after | after-model |
| --- | --- | --- | --- | --- |
| Median time to first output, all turns | 3177 ms | 2950 ms | 3408 ms | 1355 ms |
| Median total time, all turns | 3558 ms | 3174 ms | 3961 ms | 2156 ms |
| Median time to first output, turns that must have words | 3490 ms | 3445 ms | 4655 ms | 1542 ms |
| Median total time, turns that must have words | 3974 ms | 3741 ms | 5320 ms | 2569 ms |
| Median time to first output, card-only turns | 2669 ms | 2581 ms | 365 ms | 382 ms |
| Median total time, card-only turns | 2670 ms | 2582 ms | 365 ms | 382 ms |
| Card accuracy | 52 of 57 | 52 of 57 | 57 of 57 | 57 of 57 |
| Words when expected, none when not | 49 of 57 | 49 of 57 | 56 of 57 | 57 of 57 |
| Expected sources present | 3 of 3 | 3 of 3 | 3 of 3 | 3 of 3 |
| Cases with the same card on every run | 17 of 19 | 18 of 19 | 19 of 19 | 19 of 19 |
| Turns with no writing-model call | 6 of 57 | 6 of 57 | 23 of 57 | 24 of 57 |

## Per case

| Case | Expected | before: first | before: total | before: card | shadow: first | shadow: total | shadow: card | after: first | after: total | after: card | after-model: first | after-model: total | after-model: card |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| start | no card, words | 5261 ms | 5615 ms | 2 of 3 (none/project) | 5783 ms | 6146 ms | 3 of 3 (none) | 5622 ms | 5979 ms | 3 of 3 (none) | 1809 ms | 3463 ms | 3 of 3 (none) |
| clients | no card, words | 3213 ms | 3885 ms | 3 of 3 (none) | 2901 ms | 3303 ms | 3 of 3 (none) | 4655 ms | 5010 ms | 3 of 3 (none) | 1659 ms | 2476 ms | 3 of 3 (none) |
| process | no card, words | 3965 ms | 4633 ms | 3 of 3 (none) | 4101 ms | 4690 ms | 3 of 3 (none) | 4317 ms | 5061 ms | 3 of 3 (none) | 1648 ms | 2979 ms | 3 of 3 (none) |
| cost-general | estimate | 170 ms | 170 ms | 0 of 3 (no_answer) | 190 ms | 190 ms | 0 of 3 (no_answer) | 4949 ms | 5310 ms | 3 of 3 (estimate) | 1530 ms | 2634 ms | 3 of 3 (estimate) |
| cost-own | estimate, no words | 2236 ms | 2237 ms | 3 of 3 (estimate) | 2090 ms | 2090 ms | 3 of 3 (estimate) | 466 ms | 466 ms | 3 of 3 (estimate) | 382 ms | 382 ms | 3 of 3 (estimate) |
| person | person, no words | 2903 ms | 2903 ms | 3 of 3 (person) | 2463 ms | 2463 ms | 3 of 3 (person) | 391 ms | 391 ms | 3 of 3 (person) | 382 ms | 382 ms | 3 of 3 (person) |
| startups | no card, words | 3606 ms | 4119 ms | 3 of 3 (none) | 2772 ms | 3174 ms | 3 of 3 (none) | 3702 ms | 4360 ms | 3 of 3 (none) | 1486 ms | 2518 ms | 3 of 3 (none) |
| webflow | project, words | 3099 ms | 3099 ms | 0 of 3 (project) | 2812 ms | 2813 ms | 0 of 3 (project) | 6752 ms | 7548 ms | 3 of 3 (project) | 1546 ms | 2513 ms | 3 of 3 (project) |
| timeline-own | estimate, no words | 5496 ms | 5496 ms | 3 of 3 (estimate) | 4330 ms | 4330 ms | 3 of 3 (estimate) | 354 ms | 354 ms | 3 of 3 (estimate) | 440 ms | 440 ms | 3 of 3 (estimate) |
| start-date | estimate, no words | 2545 ms | 2546 ms | 3 of 3 (estimate) | 3109 ms | 3109 ms | 3 of 3 (estimate) | 348 ms | 348 ms | 2 of 3 (estimate) | 398 ms | 398 ms | 3 of 3 (estimate) |
| have-project | project, no words | 2204 ms | 2205 ms | 3 of 3 (project) | 2984 ms | 2984 ms | 3 of 3 (project) | 381 ms | 381 ms | 3 of 3 (project) | 387 ms | 387 ms | 3 of 3 (project) |
| build-x | project | 4591 ms | 4591 ms | 3 of 3 (project) | 7919 ms | 7919 ms | 3 of 3 (project) | 6614 ms | 7116 ms | 3 of 3 (project) | 1668 ms | 2849 ms | 3 of 3 (project) |
| person-call | person, no words | 2877 ms | 2878 ms | 3 of 3 (person) | 2667 ms | 2668 ms | 3 of 3 (person) | 364 ms | 364 ms | 3 of 3 (person) | 342 ms | 342 ms | 3 of 3 (person) |
| contact-details | contact_details, no words | 2881 ms | 2881 ms | 3 of 3 (contact_details) | 2761 ms | 2761 ms | 3 of 3 (contact_details) | 17 ms | 17 ms | 3 of 3 (contact_details) | 20 ms | 20 ms | 3 of 3 (contact_details) |
| no-answer | no_answer, no words | 286 ms | 286 ms | 3 of 3 (no_answer) | 250 ms | 250 ms | 3 of 3 (no_answer) | 385 ms | 385 ms | 3 of 3 (no_answer) | 409 ms | 409 ms | 3 of 3 (no_answer) |
| mixed | estimate, words | 5336 ms | 5337 ms | 0 of 3 (estimate) | 5059 ms | 5059 ms | 0 of 3 (estimate) | 6608 ms | 7121 ms | 3 of 3 (estimate) | 1542 ms | 2979 ms | 3 of 3 (estimate) |
| followup-dependent | no card, words | 4819 ms | 5236 ms | 2 of 3 (none/no_answer) | 3668 ms | 3669 ms | 1 of 3 (no_answer/none) | 3690 ms | 3961 ms | 3 of 3 (none) | 1819 ms | 2170 ms | 3 of 3 (none) |
| followup-switch | no card, words | 3490 ms | 3974 ms | 3 of 3 (none) | 3315 ms | 5636 ms | 3 of 3 (none) | 5287 ms | 5851 ms | 3 of 3 (none) | 1524 ms | 2569 ms | 3 of 3 (none) |
| thanks | no card, words | 2886 ms | 3251 ms | 3 of 3 (none) | 3334 ms | 3623 ms | 3 of 3 (none) | 2565 ms | 2875 ms | 3 of 3 (none) | 1158 ms | 1726 ms | 3 of 3 (none) |

## Answers side by side

The first run of each label. Answer quality is a human read: no invented facts, no markdown, no talk of "sources", under 120 words, and a partial answer names a real page path.

### start

> How do we start?

- **before**: We start with a focused discovery: we learn your organisation, brand, audiences, internal team, technology, existing systems and recurring needs. From there we run stakeholder interviews, define audiences and communication objectives, review existing materials and competition, then organise the story (narrative, message hierarchy and content plan) and move into design and execution. [sources: /expertise/embedded-creative-digital-services, /who-we-help/technical-b2b--expert-led-companies, /posts/the-importance-of-storytelling-in-tech-startup-branding, /expertise/sales-marketing-investor-communications]
- **shadow**: We begin by getting to know your organisation: your brand, audiences, internal team, technology, existing systems and recurring needs. For communications work we then establish what the audience needs to act—using stakeholder interviews, audience definition, objectives, material and competitive review—before organising the story, messages, proof points and design into a plan. [sources: /expertise/embedded-creative-digital-services, /who-we-help/technical-b2b--expert-led-companies, /posts/the-importance-of-storytelling-in-tech-startup-branding, /expertise/sales-marketing-investor-communications]
- **after**: We start by getting to know you: your organisation, brand, audiences, internal team, technology, existing systems and recurring needs so we can design work that actually fits. For many projects we follow that with stakeholder interviews, audience definition and a communication brief that clarifies what the audience needs to act on and the evidence they’ll trust.   We don’t publish fixed prices or a one-size project plan online, the next step is described here: /expertise/embedded-creative-digital-services. [sources: /expertise/embedded-creative-digital-services, /who-we-help/technical-b2b--expert-led-companies, /posts/the-importance-of-storytelling-in-tech-startup-branding, /expertise/sales-marketing-investor-communications]
- **after-model**: We start by learning your organisation, brand, audiences, internal team, tech and recurring needs so we understand where you’re coming from and what success looks like.   If you already have history with us, we use existing context; otherwise we run stakeholder interviews, audience definition, communication objectives and reviews to map problems, outcomes and proof points.   If you want the exact first deliverable or timeline we use, we don’t publish that here — see /expertise/embedded-creative-digital-services for our approach and /expertise/sales-marketing-investor-communications for planning steps. [sources: /expertise/embedded-creative-digital-services, /who-we-help/technical-b2b--expert-led-companies, /posts/the-importance-of-storytelling-in-tech-startup-branding, /expertise/sales-marketing-investor-communications]

### clients

> Who have you worked with?

- **before**: We’ve worked with a range of clients from startups to agencies and specialist B2B firms — examples include Gentle Beast, Next Street Financial, ARC Research, Blindcut, and Omnibuild.    If you’d like more case examples or work in a particular industry, tell us which and we’ll share relevant projects. [sources: /expertise/embedded-creative-digital-services, /, /expertise/product-ux-ui-design-systems, /contact/project-inquiry]
- **shadow**: We’ve partnered with a range of clients including Gentle Beast, Next Street Financial, ARC Research, Blindcut, Omnibuild, and a digital marketing agency (quoted anonymously).    You can see these client highlights on our Home page at /. [sources: /expertise/embedded-creative-digital-services, /, /expertise/product-ux-ui-design-systems, /contact/project-inquiry]
- **after**: We’ve worked with companies including Gentle Beast, Next Street Financial, ARC Research, Blindcut, Omnibuild and a leading digital marketing agency, among others (see testimonials on our homepage). We also regularly collaborate with media agencies, development firms, photographers, printers, event fabricators and internal teams. We don’t publish a complete client roster; see / for featured clients and quotes. [sources: /expertise/embedded-creative-digital-services, /, /expertise/sales-marketing-investor-communications, /expertise/product-ux-ui-design-systems]
- **after-model**: We’ve worked with a range of clients across industries; examples on our site include Gentle Beast, Next Street Financial, ARC Research, Blindcut, Omnibuild and several agency and CEO-level clients who praised our collaboration and accountability.    We don’t publish a full client directory; see / for more of the work and client quotes. [sources: /expertise/embedded-creative-digital-services, /, /expertise/sales-marketing-investor-communications, /expertise/product-ux-ui-design-systems]

### process

> What is your process like?

- **before**: We start by learning who the work is for and what you need it to achieve, then turn that understanding into a clear central idea and a structured plan for the audience and action. From there we design the system—language, visuals, interactions—prototype and produce the actual deliverables in the formats they’ll be used in, and provide templates, specs, and implementation support so the work stays consistent and buildable over time. [sources: /expertise/sales-marketing-investor-communications, /expertise/embedded-creative-digital-services, /expertise/product-ux-ui-design-systems, /contact/project-inquiry]
- **shadow**: We start by learning the problem and audience, then turn that insight into a clear argument, a structured information hierarchy, and production-ready outputs you can use.   Depending on the engagement that looks like stakeholder and user interviews, research and audits, journey and task mapping, wireframes and prototypes, visual and motion design, then production: presentation, print, digital, video, templates, and developer-ready files. We also create design systems, asset libraries, QA, and implementation support so the work stays consistent and usable over time. [sources: /expertise/sales-marketing-investor-communications, /expertise/embedded-creative-digital-services, /expertise/product-ux-ui-design-systems, /contact/project-inquiry]
- **after**: We start by learning who the communication or product is for and what action it must drive, then develop a clear central argument and information structure, design the visual and interaction system, and produce the deliverables in the exact formats they’ll be used in—then we support rollout, handoff, and ongoing extension. For product work we add research, prototyping, and engineering handoff; for campaign or event bursts we provide connected creative outputs and ongoing embedded production support. We don’t publish exact timelines or pricing; next step: /contact/project-inquiry. [sources: /expertise/sales-marketing-investor-communications, /expertise/embedded-creative-digital-services, /expertise/product-ux-ui-design-systems, /contact/project-inquiry]
- **after-model**: We start by learning who the work is for, what decision or action it must support, and the specific outcomes you need, then turn that understanding into a clear structure, central argument, and production plan so deliverables are useful in the formats you’ll actually use.  We don’t publish a single step‑by‑step checklist here; see /expertise/sales-marketing-investor-communications, /expertise/embedded-creative-digital-services, and /expertise/product-ux-ui-design-systems for how we approach discovery, modeling, prototyping, design, and production. If you’d like, tell us about your project and we’ll reply within two business days via /contact/project-inquiry. [sources: /expertise/sales-marketing-investor-communications, /expertise/embedded-creative-digital-services, /expertise/product-ux-ui-design-systems, /contact/project-inquiry]

### cost-general

> What does it cost?

- **before**: (no words) [card: no_answer]
- **shadow**: (no words) [card: no_answer]
- **after**: Cost depends on the amount of reserved capacity, disciplines required, level of senior involvement, technical complexity, and expected mix of work. A useful engagement should be structured around realistic recurring demand rather than choosing an arbitrary package, and ongoing relationships are most effective when they last long enough for the agency to develop context and support more than one isolated request. Ongoing clients receive planned access and priority relative to unscheduled ad hoc work, while substantial assignments still require realistic production time. [card: estimate] [sources: /expertise/embedded-creative-digital-services]
- **after-model**: Cost depends on reserved capacity, disciplines needed, seniority level, technical complexity, and expected mix of work. Ongoing fees are structured around realistic recurring demand rather than an arbitrary package, and the initial term, renewal and capacity are defined in the agreement. Every engagement varies, and ongoing clients receive planned access and priority relative to ad hoc work. [card: estimate] [sources: /expertise/embedded-creative-digital-services]

### cost-own

> How much would a new website for my startup cost?

- **before**: (no words) [card: estimate] [sources: /expertise/website-strategy-ux-development, /posts/building-a-brand-that-resonates-the-ultimate-guide-for-tech-startups, /expertise/embedded-creative-digital-services, /who-we-help/saas-digital-products]
- **shadow**: (no words) [card: estimate] [sources: /expertise/website-strategy-ux-development, /posts/building-a-brand-that-resonates-the-ultimate-guide-for-tech-startups, /expertise/embedded-creative-digital-services, /who-we-help/saas-digital-products]
- **after**: (no words) [card: estimate]
- **after-model**: (no words) [card: estimate]

### person

> Can I talk to someone on the team?

- **before**: (no words) [card: person] [sources: /contact, /expertise/product-ux-ui-design-systems, /contact/project-inquiry, /]
- **shadow**: (no words) [card: person] [sources: /contact, /expertise/product-ux-ui-design-systems, /contact/project-inquiry, /]
- **after**: (no words) [card: person]
- **after-model**: (no words) [card: person]

### startups

> Do you work with startups?

- **before**: Yes — we work with startups, especially tech and SaaS companies, helping with brand identity, positioning, marketing websites, and product UX/design systems, or ongoing embedded creative and digital support. For examples and details, see /posts/building-a-brand-that-resonates-the-ultimate-guide-for-tech-startups and /who-we-help/saas-digital-products. [sources: /posts/building-a-brand-that-resonates-the-ultimate-guide-for-tech-startups, /who-we-help/saas-digital-products, /who-we-help/technical-b2b--expert-led-companies, /expertise/embedded-creative-digital-services]
- **shadow**: Yes. We work with tech startups and early-stage product companies to build brand identities, positioning, and digital experiences that help them clarify value and grow. We also support SaaS and platform teams with product UX, design systems, and marketing websites as part of repositioning or growth work. [sources: /posts/building-a-brand-that-resonates-the-ultimate-guide-for-tech-startups, /who-we-help/saas-digital-products, /who-we-help/technical-b2b--expert-led-companies, /expertise/embedded-creative-digital-services]
- **after**: Yes — since 2011 we’ve helped growth-stage businesses and startups clarify positioning, expand brand identities, and bring those brands to life through strategy, design, digital experiences, and creative production. We’re fully remote (since 2019) and work with clients everywhere.  We don’t publish pricing, availability, or engagement process details online; see /about-us for our company overview and next steps. [sources: /posts/building-a-brand-that-resonates-the-ultimate-guide-for-tech-startups, /posts/the-importance-of-storytelling-in-tech-startup-branding, /about-us]
- **after-model**: Yes. Since 2011 we’ve helped growth-stage businesses and startups clarify positioning, expand brand identities, and bring them to life across strategy, design, digital, and creative production.   We don’t publish a full list of services or pricing on the site; see /posts/building-a-brand-that-resonates-the-ultimate-guide-for-tech-startups for the kinds of branding work we do. [sources: /posts/building-a-brand-that-resonates-the-ultimate-guide-for-tech-startups, /posts/the-importance-of-storytelling-in-tech-startup-branding, /about-us]

### webflow

> Can you fix my Webflow site?

- **before**: (no words) [card: project] [sources: /posts/unlocking-webflow-website-potential-a-comprehensive-audit-framework, /expertise/website-strategy-ux-development, /expertise/embedded-creative-digital-services, /works/gentlebeast]
- **shadow**: (no words) [card: project] [sources: /posts/unlocking-webflow-website-potential-a-comprehensive-audit-framework, /expertise/website-strategy-ux-development, /expertise/embedded-creative-digital-services, /works/gentlebeast]
- **after**: We work with Webflow and can support development, quality assurance, and launch within one engagement. We provide Webflow development, CMS enhancements, component development, third‑party integrations, content migration, accessibility improvements, performance optimization, quality assurance, platform upgrades, and technical troubleshooting. We help keep websites useful as the business evolves by adding new pages, campaign and landing pages, and ongoing support across Webflow, WordPress, Craft CMS, headless setups, and Shopify when appropriate. Website strategy work can include audience research, sitemap development, content strategy, user journeys, CMS requirements, and measurement recommendations to inform UX and development. [card: project] [sources: /expertise/website-strategy-ux-development, /expertise/embedded-creative-digital-services]
- **after-model**: We can fix Webflow sites: our team provides Webflow development, CMS and component work, bug fixes, performance and accessibility improvements, integrations, content migration, QA, and technical troubleshooting.    We also support ongoing Webflow development as part of embedded creative and digital services, keeping sites useful as the business and content evolve. [card: project] [sources: /expertise/website-strategy-ux-development, /expertise/embedded-creative-digital-services]

### timeline-own

> How long would it take you to rebrand our company?

- **before**: (no words) [card: estimate] [sources: /who-we-help/growth--repositioning-brands, /expertise/website-strategy-ux-development, /expertise/sales-marketing-investor-communications, /who-we-help/saas-digital-products]
- **shadow**: (no words) [card: estimate] [sources: /who-we-help/growth--repositioning-brands, /expertise/website-strategy-ux-development, /expertise/sales-marketing-investor-communications, /who-we-help/saas-digital-products]
- **after**: (no words) [card: estimate]
- **after-model**: (no words) [card: estimate]

### start-date

> When could you start on our project?

- **before**: (no words) [card: estimate] [sources: /expertise/sales-marketing-investor-communications, /expertise/embedded-creative-digital-services, /contact/project-inquiry, /privacy-policy]
- **shadow**: (no words) [card: estimate] [sources: /expertise/sales-marketing-investor-communications, /expertise/embedded-creative-digital-services, /contact/project-inquiry, /privacy-policy]
- **after**: When we could start depends on request complexity, required team members, current queue, content readiness, and the agreed level of reserved capacity. Ongoing clients receive planned access and priority relative to unscheduled ad hoc work, but substantial assignments still require realistic production time. [card: estimate] [sources: /expertise/embedded-creative-digital-services]
- **after-model**: (no words) [card: estimate]

### have-project

> I have a project I'd like to talk to you about.

- **before**: (no words) [card: project] [sources: /contact/project-inquiry, /privacy-policy, /contact, /expertise/sales-marketing-investor-communications]
- **shadow**: (no words) [card: project] [sources: /contact/project-inquiry, /privacy-policy, /contact, /expertise/sales-marketing-investor-communications]
- **after**: (no words) [card: project]
- **after-model**: (no words) [card: project]

### build-x

> Can you build a mobile app for us?

- **before**: (no words) [card: project] [sources: /expertise/product-ux-ui-design-systems, /expertise/embedded-creative-digital-services, /who-we-help/saas-digital-products, /expertise/website-strategy-ux-development]
- **shadow**: (no words) [card: project] [sources: /expertise/product-ux-ui-design-systems, /expertise/embedded-creative-digital-services, /who-we-help/saas-digital-products, /expertise/website-strategy-ux-development]
- **after**: We focus on product strategy, UX, UI, prototyping, and design-system development for software products. We can collaborate with your internal engineering team or with a specialized development partner responsible for the product’s technical architecture, back end, and implementation. Deliverables can include development-ready Figma files, component and interaction specifications, responsive behavior documentation, prototypes, design tokens, and implementation QA. We also support continued development with UX audits, workflow improvements, product UI design, and design-system coordination. [card: project] [sources: /expertise/product-ux-ui-design-systems, /expertise/embedded-creative-digital-services, /who-we-help/saas-digital-products]
- **after-model**: We focus on product strategy, UX, UI, prototyping, and design-system work and collaborate with your internal engineers or a specialized development partner who handles the app’s technical architecture and build.   We can deliver development-ready Figma files, component specs, interaction documentation, responsive behavior, prototypes, engineering handoff support, and implementation QA to hand decisions to engineering in a buildable form. [card: project] [sources: /expertise/product-ux-ui-design-systems, /expertise/embedded-creative-digital-services, /who-we-help/saas-digital-products]

### person-call

> Can someone call me about this?

- **before**: (no words) [card: person] [sources: /contact, /contact/project-inquiry]
- **shadow**: (no words) [card: person] [sources: /contact, /contact/project-inquiry]
- **after**: (no words) [card: person]
- **after-model**: (no words) [card: person]

### contact-details

> My email is jane@example.com, can you send me more information?

- **before**: (no words) [card: contact_details] [sources: /privacy-policy, /terms-and-conditions, /contact]
- **shadow**: (no words) [card: contact_details] [sources: /privacy-policy, /terms-and-conditions, /contact]
- **after**: (no words) [card: contact_details]
- **after-model**: (no words) [card: contact_details]

### no-answer

> What is the capital of Mongolia?

- **before**: (no words) [card: no_answer]
- **shadow**: (no words) [card: no_answer]
- **after**: (no words) [card: no_answer]
- **after-model**: (no words) [card: no_answer]

### mixed

> How do you work, and what would my project cost?

- **before**: (no words) [card: estimate] [sources: /contact/project-inquiry, /privacy-policy, /expertise/embedded-creative-digital-services, /expertise/sales-marketing-investor-communications]
- **shadow**: (no words) [card: estimate] [sources: /contact/project-inquiry, /privacy-policy, /expertise/embedded-creative-digital-services, /expertise/sales-marketing-investor-communications]
- **after**: We work as embedded creative teams, design retainers, or defined projects, with embedded relationships providing multidisciplinary continuity across strategy, design, development, and creative production. We can operate as an extension of internal marketing, product, engineering, or leadership teams and provide senior creative direction or fill capability gaps. Timing and response depend on complexity, current queue, content readiness, and reserved capacity, with ongoing clients receiving planned access and priority while substantial assignments still require realistic production time. Cost depends on the amount of reserved capacity, disciplines required, level of senior involvement, technical complexity, and expected mix of work. A partner reads project inquiries, you get a straight answer on fit, scope, and a rough range, and responses come within two business days. [card: estimate] [sources: /contact/project-inquiry, /expertise/embedded-creative-digital-services, /expertise/sales-marketing-investor-communications, /expertise/product-ux-ui-design-systems]
- **after-model**: We respond to project inquiries within two business days, a partner reads your brief, and we give a straight answer on fit, scope, and a rough range.   Costs depend on reserved capacity, disciplines required, senior involvement, technical complexity, and expected mix of work; embedded relationships are priced around realistic recurring demand while project fees vary with scope and timeline. Every engagement can be a defined project or an ongoing embedded relationship, and timelines depend on deliverables, content readiness, stakeholder count, and complexity. [card: estimate] [sources: /contact/project-inquiry, /expertise/embedded-creative-digital-services, /expertise/sales-marketing-investor-communications, /expertise/product-ux-ui-design-systems]

### followup-dependent

> Tell me about your work with Interchecks. → What results did it get?

- **before**: We don’t publish measurable results or performance metrics for the Interchecks project. We refreshed Interchecks’ visual identity and website—creating a visual system around the movement of money with full-site UI, custom illustration and motion, interaction prototypes, and a developer-ready Figma style guide; see /works/interchecks. [sources: /works/interchecks, /works/vault-workforce-screening, /, /contact/project-inquiry]
- **shadow**: (no words) [card: no_answer] [sources: /works/interchecks, /works/vault-workforce-screening, /, /contact/project-inquiry]
- **after**: We delivered a refreshed visual identity and complete website design that made Interchecks’ speed, scale, and payout flexibility visible through custom illustration, motion, full-site UI, and a developer-ready Figma style guide.   We don’t publish performance metrics, business outcomes, pricing, or internal team details; for the project overview see /works/interchecks. [sources: /works/interchecks]
- **after-model**: We don’t publish outcome metrics or business results for the Interchecks project. For project timelines, team, or budget details see /works/interchecks. Would you like to know how the visual system was documented for implementation? [sources: /works/interchecks]

### followup-switch

> Tell me about your work with Interchecks. → What is your process like?

- **before**: We work iteratively to turn product decisions into designs engineers can build: we learn the product and users, model flows and states, prototype flows and interactions, design interfaces and components, then systematize patterns into a design system and support engineering through handoff and QA.   We also choose the visual logic before designing interfaces and make systems usable in motion and production through interaction prototypes and a developer-ready Figma style guide. [sources: /works/interchecks, /contact/project-inquiry, /expertise/product-ux-ui-design-systems, /posts/unlocking-webflow-website-potential-a-comprehensive-audit-framework]
- **shadow**: We translate product decisions into buildable designs through an iterative process that balances discovery, prototyping, and engineering handoff. Our approach: Understand — learn the product, users, friction, and constraints; Model — organize users, information, tasks, and states; Prototype — create flows, wireframes, and interactive prototypes; Design — define interface, components, behaviors, and visual hierarchy; Systematize — build a design system of reusable patterns and documentation; Support — hand off development-ready Figma files, run design reviews, QA implementations, and provide ongoing product-design support. [sources: /works/interchecks, /contact/project-inquiry, /expertise/product-ux-ui-design-systems, /posts/unlocking-webflow-website-potential-a-comprehensive-audit-framework]
- **after**: We start by learning what you need and who your audiences are, then find the central idea that will move those audiences. From there we organize the information, design a coherent visual and interaction system, prototype key experiences, and produce the final assets in the formats you’ll actually use. For product work we add user research, journey mapping, build-ready Figma files, and engineering handoff and QA. For ongoing needs we can embed with reserved capacity so the idea and standards carry across campaigns, events, and production.  We don’t publish timelines or pricing details, see /contact/project-inquiry to send a brief. [sources: /expertise/sales-marketing-investor-communications, /expertise/embedded-creative-digital-services, /expertise/product-ux-ui-design-systems, /contact/project-inquiry]
- **after-model**: We start by understanding the product, its users, and the decisions that will make the experience clearer, then translate those findings into models, prototypes, and a design system that engineering can build from.  We don’t publish a single step‑by‑step timeline for every engagement; see /expertise/product-ux-ui-design-systems for our full approach and FAQs. [sources: /expertise/embedded-creative-digital-services, /expertise/sales-marketing-investor-communications, /expertise/product-ux-ui-design-systems, /contact/project-inquiry]

### thanks

> What is your process like? → Thanks, that helps!

- **before**: Glad it helps — happy to answer any specific questions or show examples of similar work. If you have a project in mind, send details through /contact/project-inquiry and a partner will review your brief. [sources: /who-we-help/technical-b2b--expert-led-companies, /contact/project-inquiry, /expertise/sales-marketing-investor-communications, /expertise/embedded-creative-digital-services]
- **shadow**: Glad to hear it — happy to help. Would you like examples of our work for a similar brief, or to talk through how that process would map to your project? [sources: /who-we-help/technical-b2b--expert-led-companies, /contact/project-inquiry, /expertise/sales-marketing-investor-communications, /expertise/embedded-creative-digital-services]
- **after**: Great, glad it was useful. Would you like an example timeline for a particular project type or help mapping that process to your goals and budget?
- **after-model**: Great — glad it was useful. Would you like an outline tailored to a specific project type or size so you can see what the steps and deliverables would look like?

