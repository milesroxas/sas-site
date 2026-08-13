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

Assets → Asset Libraries. **One library per project** — not per service, not per case study. Folders inside the library are how you split research, process, and comps.

#### Fill the library form

Save the Client and Project first so they appear in the relationship pickers.

| Field | Required | What to put |
| --- | --- | --- |
| **Name** | Yes | `{Client} {engagement}`. Same idea as the project, short enough to scan in a list. Do not call it “Asset Library” or repeat the word “vault.” Example: `Vault Brand and Website` (matches AdaCore’s `Adacore Website Redesign`). |
| **Organization** | Yes | The Client this engagement belongs to. Pick the existing record — do not create a duplicate with the `+`. Example: `Vault Workforce Screening`. |
| **Project** | Yes | The Project from step 2. Same rule: pick, don’t recreate. Example: `Vault Workforce Screening Brand and Website`. |
| **Root Folder** | No | Leave empty on first save. The system creates a Media folder with the library’s name and wires it here. Do not pick another project’s folder. After save, open that folder in Assets → Media (Browse by Folder) and add **subfolders** — not more libraries. |
| **Library Status** | Yes | `active` while you are using it (the default). Set `archived` only when the vault should drop out of the public API. Archiving does not delete files. |
| **Description** | No | One or two sentences: whose files, from which engagement. This can appear on the public API for active libraries, so keep it factual and non-confidential. Example: `Source files for the Vault Workforce Screening brand and website engagement.` |
| **Usage Notes** | No | Internal only — never public. The folder map and any approval caveats. Write it so the next editor knows where to put a file. |
| **Assets** | — | Appears after save. Create/upload from here so new files inherit this library. The create drawer may briefly say **No Folder**; the library root is applied before save. Pick a subfolder in the header if it shouldn’t sit at the root. Don’t upload on the global Media list with no folder — save will fail. |
| **Case Studies** | — | Read-only. Studies that have attached this library. You link the other direction: Case Study Content → Asset Libraries tab. |

**Usage Notes** example for a brand + website project:

```
Folders:
- Research — moodboards, concept designs, competitive and art-direction references. Purpose: research or strategy.
- Process — wires, explorations, in-progress work. Purpose: process or wireframe.
- Mockups — website comps, brand applications, device mockups of the finished work. Purpose: interface, design-system, result, or overview.

Upload into the matching folder. A Work Page can only publish files that are public-approved and in this library.
```

Skip a folder you have no files for. Don’t create a second library named “Brand” or “Website.”

**Never leave a file unfiled.** Saving with no folder is rejected. If the Asset Library is set, the file is filed in that library’s root unless you pick a subfolder.

Preferred upload path:

1. Assets → Media → Browse by Folder → open the library root (`Vault Brand and Website`).
2. Create subfolders (`Research`, `Process`, `Mockups` / `Website`) if they don’t exist.
3. Open the subfolder you want, then create the file **from inside it**.

Creating from the library’s Assets list files the header chip to that library’s root (not **No Folder**). Click the chip and pick a subfolder before save if it shouldn’t sit at the root. Client and project fill in from the library when empty. A file cannot save unfiled, and it cannot sit in another library’s folder while attached to this one.

Lab and site-only images still need a folder (make a `Lab` or `Website` folder and upload from there). They do not need an Asset Library.

#### Then upload media

Every file needs:

| Field | Rule |
| --- | --- |
| **Usage status** | `internal` — working file, not in the public API. `client-review` — awaiting sign-off. `public-approved` — the only status a Work Page can publish. |
| **Alt text** | Required before a file can be `public-approved`. |
| **Approved channels** | Include website (or check **All channels**) if the site will use it. |
| **Purpose** | What the shot documents (`research`, `process`, `interface`, `result`, …). Not the service line — that’s on the project. |
| **Poster** | Required before a video can be `public-approved` (auto-generated on upload; override if the first frame is wrong). |

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
