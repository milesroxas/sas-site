# Animation plans

Written by the `improve-animations` advisor. Each plan is self-contained:
executable by any agent with zero conversation context.

| # | Title | Severity | Status |
| --- | --- | --- | --- |
| [001](001-audience-tabs-swap-cascade-tempo.md) | Run the AudienceTabs swap-in cascade at the swap time scale | MEDIUM | DONE |
| [002](002-chat-wipe-window-and-origin.md) | Size the chat wipe to the docked window and rise it from the composer | HIGH | DONE (verified in code at de5bb14) |
| [003](003-chat-swap-shared-timing.md) | Give the chat swap one timing source and overlap its content stage | MEDIUM | DONE (verified at de5bb14; the overlap it introduced is what 008 reverses) |
| [004](004-mobile-chat-panel-coincidence.md) | Keep the mobile transcript panel inside the docked window until the handoff | HIGH (mobile) | DONE (verified in code at de5bb14) |
| [005](005-chat-press-affordance-polish.md) | Cross-fade the Ask composer's send affordance | LOW | DONE (verified in code at de5bb14) |
| [006](006-card-drag-intent.md) | Decide card navigation by movement, not by elapsed time | HIGH | DONE |
| [007](007-post-rail-bleed-and-edge-fade.md) | Bleed the post rail to the screen edge and fade the edge it clips | MEDIUM | DONE |
| [008](008-chat-content-arrives-after-handoff.md) | Let the Ask transcript's content arrive after the handoff | HIGH | DONE (frame-verified 2026-09-09; real-device feel-check pending) |
| [009](009-cold-load-chrome-pin.md) | Paint the fixed bars on the hero band's palette before hydration | HIGH (light theme) | DONE on branch `worktree-agent-a44361c3bdc46f548` (3b172c9); in-app frame check pending merge |
| [010](010-home-hero-cold-load-intro.md) | Give the homepage a CSS-driven cold-load intro and stop re-hiding the hero at hydration | HIGH | DONE on branch `worktree-agent-a44361c3bdc46f548` (f11e657); Storybook frame-verified 2026-09-09; in-app checks pending merge |

## Execution order

001 to 008 have landed. 008 was executed and frame-verified on 2026-09-09 (Storybook `Features/TakeoverMenu`, desktop and phone); only the real-device feel-check remains.

009 and 010 (added 2026-09-09) are the homepage cold-load work. Run **009 first, then 010**:

- **009** is small and independent: a `useHydrated` hook, `data-chrome-live` on
  `HeaderBar` / `FooterBar`, a `pinsChromeAtLoad` prop on `HeroBand`, one
  selector added to the dark token block in `globals.css` plus a
  transparent-plate rule, and the home hero opting in. It removes the header
  and footer plate fade at hydration.
- **010** builds on 009's `HeroBand` prop and assumes the plate is already
  right: it adds the Page intro CSS system to `globals.css`, `intro` phases
  and a settle context to `HeroBand`, replaces the home hero's `ScrollReveal`
  with `data-intro` markers and a cover, gates the WebGL lens on the settle,
  and adds the `Heroes/Home` ColdIntro story. Both plans touch
  `src/heros/HeroBand.tsx`, `src/Home/hero/index.tsx`, `globals.css` and
  `docs/animations.md`; 010's excerpts show the post-009 state.
- Neither plan touches `view-transition.css`, the takeover menu or the hero
  handoff, where uncommitted work was in flight when they were written.
- Both were executed on 2026-09-09 in the worktree
  `.claude/worktrees/agent-a44361c3bdc46f548` (branch
  `worktree-agent-a44361c3bdc46f548`, two commits on top of `ea73161`). The
  branch fast-forwards onto `main`; commit or park the in-flight WIP first
  because both touch `docs/animations.md`. After merging, run plan 010's
  dev-server sampler and its app-level checklist (warm mount via the menu
  and via Back, reduced motion, throttled profile).

- **008** touches only the chat-swap staging constants in
  `src/Header/Menu/motion.ts`, the two content class maps in
  `src/features/ask/MenuAsk.tsx`, one comment in `src/Header/Menu/index.tsx`
  and one sentence in `docs/animations.md`. It builds on the timing source
  003 created and keeps 002's cover geometry and 004's growth beat; it moves
  the content stage from under the cover to the handoff frame, where it can
  be seen.
- The 002 to 005 statuses were reconciled against the code at `de5bb14`
  (cover sized to the crop and rising from the composer; `CHAT_STAGE_*` in
  `motion.ts`; `expanded` timer on the staging beat; submit-button
  cross-fade in `SubmitButton.tsx`). Their `Status` lines inside the files
  still read TODO; treat this table as authoritative.
