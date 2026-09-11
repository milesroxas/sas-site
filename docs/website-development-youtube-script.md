# It started with leaving Webflow

Working script v1. Target: 8–10 minutes. This is a complete spoken draft with modular scenes, suggested footage, and alternate openings for refinement. Production directions are not spoken.

**Runtime estimate:** 1,181 spoken words. At an assumed 130–140 words per minute, plus the 30 seconds of demonstration holds marked below, the draft runs about 8:56–9:35. Scene timings use 135 words per minute, totaling approximately 9:15. Confirm with a read-through; this is a planning estimate, not a required delivery speed.

**Audience assumption:** designers, creative developers, and small agency teams interested in how a project develops beyond its initial brief.

**Format:** Miles on camera, supported by narrated screen recordings. Calm, specific, conversational delivery. Technical details earn their place by explaining a decision the viewer can see.

**Viewer promise:** see how a simple migration revealed a longstanding content problem, how the system took shape, and what had to change to get it live.

## Title and thumbnail direction

**Recommended title:** I Left Webflow and Built an Agency Content Hub

**Thumbnail:** the finished site beside one legible CMS record, with Miles as an optional third element. Short text: “A SIMPLE MIGRATION?” Show the relationship at a glance; avoid an unreadable screenshot collage.

Alternate title for an audience more interested in agency operations: **Our Agency Had 10 Years of Scattered Content**. Pair it with opening B below. These are creative options, not tested winners.

## 1. The project changed | 0:00–0:30

**Spoken**

I set out to move our agency website off Webflow. A simple CMS, a new site, and get it live.

As I started building in Payload, I saw a way to address a problem we’d been putting off for a decade: our content and assets were scattered everywhere.

This is how that migration became a content hub, and what I had to figure out to ship it.

**Picture / sound**

Start speaking on the first frame. Show the finished site, then its linked case-study record within the opening 15 seconds. Let viewers see the destination immediately. A small “Miles / Suits & Sandals” lower third can introduce the speaker without stopping the story.

## 2. We already had the material | 0:30–1:28

**Spoken**

We’ve been running Suits & Sandals for a long time. Over those years, we’ve built up a lot of work, along with the images, project details, and stories that explain it.

Finding that material was difficult.

Proposals took too long to put together. Marketing was hard to sustain when the content we needed was scattered. And team members without design expertise felt limited by the assets they could find and use.

We’d never really gotten around to organizing it all.

That was the background to this project, even though it wasn’t in the brief. I was working on the website. But the material that website needed was also the material we kept needing elsewhere in the business.

Working with Payload gave me an opening to look at those needs together.

**Picture / sound**

Return to camera for the agency context. Use a simple illustrative arrangement of “Project details,” “Images,” “Case studies,” and “Proposal.” Identify it as a conceptual illustration rather than a recording of the old workflow. If real historical examples are available, use one in place of the graphic.

## 3. The idea that changed the build | 1:28–2:53

**Spoken**

Payload gave me control over how the content was structured. As I got further into it, I started seeing possibilities beyond the pages I was migrating.

Could this become the place where we keep the underlying material for our work?

That meant giving clients, projects, case studies, and assets their own records, with relationships between them. A project could connect to its client. Its case study could connect to the story and the approved media.

Then came a more specific decision. The early content-hub plan still put the case-study story and its website layout in the same record. I separated those too.

The story would live in the Content Hub. The website would choose how to present it.

Payload and the public site still run together in one application and one deployment. The separation is in the way the content is organized. I could give the material a life beyond an individual page while keeping the website and its CMS in the same project.

That distinction made the idea useful beyond this rebuild. We could prepare content for reuse without deciding every future layout in advance.

**Picture / sound**

Build a simple diagram as the relationships are named: Client → Project → Case study, with linked assets. Then reveal “Website” as one consumer. Add “Future proposals / marketing” in a visibly different treatment. Hold the completed diagram for 3 seconds without narration.

## 4. What that looks like in practice | 2:53–4:38

**Spoken**

Here’s a case study in the CMS. Its narrative lives here, alongside the project’s decisions, evidence, and related assets.

Now here’s the website page that uses it.

Inside a page block, I can select a section of that narrative, or choose a smaller passage called a Story Beat. Then I can place that passage beside an image and choose the layout.

The page is reading the text from the case study. I don’t have to paste another copy into the block.

