import type { ChartSpec } from './spec/chart'
import type { DiagramSpec } from './spec/diagram'

/**
 * The acceptance corpus: eight charts and eight diagrams of the kind the
 * Streak Field write-up needs, as specs. Every kind, both orientations, every
 * x type, reference series, annotations, groups, dashed and animated edges,
 * self messages and eras appear at least once, so the stories and tests that
 * run this corpus exercise the whole spec surface.
 *
 * The shapes are real; the numbers are illustrative. Swap in the measured
 * values when the article is authored (docs/figures.md, "Acceptance corpus").
 */

export type CorpusFigure<Spec> = { spec: Spec; textAlternative: string; title: string }

export const CHART_CORPUS: Record<string, CorpusFigure<ChartSpec>> = {
  frameTimeByCount: {
    title: 'Frame time by streak count',
    textAlternative:
      'Frame time stays under the 16.7ms budget up to 12,000 streaks on the instanced path and crosses it near 6,000 on the per-streak path.',
    spec: {
      specVersion: 1,
      kind: 'line',
      x: { key: 'count', label: 'Streaks', type: 'number' },
      y: { label: 'Frame time (ms)' },
      series: [
        { key: 'instanced', label: 'Instanced' },
        { key: 'perStreak', label: 'Per streak' },
        { key: 'budget', label: '60fps budget', role: 'reference' },
      ],
      rows: [
        { count: 1000, instanced: 2.1, perStreak: 3.4, budget: 16.7 },
        { count: 2000, instanced: 2.6, perStreak: 6.1, budget: 16.7 },
        { count: 4000, instanced: 3.8, perStreak: 11.9, budget: 16.7 },
        { count: 6000, instanced: 5.2, perStreak: 17.4, budget: 16.7 },
        { count: 8000, instanced: 7.1, perStreak: 24.8, budget: 16.7 },
        { count: 12000, instanced: 11.6, perStreak: 39.2, budget: 16.7 },
      ],
      annotations: [{ x: 6000, y: 17.4, label: 'Budget crossed' }],
    },
  },
  noiseCost: {
    title: 'Shader cost by noise formula',
    textAlternative:
      'Curl is the most expensive noise formula at about three times the cost of value noise; gradient and fbm sit between them.',
    spec: {
      specVersion: 1,
      kind: 'bar',
      orientation: 'horizontal',
      x: { key: 'noise', type: 'category' },
      y: { label: 'GPU time per frame (ms)' },
      series: [{ key: 'ms', label: 'GPU time' }],
      rows: [
        { noise: 'none', ms: 0.4 },
        { noise: 'value', ms: 0.9 },
        { noise: 'simplex', ms: 1.3 },
        { noise: 'fbm', ms: 2.2 },
        { noise: 'ridged', ms: 2.4 },
        { noise: 'gradient', ms: 2.5 },
        { noise: 'curl', ms: 2.9 },
      ],
    },
  },
  posterWeight: {
    title: 'Poster weight by format',
    textAlternative:
      'WebP posters are roughly a third the weight of PNG at both sizes, which is why the Studio encodes WebP.',
    spec: {
      specVersion: 1,
      kind: 'bar',
      x: { key: 'size', type: 'category' },
      y: { label: 'Kilobytes', format: 'compact' },
      series: [
        { key: 'png', label: 'PNG' },
        { key: 'webp', label: 'WebP' },
      ],
      rows: [
        { size: '1280 wide', png: 412, webp: 138 },
        { size: '1920 wide', png: 904, webp: 296 },
        { size: '2560 wide', png: 1580, webp: 511 },
      ],
    },
  },
  octavesVsDetail: {
    title: 'Detail gained per noise octave',
    textAlternative:
      'Each added octave contributes about half the detail of the one before, so the curve flattens after three octaves while cost keeps rising.',
    spec: {
      specVersion: 1,
      kind: 'area',
      x: { key: 'octaves', label: 'Octaves', type: 'number' },
      y: { label: 'Share of final detail', format: 'percent', domain: [0, 1] },
      series: [{ key: 'detail', label: 'Cumulative detail' }],
      rows: [
        { octaves: 1, detail: 0.52 },
        { octaves: 2, detail: 0.77 },
        { octaves: 3, detail: 0.89 },
        { octaves: 4, detail: 0.95 },
        { octaves: 5, detail: 0.98 },
        { octaves: 6, detail: 1 },
      ],
      annotations: [{ x: 3, label: 'Shipped default' }],
    },
  },
  lcpByFace: {
    title: 'Largest Contentful Paint, poster against live field',
    textAlternative:
      'Pages that paint the poster first keep LCP flat across the rollout, while the live-first build regressed it by roughly a second before it was reverted.',
    spec: {
      specVersion: 1,
      kind: 'line',
      x: { key: 'week', type: 'time' },
      y: { label: 'LCP (s)' },
      series: [
        { key: 'poster', label: 'Poster first' },
        { key: 'live', label: 'Live first' },
      ],
      rows: [
        { week: '2026-08-03', poster: 1.42, live: 1.44 },
        { week: '2026-08-10', poster: 1.4, live: 2.31 },
        { week: '2026-08-17', poster: 1.41, live: 2.38 },
        { week: '2026-08-24', poster: 1.39, live: 2.29 },
        { week: '2026-08-31', poster: 1.4, live: null },
      ],
      annotations: [{ x: '2026-08-31', label: 'Live first reverted' }],
    },
  },
  deltaFromDefault: {
    title: 'How far each shipped look moves from the defaults',
    textAlternative:
      'Topography and Depth map raise relief and orientation well above the default and cut flicker; Technical B2B is the only look that lowers streak count.',
    spec: {
      specVersion: 1,
      kind: 'diverging-bar',
      x: { key: 'parameter', type: 'category' },
      y: { label: 'Change from default', format: 'percent' },
      series: [
        { key: 'topography', label: 'Topography' },
        { key: 'technical', label: 'Technical B2B' },
      ],
      rows: [
        { parameter: 'count', topography: 0.5, technical: -0.6 },
        { parameter: 'relief', topography: 0.9, technical: 0.1 },
        { parameter: 'orient', topography: 1, technical: 1 },
        { parameter: 'flicker', topography: -0.4, technical: -0.2 },
        { parameter: 'noiseScale', topography: -0.3, technical: 0.25 },
      ],
    },
  },
  countVsFps: {
    title: 'Frame rate against streak count, by device class',
    textAlternative:
      'Laptops hold 60 frames per second across the tested range; phones fall away past 6,000 streaks, which is where the mobile ceiling is set.',
    spec: {
      specVersion: 1,
      kind: 'scatter',
      x: { key: 'count', label: 'Streaks', type: 'number' },
      y: { label: 'Frames per second' },
      series: [
        { key: 'laptop', label: 'Laptop' },
        { key: 'phone', label: 'Phone' },
      ],
      rows: [
        { count: 2000, laptop: 60, phone: 60 },
        { count: 4000, laptop: 60, phone: 58 },
        { count: 6000, laptop: 60, phone: 51 },
        { count: 8000, laptop: 59, phone: 39 },
        { count: 10000, laptop: 58, phone: 31 },
        { count: 12000, laptop: 55, phone: 24 },
      ],
      annotations: [{ x: 6000, label: 'Mobile ceiling' }],
    },
  },
  studioPublishes: {
    title: 'Studio publishes per week',
    textAlternative:
      'Publishing picked up once releases could be restored from history, rising from two a week to eleven.',
    spec: {
      specVersion: 1,
      kind: 'bar',
      x: { key: 'week', type: 'time' },
      y: { label: 'Releases' },
      series: [{ key: 'releases', label: 'Releases' }],
      rows: [
        { week: '2026-08-17', releases: 2 },
        { week: '2026-08-24', releases: 3 },
        { week: '2026-08-31', releases: 7 },
        { week: '2026-09-07', releases: 9 },
        { week: '2026-09-14', releases: 11 },
      ],
    },
  },
}

