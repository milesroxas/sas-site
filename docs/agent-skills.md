# Agent skills and plugins

Skills and plugins that ship with this repo, so every clone gets the same agent context in Claude Code, Codex, and Cursor.

## How it is wired

| Agent | Reads project skills from | Notes |
|-------|---------------------------|-------|
| Codex | `.agents/skills/` | Native |
| Cursor | `.agents/skills/`, `.claude/skills/` | Native, plus Claude/Codex compatibility dirs. MCP, plugins, and editor setup in [Cursor](#cursor) |
| Claude Code | `.claude/skills/` only | Each entry is a committed symlink into `.agents/skills/` |

`.agents/skills/<name>` is the single copy. `skills-lock.json` records the upstream source and hash of every third-party skill (written by the [`skills` CLI](https://github.com/vercel-labs/skills)).

Plugins are declared in `.claude/settings.json` (`extraKnownMarketplaces` + `enabledPlugins`). When you trust the folder, Claude Code adds the marketplaces and enables the plugins.

## What ships

### Project skills

| Skill | Source | Use for |
|-------|--------|---------|
| `payload` | payloadcms/skills, **edited for this repo** | Collections, fields, hooks, access, Local API, migrations. Defers to `AGENTS.md` |
| `cms-migration` | payloadcms/skills | Importing content from another CMS |
| `creative-webgl-shaders` | Local | Shaders, R3F, TSL, post-processing, spring motion |
| `posthog-analytics` | Local | Consent-gated PostHog setup, adding conversions via `captureServerEvent`, event naming and PII rules, event registry, dashboards. Update its registry when events change |
| `article-authoring` | Local | Drafting long-form pieces over MCP: where a piece goes, Markdown input, chart and diagram specs, reading a validation error, `pnpm cms:upload`. Contracts live in `docs/figures.md` |
| `r3f-best-practices` | emalorenzo/three-agent-skills | R3F render loop, drei, zustand, perf rules |
| `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-react` | greensock/gsap-skills | Tweens, timelines, ScrollTrigger (routed through Lenis, see `docs/animations.md`), `useGSAP` cleanup |
| `vercel-react-view-transitions` | vercel-labs/agent-skills | `<ViewTransition>` work (route template, work image morph) |
| `react-email` | resend/react-email | `src/shared/email` templates |
| `fallow` | fallow-rs/fallow-skills | Dead code, duplication, complexity (`.fallowrc.jsonc`) |

Project docs win over generic skill advice: `docs/animations.md` and the brand animation standard over GSAP defaults, `docs/immersive-effects.md` over R3F examples.

### Plugins

| Plugin | What it adds |
|--------|--------------|
| `pmndrs@pmndrs` | `pmndrs` MCP server (`https://docs.pmnd.rs/api/mcp`): live docs for react-three-fiber, drei, zustand, plus the 167-demo examples gallery. Skills `pmndrs:docs` and `pmndrs:examples` route lookups to it |
| `paper-desktop@paper` | Paper MCP server plus skills `paper-desktop:design-to-code` and `paper-desktop:code-to-design`. The server is local (`http://127.0.0.1:29979/mcp`): install [Paper Desktop](https://paper.design/downloads) and keep it open, or the tools fail to connect |
| `vercel@claude-plugins-official` | Vercel and Next.js skills (functions, caching, env vars, deployments) and the Vercel MCP server |

These are the Claude Code plugins. Cursor gets its own set, see [Cursor](#cursor). Paper also publishes a Codex plugin in [paper-design/agent-plugins](https://github.com/paper-design/agent-plugins).

## Cursor

Everything below is committed, so a clone picks it up once you trust the folder.

| File | What it sets |
|------|--------------|
| `AGENTS.md`, `.cursor/rules/*.mdc` | Always-on and file-scoped rules. Cursor loads only `.mdc` from `.cursor/rules`; the plain `.md` files there are not loaded as rules |
| `.agents/skills/`, `.claude/skills/` | Project skills (table above) |
| `.cursor/mcp.json` | Project MCP servers (below) |
| `.cursor/settings.json` | Project plugins: `vercel`, `paper-desktop`, `figma`, `sentry` |
| `.vscode/settings.json`, `.vscode/extensions.json`, `.editorconfig` | Biome format and fix on save, workspace TypeScript, Tailwind IntelliSense for `cn`/`cva`, recommended extensions |

### MCP servers

| Server | Source | Setup |
|--------|--------|-------|
| `sas-cms` | `.cursor/mcp.json` | Needs your own key, see below |
| `posthog` | `.cursor/mcp.json` | Pinned to project `512227`. Sign in with OAuth on first use |
| `pmndrs` | `.cursor/mcp.json` | None. Same docs server as the Claude plugin |
| `context7` | `.cursor/mcp.json` | None. Library docs lookup |
| `vercel` | `vercel` plugin | Sign in with OAuth on first use |
| `figma` | `figma` plugin | Sign in with OAuth on first use |
| `paper` | `paper-desktop` plugin | Install [Paper Desktop](https://paper.design/downloads) and keep it open |
| `sentry` | `sentry` plugin | Sign in with OAuth on first use |

### First run for a new teammate

1. Open the repo in Cursor and trust the folder.
2. Install the recommended extensions when prompted (or run **Extensions: Show Recommended Extensions**).
3. Confirm the four plugins show as installed in Cursor Settings. If one is missing, install it from the marketplace with project scope. Skip `gsap-skills`: the GSAP skills are already vendored here, so the plugin would load them twice.
4. Get a CMS MCP key: an admin creates one under **System → API Keys** in the Payload admin, linked to your user, with the capabilities you need. Then export it from your shell profile and fully quit and reopen Cursor so it picks up the variable:

   ```sh
   # ~/.zshrc
   export SAS_CMS_MCP_KEY="<your key>"
   ```

5. In the MCP section of Cursor Settings, enable the project servers, and complete OAuth for `posthog`, `vercel`, `figma`, and `sentry`.

Keys stay in your environment, never in `.cursor/mcp.json`. If you had any of these servers in `~/.cursor/mcp.json` before, remove those entries so the project copy is the only one.

Personal Cursor setup (theme, keybindings, user-level skills and plugins) stays in your user settings.

## Personal copies shadow project skills

In Claude Code a personal skill (`~/.claude/skills/<name>`) beats a project skill with the same name. If you installed any of the skills above globally, the repo copy is hidden. That matters most for `payload`, whose repo copy carries this project's rules. Check with `/skills`; remove the personal copy (`pnpm dlx skills remove -g <name>`) if it wins.

## Adding or updating a skill

```sh
# add (project scope, all three agents)
pnpm dlx skills add <owner/repo> -s <skill> -a claude-code -a codex -a cursor -y

# update third-party skills from their sources
pnpm dlx skills update -p
```

Commit `.agents/skills/<name>`, the `.claude/skills/<name>` symlink, and `skills-lock.json` together.

Never re-add or update `payload` from upstream: it would overwrite the repo edits. Merge upstream changes by hand.

Only vendor skills tied to this stack and published under a license that allows it. Course or paid skill packs stay personal installs.

## Optional personal installs

Useful here, but generic or not redistributable, so not committed:

- `emilkowalski/skills`: `animate`, `review-animations`, `improve-animations`, `find-animation-opportunities`
- `anthropics/skills`: `frontend-design`
- `obra/superpowers`: `systematic-debugging`