For example, a passage explaining a project’s challenge can sit beside process images on the website. That same source passage could later inform a proposal. The proposal would need its own editing and presentation, but there would be an identifiable record to start from and refer back to.

That gives an editor room to change the presentation while keeping the source material together. Approval rules also determine which assets and evidence can appear publicly.

For the agency, this starts to address a very practical need: making our existing work available to the people who need to use it.

The website is the first working use of that structure. Proposals and other marketing materials are opportunities to build on it. Those workflows still need their own work, but the content now has a model that supports them.

**Picture / sound**

Use a local or draft record prepared for recording. Show the narrative, select the same passage in the page composition, and reveal its preview. Crop tightly enough to read the selection. Allow 8 seconds total of narration-free time across those three actions. Use the same passage throughout so the relationship stays obvious.

## 5. Keeping room for the creative work | 4:38–6:04

**Spoken**

Alongside all of this, I was developing the experience of the website itself.

I built browser playgrounds for refraction, text reveals, and transitions. I could change a parameter, replay the effect, and see what happened. Useful settings became shared presets that I could bring into the site.

The menu is a good example. The current page contracts into a preview window. Hovering over a link changes its image. Selecting a page can expand that preview into the destination’s hero.

Getting the layers to cooperate took some adjustment. The menu also has a conversation view. My first transition approach couldn’t cover the preview image because the animated panel sat underneath it. I replaced that transition with a clipped wipe inside the window.

The effect stayed contained in the frame where it belonged.

I also added reduced-motion fallbacks and used Storybook to inspect components on their own. Shared spacing and grid rules gave the page layouts some consistency as the block library grew.

Those tools let me keep experimenting while bringing useful decisions back into the system.

**Picture / sound**

Adjust one playground control, replay it, then show its site treatment. Let the menu sequence play uninterrupted for 6 seconds. Use a simple two-layer illustration to explain the conversation-view issue if historical footage is unavailable; do not stage a fake failure as an original recording. Allow a further 3-second comparison of standard and reduced-motion behavior. Keep music low beneath explanations.

## 6. Video changed the budget | 6:04–7:08

**Spoken**

The amount of video brought its own constraints.

I moved media from Vercel Blob to Cloudflare R2 to address delivery costs. Then I looked at how much the browser was requesting before someone had even scrolled through the page.

Inline videos were loading ahead of when they were needed. I changed that so they start loading as the reader approaches, while hero posters receive priority.

In the preview tests, the Vault case-study page went from about twenty-three megabytes transferred to just over four on desktop. That’s roughly eighty-two percent less data in that measurement.

Mobile hero loading still needed work. This change addressed the unnecessary early downloads, and the measurements helped separate that improvement from the remaining problems.

That same habit of checking the real conditions mattered when it came to deployment.

**Picture / sound**

Show the measured comparison: **23.3 MB → 4.2 MB**, captioned **Desktop preview lab tests · total transfer · September 9, 2026**. Follow with a recording of videos becoming available as the page scrolls. Give the comparison 5 seconds without narration. Keep historical measurements labeled if current page behavior has changed.

## 7. When local checks weren’t enough | 7:08–7:58

**Spoken**

One database change passed local checks and failed against the existing production data.

I’d changed a free-text field into a fixed set of options. Some older records contained values that didn’t fit those options, including an empty string. The migration couldn’t apply the change.

I added a step to normalize the old values before converting them. Then I added checks to catch that pattern in future migrations, along with checks for schema changes that hadn’t made it into a migration.

It was a reminder that the existing content is part of the system too. The fix needed to account for what was already there, and the workflow needed to remember what I’d learned.

**Picture / sound**

Keep the example small: “Project” / empty value → normalized values → allowed options. Show a cropped commit or migration-check excerpt for evidence. Do not read code line by line. Return to camera for the last two sentences.

## 8. What actually shipped | 7:58–9:15

**Spoken**

We replaced the Webflow site on September ninth, twenty twenty-six.

The result is a working website with a content hub behind it. Project stories and approved assets have a place in the system. Website pages can use that material while keeping control over their own layouts.

There’s still work to do. Building the structure doesn’t organize a decade of material by itself. We need to bring more of that history into it and develop how the team uses it for proposals and marketing.

What changed during this project was my understanding of what the CMS could help us do. Working on a specific website gave me a practical way into a problem we’d left unresolved for years.

If you’re rebuilding a site, look at where its content comes from and who else needs it. That’s where the next useful idea might be.

What’s the material your team always struggles to find? I’d be interested to hear about it in the comments.