export const DIAGRAM_CORPUS: Record<string, CorpusFigure<DiagramSpec>> = {
  visualResolves: {
    title: 'How a visual slot resolves',
    textAlternative:
      'A visual slot checks for a Studio look first, then a shipped look, then falls back to the media upload. Whatever it finds is admitted as live only if the device supports it; otherwise the poster stands.',
    spec: {
      specVersion: 1,
      kind: 'flow',
      direction: 'LR',
      nodes: [
        { id: 'slot', label: 'Visual slot', shape: 'terminal' },
        { id: 'studio', label: 'Studio look published?', shape: 'decision' },
        { id: 'preset', label: 'Shipped look chosen?', shape: 'decision' },
        { id: 'media', label: 'Media upload' },
        { id: 'admit', label: 'Device can run it?', shape: 'decision', emphasis: true },
        { id: 'live', label: 'Live field', shape: 'terminal' },
        { id: 'poster', label: 'Poster', shape: 'terminal' },
      ],
      edges: [
        { from: 'slot', to: 'studio' },
        { from: 'studio', to: 'admit', label: 'yes' },
        { from: 'studio', to: 'preset', label: 'no' },
        { from: 'preset', to: 'admit', label: 'yes' },
        { from: 'preset', to: 'media', label: 'no' },
        { from: 'admit', to: 'live', label: 'yes', animated: true },
        { from: 'admit', to: 'poster', label: 'no', style: 'dashed' },
      ],
    },
  },
  lifecycle: {
    title: 'Lifecycle of one field: poster, live, failure',
    textAlternative:
      'A field starts as a poster, goes live when it is near the viewport and the GPU budget allows, pauses when it leaves, and drops back to the poster for good if the WebGL context is lost.',
    spec: {
      specVersion: 1,
      kind: 'state',
      direction: 'LR',
      nodes: [
        { id: 'poster', label: 'Poster', shape: 'terminal' },
        { id: 'admitted', label: 'Admitted' },
        { id: 'live', label: 'Live', emphasis: true },
        { id: 'paused', label: 'Paused' },
        { id: 'failed', label: 'Failed', shape: 'terminal' },
      ],
      edges: [
        { from: 'poster', to: 'admitted', label: 'near viewport' },
        { from: 'admitted', to: 'live', label: 'lease granted' },
        { from: 'live', to: 'paused', label: 'leaves viewport' },
        { from: 'paused', to: 'live', label: 'returns' },
        { from: 'live', to: 'live', label: 'frame' },
        { from: 'live', to: 'failed', label: 'context lost', style: 'dashed' },
      ],
    },
  },
  publishSequence: {
    title: 'Publishing a look from the Studio',
    textAlternative:
      'The editor publishes; the browser renders both posters and uploads them; the server hashes the snapshot, reuses an existing release when the hash matches, stores the release, and revalidates the pages that use the look.',
    spec: {
      specVersion: 1,
      kind: 'sequence',
      actors: [
        { id: 'editor', label: 'Editor', role: 'person' },
        { id: 'studio', label: 'Studio (browser)' },
        { id: 'api', label: 'Publish endpoint' },
        { id: 'db', label: 'Postgres' },
      ],
      messages: [
        { from: 'editor', to: 'studio', label: 'Publish' },
        { from: 'studio', to: 'studio', label: 'Render light and dark posters', style: 'self' },
        { from: 'studio', to: 'api', label: 'Recipe and posters' },
        { from: 'api', to: 'api', label: 'Hash the snapshot', style: 'self' },
        { from: 'api', to: 'db', label: 'Find release by hash' },
        { from: 'db', to: 'api', label: 'None found', style: 'reply' },
        { from: 'api', to: 'db', label: 'Store release' },
        { from: 'api', to: 'studio', label: 'Release id', style: 'reply' },
      ],
    },
  },
  studioTimeline: {
    title: 'From fixed looks to the Studio',
    textAlternative:
      'The field shipped with three code-defined looks in July, gained posters in August, and became authorable in the Studio in September, when light leak joined as a second effect.',
    spec: {
      specVersion: 1,
      kind: 'timeline',
      range: { start: '2026-07-01', end: '2026-09-30' },
      eras: [
        { start: '2026-07-01', end: '2026-08-16', label: 'Code-defined looks' },
        { start: '2026-08-17', end: '2026-09-30', label: 'Studio' },
      ],
      events: [
        { at: '2026-07-08', label: 'First three looks ship' },
        { at: '2026-08-04', label: 'Posters replace cold canvases', ref: 'LCP fix' },
        { at: '2026-08-17', label: 'Studio v1', ref: 'streak_field_studio' },
        { at: '2026-09-14', label: 'Menu runs the live field' },
        { at: '2026-09-19', label: 'Light leak joins as an effect', ref: 'light_leak_visual' },
      ],
    },
  },
  renderPipeline: {
    title: 'One frame of the field',
    textAlternative:
      'Each frame, the CPU only advances time and pointer state. The vertex shader samples the noise, displaces and orients each dash; the fragment shader lights it from the same noise read as height.',
    spec: {
      specVersion: 1,
      kind: 'flow',
      direction: 'TD',
      groups: [
        { id: 'cpu', label: 'CPU, once per frame' },
        { id: 'gpu', label: 'GPU, once per streak' },
      ],
      nodes: [
        { id: 'tick', label: 'Advance time and pointer', group: 'cpu' },
        { id: 'uniforms', label: 'Write uniforms', group: 'cpu' },
        { id: 'noise', label: 'Sample noise field', group: 'gpu', emphasis: true },
        { id: 'displace', label: 'Displace and orient dash', group: 'gpu' },
        { id: 'relief', label: 'Light from height', group: 'gpu' },
        { id: 'blend', label: 'Blend to canvas', shape: 'terminal' },
      ],
      edges: [
        { from: 'tick', to: 'uniforms' },
        { from: 'uniforms', to: 'noise', animated: true },
        { from: 'noise', to: 'displace', label: 'direction' },
        { from: 'noise', to: 'relief', label: 'height' },
        { from: 'displace', to: 'blend' },
        { from: 'relief', to: 'blend' },
      ],
    },
  },
  admission: {
    title: 'Admission: who gets a live canvas',
    textAlternative:
      'A field asks for a GPU lease. Reduced motion, a paused site, a covered page or a weak device each refuse it; otherwise the budget grants leases by priority until it is spent.',
    spec: {
      specVersion: 1,
      kind: 'flow',
      direction: 'TD',
      nodes: [
        { id: 'ask', label: 'Field asks for a lease', shape: 'terminal' },
        { id: 'motion', label: 'Reduced motion or paused?', shape: 'decision' },
        { id: 'capable', label: 'Device capable?', shape: 'decision' },
        { id: 'budget', label: 'Budget left at this priority?', shape: 'decision' },
        { id: 'grant', label: 'Lease granted', shape: 'terminal', emphasis: true },
        { id: 'deny', label: 'Stay a poster', shape: 'terminal' },
      ],
      edges: [
        { from: 'ask', to: 'motion' },
        { from: 'motion', to: 'deny', label: 'yes', style: 'dashed' },
        { from: 'motion', to: 'capable', label: 'no' },
        { from: 'capable', to: 'deny', label: 'no', style: 'dashed' },
        { from: 'capable', to: 'budget', label: 'yes' },
        { from: 'budget', to: 'grant', label: 'yes' },
        { from: 'budget', to: 'deny', label: 'no', style: 'dashed' },
      ],
    },
  },
  authoringPath: {
    title: 'How a figure gets from an agent to the page',
    textAlternative:
      'An agent writes a spec as a draft over MCP. The save validates it and lays out the diagram; a bad spec comes straight back with the exact problems. A person reviews in live preview and publishes.',
    spec: {
      specVersion: 1,
      kind: 'sequence',
      actors: [
        { id: 'agent', label: 'Agent' },
        { id: 'mcp', label: 'MCP server' },
        { id: 'payload', label: 'Payload save' },
        { id: 'person', label: 'Reviewer', role: 'person' },
      ],
      messages: [
        { from: 'agent', to: 'mcp', label: 'Update draft with a diagram spec' },
        { from: 'mcp', to: 'payload', label: 'Save as the key’s user' },
        { from: 'payload', to: 'payload', label: 'Validate, then lay out', style: 'self' },
        { from: 'payload', to: 'agent', label: 'Problems, by path', style: 'reply' },
        { from: 'agent', to: 'mcp', label: 'Corrected spec' },
        { from: 'payload', to: 'person', label: 'Draft in live preview' },
        { from: 'person', to: 'payload', label: 'Publish' },
      ],
    },
  },
  recipeStates: {
    title: 'A Studio look, from draft to release',
    textAlternative:
      'A look is a draft until it is published. Publishing makes a release; editing a published look makes it a draft again without touching the release pages are using.',
    spec: {
      specVersion: 1,
      kind: 'state',
      direction: 'TD',
      nodes: [
        { id: 'new', label: 'New look', shape: 'terminal' },
        { id: 'draft', label: 'Draft' },
        { id: 'released', label: 'Released', emphasis: true },
        { id: 'edited', label: 'Released, with draft changes' },
      ],
      edges: [
        { from: 'new', to: 'draft' },
        { from: 'draft', to: 'released', label: 'publish' },
        { from: 'released', to: 'edited', label: 'edit' },
        { from: 'edited', to: 'released', label: 'publish' },
        { from: 'edited', to: 'released', label: 'restore release', style: 'dashed' },
      ],
    },
  },
}
