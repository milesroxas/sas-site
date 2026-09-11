# It started with leaving Webflow

*A simple CMS migration opened up a way to organize a decade of agency content.*

Outline for a 400–500-word first-person article. Suggested copy establishes the voice; the directions identify what to develop. Use “I” for development decisions and “we” for the agency. [Research and editorial rationale](website-development-brief-research.md).

## A smaller brief

“I set out to move the Suits & Sandals website off Webflow. The plan was a simple CMS. As I started working with Payload, I saw an opportunity to address something we’d been putting off for years.”

Keep the opening modest. The broader content system was an idea that emerged during development. The freedom to shape the CMS outside Webflow made it possible to reconsider what it could do for the agency.

## We had the work. Finding it was the problem.

“Over a decade, our content and assets had become scattered. Proposals took too long to assemble. Marketing was difficult to sustain when the material was so hard to find. Team members without design expertise felt limited by what they could access and use.”

Give this problem room before introducing the solution. The agency already had years of work to draw on. Organizing it had remained unfinished, and the website project offered a practical place to start.

## Giving the content a home

“I began building a central source of truth for our project facts, case-study narratives, and approved assets. That changed the content model. A case study needed to exist independently of the page that displayed it.”

Explain the next decision through one example: an editor can select a passage to sit beside an image without copying the text into the page. The underlying story stays in one place while its presentation can change.

Connect that structure to the original problem: accessible, reusable material for proposals, marketing, and colleagues who need to put the agency’s work to use. Those are the intended uses; avoid implying the entire archive has been organized or those workflows have already been automated.

*Suggested visual: one case-study record beside the website composition that uses it.*

## Room to experiment

“Alongside the content work, I built browser playgrounds for refraction, text reveals, and transitions. I could adjust an effect, replay it, and carry the settings into the site. Shared presets gave those experiments a reusable form.”

Show one interaction: the current page contracts into the menu’s preview window, which can expand into the next page’s hero. Briefly connect shared layout rules, Storybook, and reduced-motion fallbacks to keeping that creative work consistent and usable.

*Suggested visual: a short recording of the menu opening and landing on a case study.*

## Making the media manageable

“The video-heavy pages brought another constraint. I moved media to Cloudflare R2 to address delivery costs, then changed when inline videos load. They start loading as the reader approaches, while hero posters receive priority.”

Use one result: Vault’s desktop page transfer fell from 23.3 MB to 4.2 MB in preview lab tests, about 82% less data. Mobile hero loading remained a separate issue. This keeps the technical detail tied to a real tradeoff and a measured improvement.

## What shipped

“We replaced the Webflow site on September 9. The new site also gave us a working content hub: a place to organize our stories and assets independently of their website layouts. The next step is putting more of our existing material into that structure.”

Close on the new capability and the work it makes possible. The website supplied a starting point for an agency problem that had been waiting much longer.

## Source notes

- **Original intent and agency problem:** Miles’s firsthand context in this conversation: a simple Webflow migration, the idea emerging through Payload, scattered material, slow proposals, constrained marketing, and limited access for colleagues without design expertise.
- **Content model:** `f0b8230`, `23cdf8f`; [PRD amendments](prds/content-hub.md). The PRD records a later architectural decision, not the project’s original ambition.
- **Creative development:** `d22b852`, `e32d51c`, `39feeb8`; [effects](immersive-effects.md), [animations](animations.md).
- **Media and measurement:** `7e97a5b`, `d76f99c`; [preview comparison](perf/after-video-gating/notes.md).
- **Launch:** `a6a483f`; [cutover record](perf/prod-www-video-gating/notes.md).
