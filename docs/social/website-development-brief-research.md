# Editorial research for the development brief

Reviewed September 10, 2026. Companion to the [revised outline](website-development-brief-outline.md).

## Where the first outline missed the voice

The [Suits & Sandals editorial guide](editorial/editorial-guide.md#voice-and-tone) calls for composed, human, specific writing with short, controlled paragraphs. It explicitly rejects replacing a useful insight with a broad marketing statement.

The first outline led with abstractions: “creative ambition,” “a foundation for growth,” and “make creative exploration repeatable.” It explained what the work was meant to demonstrate before showing the work. Repeated benefit statements and numbered lessons made it read like an internal project summary.

The revision leads with the original, modest brief, uses first-person accounts of specific decisions, and gives the business implications room to emerge. The guide’s voice rules apply here. Its service-page conversion structure is not the right format for this requested development article.

## The origin of the pivot

Miles’s firsthand context establishes the project’s starting point: move off Webflow with a simple CMS. A headless content hub was not the original objective. Working in Payload and having more control outside Webflow prompted the idea of addressing a decade-old organizational problem.

Content and assets were scattered and hard to find. Proposals took too long, marketing efforts were constrained by inaccessible material, and team members without design expertise felt limited by the assets available to them. Centralizing that material was work the agency had never gotten around to doing.

This changes the narrative hierarchy. The main pivot is recognizing that a website migration could provide a starting point for that unresolved problem. Separating case-study content from website presentation is the architectural response that follows. The July PRD amendment documents that later decision; it should not be presented as the project's initial ambition.

## What the Codrops references contribute

These are observations from three contributor articles, not a claim that Codrops has one uniform house style. The useful common pattern is a personal account supported by visible experiments and selective technical explanation.

| Reference | Structure and voice observed | Application to this brief |
| --- | --- | --- |
| [Aurelien Vigne: Behind the Curtain](https://tympanus.net/codrops/2025/05/20/behind-the-curtain-building-aurels-grand-theater-from-design-to-code/) | Introduces the experience, then describes an early prototype, discarded visual directions, and the practical difficulty of connecting immersive exploration with readable case studies. | Establish the actual starting point and show how the direction developed. Avoid making the finished system sound predetermined. |
| [Roman Jean-Elie: Letting the Creative Process Shape a WebGL Portfolio](https://tympanus.net/codrops/2025/11/27/letting-the-creative-process-shape-a-webgl-portfolio/) | Organizes development around evolving experiments. A specific effect leads into its mechanism, a performance problem, and a revised implementation. Videos and code make the reasoning inspectable. | Let discoveries during the build determine the story's progression. Pair the content model and menu with visuals that make each tangible. |
| [Max Milkin: Two Portfolios, One Process](https://tympanus.net/codrops/2025/12/02/two-portfolios-one-process-where-design-motion-and-code-come-together/) | Connects design intent to named interactions. The second portfolio’s loader account explains an initial SVG approach and a switch to PixiJS after experiments exposed performance limitations. | Tie tools to the decisions they enabled. Describe the media delivery change through its constraint and measured effect. |

Borrow the progression, visual pacing, and candor. Keep Suits & Sandals’ restraint: avoid the more exuberant metaphors, repeated contrast formulas, and dramatic conclusions found in parts of these articles. Use original language throughout.

## Editorial decisions

- **Lead with the emerging idea.** A simple Webflow migration revealed an opportunity to organize years of scattered content. Explain the practical problem before the content architecture.
- **Keep the architectural response concrete.** Selecting a passage beside an image shows how content can stay independent of a particular layout. Connect that reuse to proposals, marketing, and access for the wider team.
- **Make creativity visible.** Keep the menu and browser playgrounds as a supporting episode. Two suggested visuals are enough for a brief article.
- **Demonstrate best practice through actions.** Shared presets, reduced-motion fallbacks, and measured loading changes carry more substance than describing the build as “best practice.”
- **Hold secondary engineering episodes for a longer version.** The menu layering fix (`39feeb8`) and production migration safeguards (`7b89d1f`, `ce085c0`) remain useful supporting evidence. The short version gives that space to the agency problem and how the content hub emerged.
- **Return to the initial problem at the end.** The site and content hub shipped. Organizing the historical archive and using it across agency workflows remain distinct from delivering the software. Inquiry management is real but secondary to this narrative.

## Evidence boundaries

Suggested first-person copy draws on both repository evidence and Miles's account. His context supports the original intent, the discovery during development, and the agency's longstanding difficulties. It does not establish that all historical content has been centralized, proposals are now faster, marketing output has increased, or colleagues can independently produce every asset they need. The article should not invent a specific reason for leaving Webflow.

The performance figure is a preview lab transfer comparison, not a speed improvement or a field result. Proposals and pitch decks are intended uses of the content model, not shipped automation. The shared grid rollout was partial, so the article should not claim every layout uses it.
