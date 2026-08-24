/** Prose section: how the immersive playground works. */
export function ImmersiveOverview() {
  return (
    <section className="space-y-3">
      <h2 className="text-balance text-xl tracking-tight">How this page works</h2>
      <ul className="max-w-prose list-disc space-y-2 pl-5 text-pretty text-sm/relaxed text-muted-foreground">
        <li>
          One WebGL canvas backs the whole route —{' '}
          <code className="font-mono text-foreground/90">features/immersive</code> renders into it
          through a tunnel, and Lenis drives scrolling site-wide. Only the demo picked in the
          sidebar is mounted, so the canvas ever runs one scene.
        </li>
        <li>
          Each demo&apos;s GUI lives in the controls panel beside the stage;{' '}
          <strong className="font-medium text-foreground/90">Copy</strong> puts the current values
          on your clipboard as pasteable code for the component that ships the effect.
        </li>
        <li>
          <strong className="font-medium text-foreground/90">GUI settings</strong>
          {' (top right) controls the paste guide shown after copying.'}
        </li>
      </ul>
    </section>
  )
}
