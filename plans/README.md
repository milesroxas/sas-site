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

## Execution order

All plans have landed. 008 was executed and frame-verified on 2026-09-09 (Storybook `Features/TakeoverMenu`, desktop and phone); only the real-device feel-check remains.

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
