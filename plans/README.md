# Animation plans

Written by the `improve-animations` advisor. Each plan is self-contained —
executable by any agent with zero conversation context.

| # | Title | Severity | Status |
| --- | --- | --- | --- |
| [001](001-audience-tabs-swap-cascade-tempo.md) | Run the AudienceTabs swap-in cascade at the swap time scale | MEDIUM | DONE |
| [002](002-chat-wipe-window-and-origin.md) | Size the chat wipe to the docked window and rise it from the composer | HIGH | TODO |
| [003](003-chat-swap-shared-timing.md) | Give the chat swap one timing source and overlap its content stage | MEDIUM | TODO |
| [004](004-mobile-chat-panel-coincidence.md) | Keep the mobile transcript panel inside the docked window until the handoff | HIGH (mobile) | TODO |
| [005](005-chat-press-affordance-polish.md) | Cross-fade the Ask composer's send affordance | LOW | TODO |
| [006](006-card-drag-intent.md) | Decide card navigation by movement, not by elapsed time | HIGH | DONE |
| [007](007-post-rail-bleed-and-edge-fade.md) | Bleed the post rail to the screen edge and fade the edge it clips | MEDIUM | DONE |

## Execution order

002 → 003 → 004 are one chain and must run in that order; 005 is independent and
can run at any point. 006 and 007 are a second, unrelated chain: both touch the
related-posts rail, and 006 must land first.

- **002** is the foundation. It changes the cover's geometry and flips the wipe
  to rise from the composer's edge. 004 depends on that direction: the growth it
  introduces is only colour-continuous because the cover paints the window's
  lower edge from the first frame.
- **003** moves all chat-swap timing into `src/Header/Menu/motion.ts` and retunes
  the content stage delay. It touches the same const block 002 reworded, so it
  must follow 002 and is written to move whatever wording it finds there.
- **004** consumes `CHAT_STAGE_DELAY_MS`, which 003 creates.
- **005** touches only the submit button in `MenuAsk.tsx` — no overlap with the
  others.

006 → 007 came out of an audit of the related-posts rail on a post entry
(`/posts/[slug]`), prompted by drags on the rail opening posts.

- **006** is the correctness fix and the wider one: it changes how *every* `Card`
  on the site decides a click, from an elapsed-time test to a pointer-travel
  test, and releases the card's press once a drag commits. It touches
  `src/utilities/useClickableCard.ts` and the `pressable` utility.
- **007** is geometry and affordance: the rail starts on the page column and
  runs off the screen, with a mask that fades whichever edge still has cards
  behind it. It touches `PostRail.client.tsx`, adds two utilities to
  `globals.css` and one hook, and does not touch anything 006 does.
- 006 first because 007's feel-checks are drags, and drags currently navigate.

Both shipped at f7f4cf7 + working tree. Each plan's **As built** section records
where the implementation departed from the plan and why.

Findings raised in the rail audit and **not** planned, so they are not
re-discovered as new: the `drag` cursor variant labelling link cards `DRAG`
(`src/features/cursor/variants.ts:153`), and the leaked `reInit` listener in the
shadcn carousel primitive (`src/components/ui/carousel.tsx:90–100` registers it,
the cleanup only removes `select`) — upstream registry code, harmless while
`onSelect` and `api` stay stable.

002–005 came out of an audit of the takeover menu's Ask surface: what happens
between pressing send in the pill composer and the transcript being on screen.
002 and 004 are portrait/mobile defects derived from the dock geometry math, so
both carry a required device feel-check rather than an assertion that the values
are right.

Findings raised in that audit and **not** planned, so they are not re-discovered
as new: `power1.in` on the chat unwipe (`CHAT_UNWIPE_EASE`), `ease-in` on
`panelContent.closed` (runs fully occluded), and the composer pill's
`width` + bare `ease-in-out` focus-grow in `src/components/ui/input-group.tsx`.
