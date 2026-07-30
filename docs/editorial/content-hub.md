# Editorial Guide: Content Hub

The Content Hub is the canonical record of client work. What you write here is the source of truth — the website, and any future channel (pitch decks, proposals, email), presents this material without changing it.

**Write facts here, not web copy.** Website-specific phrasing, ordering, and styling belong on a Work Page (see [website.md](website.md)).

## The pieces

| Admin section | What it holds |
| --- | --- |
| Content Hub → **Clients** | The organizations we work with: name, logo, industries, public description |
| Content Hub → **Projects** | The factual engagement record: what we did, when, scope, deliverables |
| Content Hub → **Case Study Content** | The reusable narrative and evidence for a project |
| Content Hub → **Testimonials** | Quotes, each with an approval status |
| Content Hub → **Lab Projects** | The factual record of internal lab work (presented on the site by Lab Pages) |
| Assets → **Asset Libraries** | Per-project groupings of approved media |
| Assets → **Media** | Uploaded files, each with a usage status |
| Taxonomy → **Capabilities / Industries / Platforms / Post Categories** | Shared vocabulary used across the whole system |

## Workflow: documenting an engagement

Work top-down; each step references the previous one.

### 1. Create the Client

Content Hub → Clients. Name, short name, website, logo, industries, and a public description. Use **Internal notes** for anything that must never be public — that field is invisible to the public API.

### 2. Create the Project

Content Hub → Projects. Link it to the Client. The project is the factual record: status, engagement type, dates, capabilities, platforms, scope, deliverables, constraints. It holds no website layout — keep it factual. Projects also have **Internal notes** (never public) and project links, each with its own public/internal visibility.

Capabilities, Industries, and Platforms are picked from the shared Taxonomy vocabularies — if a platform (e.g. Webflow, Shopify) isn't listed yet, add it under Taxonomy → Platforms first, then link it.

### 3. Create an Asset Library and upload media

Assets → Asset Libraries. Create one library per project (link both Project and Client), then upload media into it.

Every media item has a **Usage status**:

| Status | Meaning |
| --- | --- |
| `internal` (default) | Working file; never returned to the public API |
| `client-review` | Awaiting client sign-off; not public |
| `public-approved` | Cleared for public use — the only status the website can publish |

Also set **Approved channels** (website, pitch deck, proposal, email, social), alt text, and credit where relevant.

> **Important:** file URLs on our storage are technically public even when the status is `internal`. Never upload confidential or legally sensitive files.

### 4. Add Testimonials

Content Hub → Testimonials. Link to the Client (and Project where known). Each testimonial has an **Approval status**: `unverified` → `client-review` → `approved-public` (or `internal-only`). Only *published* testimonials marked `approved-public` can ever appear publicly — everything else stays internal automatically.

### 5. Write the Case Study Content

Content Hub → Case Study Content. Link it to the Project. Four tabs:

- **Overview** — title, thesis, the Project link, primary audience, featured capabilities, and three summaries (one-line, short, medium). Summaries are reused everywhere: heroes, cards, search, future channels. Write them to stand alone.
- **Story** — context, challenge, objectives, strategy, approach, key decisions, learnings. Key decisions each need a title and a stable **key** (e.g. `organize-around-user-intent`); once published, don't rename keys — other systems may reference them.
- **Evidence** — outcome summary, qualitative outcomes, metrics, testimonials, approved claims. Metrics are structured (stable key, label, value, unit, direction, timeframe, qualifier, comparison baseline, source) — never write them as pre-formatted sentences. A metric appears publicly only when **Approved for public** is checked, and publishing requires each approved metric to have a label, value, and a source or qualifier. Duplicate keys (on metrics or key decisions) are rejected on every save.
- **Asset Libraries** — attach the project's libraries. The website can only use media from these libraries.

### 6. Publish

Publishing Case Study Content makes it available to consumers (API and Work Pages). Before it will publish, it must have: at least one summary, a challenge, and an outcome summary.

Publishing canonical content does **not** put anything on the website — that happens when a Work Page is published (see [website.md](website.md)).

## What the public can and cannot see

| Public API returns | Never returned publicly |
| --- | --- |
| Published clients, projects, case study content | Drafts of anything |
| Testimonials that are published **and** approved-public | Unverified / internal testimonials |
| Media marked public-approved | Internal or client-review media records |
| Active asset libraries | Archived asset libraries |
| Metrics marked approved-for-public | Unapproved metrics, metric sources |
| Public descriptions and summaries | Internal notes, usage notes, approved claims, testimonial sources |

## Rules to remember

- One Work Page per Case Study — the system enforces it.
- You cannot delete Case Study Content while a Work Page uses it; delete the Work Page first.
- Autosave runs continuously; version history keeps the last 50 versions; publishing can be scheduled. (Applies to drafted content — media, asset libraries, and taxonomy save immediately with no drafts.)
- Capabilities, Industries, and Platforms are shared vocabulary — add new terms deliberately and reuse existing ones. Capabilities and Industries drive related-work matching and site navigation; Platforms record what projects were delivered on.
