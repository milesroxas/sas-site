# Turning a build record into a visual article

The journal preserves what happened. The article chooses what a reader needs to understand. A true sentence, a short reading time and a visual in every section do not establish a coherent story.

The first published lab-journal test exposed that gap. Its shortened version passed the existing checks but gave session capture, model calibration, voice rules and heading mechanics similar weight. The reader had to supply the connections. Use this contract when drafting or revising any journal write-up.

## Decide the story before the layout

Write a short editorial plan beside the private digest before saving copy:

1. **Reader and question.** Who is this for, what do they already know, and what specific question will the piece answer?
2. **Throughline.** One sentence connecting the original problem, the consequential decisions and what changed. Do not manufacture a breakthrough or failure to fit an arc.
3. **Evidence.** Select the few moments that change the answer. Name the journal entry, measurement, prompt or commit for each. Distinguish a measured result from the author's interpretation.
4. **Reading order.** Give each proposed section a job, the evidence it carries, and the reason it follows the previous section. If adjacent sections can swap without changing the argument, check whether they are merely an inventory.
5. **Ending.** Answer the opening question with what the work established, its limits and a useful implication. Do not close with a list of unfinished admin chores.

The six CMS story fields classify reusable source material. They do not dictate the article's order or require six sections. A digest category is not a heading. Chronology is useful when one event changes the next decision, not as a reason to include every event.

## Write the connections, keep the visuals

Every section still carries a useful visual. Choose the story first, then the figure that makes its evidence or mechanism easier to understand.

- Keep paragraphs short, usually two to four sentences. A beat can hold two short paragraphs when a decision needs context and consequence. Do not compress it into a cryptic slogan to hit a length target.
- Prose carries the problem, the reason for a choice, what happened and why that changes the next question. Figures carry sequences, structures, comparisons, screenshots and detailed numbers.
- Introduce a tool by its role before expecting the reader to know its name. Prefer the project title to an internal CMS id.
- Place the visual directly after the passage that gives a reason to inspect it. A chart needs a source, timeframe and a bounded interpretation. Historical snapshots must say when they were captured.
- A section with several figures needs a short prose bridge when the subject changes. A section with several beats needs a visual before the prose becomes a wall. The reading proof flags runs over 250 words for review; this is a signal, not a quality score.
- Do not explain every arrow in prose, or move the only explanation of a decision into a diagram. The story must remain understandable when someone skims the technical figures.
- Do not add a decorative diagram to satisfy the visual rule. Cut an incidental topic, combine related beats, or find evidence that helps the reader.
- Give each claim one main home. The hero introduces the problem, the opening gives context, the ending develops the implication. They should not repeat the same abstract thesis.

The house voice still applies: first person for the bylined author, agents credited for their work, concrete details, varied sentences and restrained conclusions. Do not invent what the author felt, knew or intended. Present new editorial interpretation as a takeaway, not a historical decision.

## Review the assembled article

Run the existing verify command with both project and page ids. It writes two distinct proofs:

- **verify.md** checks page rules, sentence evidence and voice.
- **narrative.md** resolves canonical beats in the page's actual reading order, including local overrides and the current beat-heading decisions. It marks visual breaks, lists section handoffs and flags long prose runs. Figure text alternatives are review evidence, not visible body copy. This is not a browser preview.

For a local-only pass, add `--code-only` to the verify command. This still reads the requested documents from SAS CMS but makes no TypeSafe requests; it reports unjudged sentences and identifies any reused cached judgments. Do not describe that run as a completed model review.

Read narrative.md from beginning to end before returning the draft. Then inspect the preview. A numerical pass cannot complete this editorial step.

Record the following in the writer's report, tied to the proof's draft fingerprint:

- The question the opening establishes and the answer the ending earns.
- Each section's distinct job and the connection to the next section. Name the actual ideas, not “flows well.”
- Any repeated claim, missing prerequisite, unexplained term or abrupt transition found, and what changed.
- Each visual's job, any long prose run retained and why, and whether the narrative still reads when the figures are skimmed.
- Material left out and why, remaining factual uncertainty, and any unverified preview widths.

If the copy or composition changes, regenerate the proof and revisit affected handoffs. An agent can perform this review itself; this is not an extra permission checkpoint. Publishing still follows the existing CMS authoring rules.

## Regression example: the lab journal

The useful progression is: why preserve the decisions, how to attach them to the right work, how a writer chooses and checks evidence, how that evidence becomes readable copy, and what the first published test revealed about editorial judgment.

Heading mechanics and voice calibration support that progression. They do not need the same prominence as the original problem. The ending should explain what to do differently on the next article, without implying the revised workflow has already proven successful across future projects.