**Picture / sound**

Return to the same case-study record and page shown at the start. Show “Live: website + content hub” and “Next: organize more material + develop team workflows.” Finish on camera with one invitation. Let the final image breathe for 5 seconds; avoid stacking a sales pitch and subscription request onto the ending.

## Alternate openings

Replace scene 1 with one of these. They are not additional narration.

**B. Lead with the agency problem**

We’ve been running an agency for over a decade, and finding our own work was still a problem. Proposals took too long. Marketing was difficult to sustain. The content existed, but it was scattered. Then a simple move off Webflow gave me a way to start addressing it. Let me show you what changed as I built the new site.

**C. Lead with the working system**

This is a case study in our CMS. This page reads its story directly from that record, so I can change the layout without copying the content. I didn’t set out to build this. I was moving our agency site off Webflow. Working in Payload led me back to a problem we’d been putting off for years.

## Refinement options

| Direction | Keep | Change |
| --- | --- | --- |
| Recommended: discovery during the build | Current balance of agency problem, CMS demonstration, creative work, and delivery | Refine spoken language after a read-through. |
| More creative development | The original brief, pivot, and CMS demonstration | Give the menu/playground sequence more screen time. Condense scene 7 to its final takeaway. |
| More agency operations | The decade-old problem and one-record-to-page example | Replace some motion detail with a specific, firsthand proposal or asset-search anecdote once supplied. |

The most useful next additions are one real example of finding material for a proposal, the moment Payload suggested the broader idea, and one CMS record to use throughout the recording. Add them by replacing general passages, keeping the runtime steady. No invented hours saved, revenue gains, or completed archive migration.

## Production and retention notes

YouTube recommends checking whether the opening 30 seconds match the title and thumbnail, and introducing compelling material earlier when later sections hold viewers better. That informs the immediate result preview and clear opening promise. After publication, examine the intro, dips, and spikes; a spike can reflect confusion as well as interest. Compare with similar-length videos where available. [YouTube: key moments for audience retention](https://support.google.com/youtube/answer/9314415?hl=en).

YouTube also recommends interpreting clicks alongside retention and traffic sources. A title that attracts the wrong expectation can win the click and lose the viewer. Keep the title centered on the migration and content hub, rather than promising a full tutorial or claiming Webflow caused every operational problem. [YouTube: four channel metrics](https://blog.youtube/creator-and-artist-stories/master-these-4-metrics/).

The following are editorial choices for this video, not platform rules or guaranteed retention improvements:

- Each scene answers a question raised by the previous one: what changed, why it mattered, how it works, and what it took to ship.
- Alternate camera, demonstration, and diagram when the explanation changes. Let useful demonstrations run long enough to understand; there is no mandatory cut interval.
- Record clean narration first. Trim repeated setup and uninformative cursor movement. Keep captions accurate and interface text readable on a phone.
- Retain the opening, the content-model demonstration, and the honest launch outcome when shortening. Cut detail from scenes 5 and 7 first. For a longer cut, use a real example or clearer demonstration rather than a longer introduction.
- Judge the first edit with a timed read and actual footage. Retention performance is something to measure after publishing, not a property this draft can certify.

## Fact and source ledger

| Scene | Basis |
| --- | --- |
| 1–3: original brief, agency problem, discovery | Miles’s firsthand context in this conversation. The broader hub emerged during the build; it was not the initial migration brief. |
| 3–4: content model and reusable narrative | `f0b8230`, `23cdf8f`; [architecture](architecture.md), [PRD amendments](prds/content-hub.md), [editorial workflow](editorial/website.md). |
| 5: playgrounds, menu fix, reusable systems | `d22b852`, `39feeb8`, `a06a1ea`, `bfb131f`; [effects](immersive-effects.md), [animations](animations.md). |
| 6: delivery and performance | `7e97a5b`, `d76f99c`; [preview test notes](perf/after-video-gating/notes.md). This is transfer reduction, not an 82% speed increase. |
| 7: migration failure and checks | `7b89d1f`, `ce085c0`; commit messages document production values, the failed conversion, and preventive checks. |
| 8: launch | `a6a483f`; [September 9 production cutover](perf/prod-www-video-gating/notes.md). |

Brand voice and the Codrops reference analysis remain in [the editorial research](website-development-brief-research.md). Reconstructed diagrams should be labeled as illustrations. Use staged or approved records for recordings; the script does not require production edits.
