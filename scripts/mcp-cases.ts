/**
 * The fixed authoring tasks the MCP bench measures, one per kind of document
 * a team member edits over the sas-cms MCP. Each is "change one block of this
 * document": the bench measures what a client has to read to find the block
 * and what it has to send to save the change, with the generated tools and
 * with the block tools. Production ids, read-only: the bench never writes.
 *
 * The same tasks are the ones to run by hand in Codex and Cursor for their
 * context readings, so the three clients are compared on the same work.
 */

export type McpCase = {
  id: string
  /** Collection or global slug, as the block tools take it. */
  collection: string
  /** Document id; omitted for a global. */
  docId?: number
  /** The generated find tool for the document. */
  findTool: string
  /** Which block the task edits: the nth block (from 1) of this type, in document order. */
  target: { blockType: string; nth?: number }
  /** The edit, in words, for a person running the task in a client. */
  task: string
}

export const MCP_CASES: McpCase[] = [
  {
    // One Section holding one 29KB rich text block: the block is the page, so
    // the block tools save nothing on the write. Kept to show that limit.
    id: 'privacy-policy',
    collection: 'pages',
    docId: 8,
    findTool: 'findPages',
    target: { blockType: 'richText' },
    task: 'In the Privacy Policy, reword one paragraph of the policy body without changing its meaning.',
  },
  {
    id: 'about-us',
    collection: 'pages',
    docId: 6,
    findTool: 'findPages',
    target: { blockType: 'content' },
    task: 'On the About Us page, reword the content block.',
  },
  {
    id: 'work-adacore',
    collection: 'work-pages',
    docId: 2,
    findTool: 'findWorkPages',
    target: { blockType: 'featureImageStatement' },
    task: 'On the AdaCore work page, reword the first feature image statement.',
  },
  {
    id: 'lab-shader-studio',
    collection: 'lab-pages',
    docId: 1,
    findTool: 'findLabPages',
    target: { blockType: 'richText' },
    task: 'On the shader studio lab page, add one sentence to the first rich text block.',
  },
  {
    id: 'expertise-web',
    collection: 'expertise-pages',
    docId: 2,
    findTool: 'findExpertisePages',
    target: { blockType: 'richText' },
    task: 'On the Website Strategy expertise page, reword the first rich text block.',
  },
  {
    id: 'home',
    collection: 'home',
    findTool: 'findHome',
    target: { blockType: 'audienceTabs' },
    task: 'On the homepage, reword the copy of one audience tab.',
  },
]

/**
 * Extra cases for `scripts/mcp-locate-eval.ts` only: the instruction names a
 * block the document does not have (the right answer is `none`), or picks a
 * block by ordinal among several of its type. The bench does not run these.
 */
export type LocateCase = Omit<McpCase, 'target'> & { target: McpCase['target'] | 'none' }

export const LOCATE_EXTRA_CASES: LocateCase[] = [
  {
    id: 'work-adacore-none',
    collection: 'work-pages',
    docId: 2,
    findTool: 'findWorkPages',
    target: 'none',
    task: 'On the AdaCore work page, update the prices in the pricing table.',
  },
  {
    id: 'home-none',
    collection: 'home',
    findTool: 'findHome',
    target: 'none',
    task: 'On the homepage, fix the typo in the FAQ about refunds.',
  },
  {
    id: 'lab-shader-studio-second',
    collection: 'lab-pages',
    docId: 1,
    findTool: 'findLabPages',
    target: { blockType: 'richText', nth: 2 },
    task: 'On the shader studio lab page, tighten the second rich text block.',
  },
  {
    id: 'expertise-web-last',
    collection: 'expertise-pages',
    docId: 2,
    findTool: 'findExpertisePages',
    target: { blockType: 'richText', nth: 3 },
    task: 'On the Website Strategy expertise page, reword the third rich text block.',
  },
]
