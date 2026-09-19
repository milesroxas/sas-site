'use client'

import {
  type ComponentType,
  lazy,
  type ReactNode,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/utilities/ui'
import { FailureBoundary } from '../ui/failure-boundary'
import type { LeakFailureReason, LightLeakRuntimeProps } from '../ui/light-leak-runtime'
import { originMirror } from '../ui/light-leak-tuning'
import { composeLeakTuning } from './compose'
import type { LeakVisualDescriptor } from './descriptor'
import { useGroundSurface } from './hooks'
import { VISUAL_BLEED_ATTR, VISUAL_HOST_ATTR } from './host'
import type { VisualPlacement } from './placement'
import { crossfadeClass, VisualPosterStack, type VisualSurface } from './poster'
import { visualPosters } from './posters'
import { type LiveVisualOptions, useLiveVisual } from './use-live-visual'

/**
 * The light leak as page media, poster first, on the shared slot lifecycle
 * (`./use-live-visual`).
 *
 * The leak draws an opaque frame and meets its ground through a CSS blend, so
 * it needs a real ground inside its own stacking context: a blend stops at the
 * first ancestor that fades, transforms or clips with a mask, and an opaque
 * frame blended over nothing is a black box. Contained, the frame paints the
 * band's ground and isolates, and the slot's media sits under the leak when
 * the editor asked for it. Bleeding, the layer is portaled onto the block's
 * root (`./host`), which paints the band and isolates while it holds
 * one (globals.css, "Visual bleed"); a slot with no such root stays contained.
 */

const LightLeakRuntime = lazy(() =>
  import('../ui/light-leak-runtime').then((module) => ({ default: module.LightLeakRuntime })),
) as ComponentType<LightLeakRuntimeProps>

type LayerProps = {
  descriptor: LeakVisualDescriptor
  placement: VisualPlacement
  surface: VisualSurface
  priority: boolean
  sizes: string
  active: boolean
  imgClassName?: string
  bleeding: boolean
} & Pick<LiveVisualOptions, 'admission' | 'onStatusChange'>

export type LeakVisualProps = Omit<Partial<LayerProps>, 'bleeding'> &
  Pick<LayerProps, 'descriptor' | 'placement'> & {
    /** Frame classes: aspect ratio, width, corner treatment. */
    className?: string
    /** Fill the nearest positioned ancestor instead of sizing the frame. */
    fill?: boolean
    /** The slot's media, rendered by the owner, shown under the leak when the descriptor carries it. */
    media?: ReactNode
  }

function LeakLayer({
  descriptor,
  placement,
  surface,
  priority,
  sizes,
  active,
  imgClassName,
  bleeding,
  admission,
  onStatusChange,
}: LayerProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const posters = useMemo(() => visualPosters({ kind: 'lightLeak', descriptor }), [descriptor])
  const mirror = useMemo(() => originMirror(descriptor.origin), [descriptor.origin])

  const { status, failure, mounted, live, ready, generation, handleReady, fail, failChunk } =
    useLiveVisual<LeakFailureReason>({
      rootRef,
      placement,
      kind: 'leak',
      allowed: !descriptor.degraded,
      active,
      identity: `${descriptor.release?.sourceHash ?? descriptor.look}:${descriptor.speed}:${descriptor.intensity}:${descriptor.pointer}:${descriptor.origin}`,
      admission,
      onStatusChange,
    })

  const ground = useGroundSurface(rootRef)
  const faces = useMemo(
    () => ({
      dark: composeLeakTuning(descriptor, { surface: 'dark', placement }),
      light: composeLeakTuning(descriptor, { surface: 'light', placement }),
    }),
    [descriptor, placement],
  )
  const tuning = faces[surface === 'auto' ? ground : surface]
  const blend = useMemo(
    () => ({ dark: faces.dark.blendMode, light: faces.light.blendMode }),
    [faces],
  )

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      data-visual-layer="lightLeak"
      data-visual-status={status}
      {...(bleeding ? { [VISUAL_BLEED_ATTR]: '' } : {})}
      {...(failure ? { 'data-visual-failure': failure } : {})}
    >
      <VisualPosterStack
        blend={blend}
        // The stills are rendered with the light entering top right.
        imgClassName={cn(mirror[0] && '-scale-x-100', mirror[1] && '-scale-y-100', imgClassName)}
        posters={posters}
        priority={priority}
        shown={!ready}
        sizes={sizes}
        surface={surface}
      />
      {mounted && (
        <div className={crossfadeClass(ready)} style={{ mixBlendMode: tuning.blendMode }}>
          <FailureBoundary onError={failChunk}>
            <Suspense fallback={null}>
              <LightLeakRuntime
                active={live}
                generation={generation}
                mirror={mirror}
                onFailure={fail}
                onReady={handleReady}
                rootRef={rootRef}
                tuning={tuning}
              />
            </Suspense>
          </FailureBoundary>
        </div>
      )}
    </div>
  )
}

export function LeakVisual({
  descriptor,
  placement,
  surface = 'auto',
  priority = false,
  sizes = '100vw',
  active = true,
  className,
  fill = false,
  imgClassName,
  media,
  admission,
  onStatusChange,
}: LeakVisualProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  // `undefined` until looked for: a bleeding leak never paints contained first.
  const [host, setHost] = useState<Element | null | undefined>(undefined)
  useEffect(() => {
    setHost(descriptor.bleed ? (frameRef.current?.closest(`[${VISUAL_HOST_ATTR}]`) ?? null) : null)
  }, [descriptor.bleed])

  const bleeding = descriptor.bleed && host !== null
  const layer = (
    <LeakLayer
      active={active}
      admission={admission}
      bleeding={bleeding}
      descriptor={descriptor}
      imgClassName={imgClassName}
      onStatusChange={onStatusChange}
      placement={placement}
      // A bleeding layer is as wide as the page and is never first paint.
      priority={priority && !bleeding}
      sizes={bleeding ? '100vw' : sizes}
      surface={surface}
    />
  )

  return (
    <div
      ref={frameRef}
      className={cn(
        'overflow-hidden',
        fill ? 'absolute inset-0' : 'relative w-full',
        !bleeding && 'isolate bg-background',
        className,
      )}
      data-visual="lightLeak"
      data-visual-look={descriptor.look}
    >
      {descriptor.media && media}
      {bleeding ? host && createPortal(layer, host) : layer}
    </div>
  )
}
