'use client'

import { useDemoControls } from '@/shared/ui/demo-kit'

/** Every common GSAP ease family; direction is picked separately. */
const EASE_FAMILIES = [
  'none',
  'power1',
  'power2',
  'power3',
  'power4',
  'sine',
  'expo',
  'circ',
  'back',
  'elastic',
  'bounce',
]

const EASE_DIRECTIONS = ['in', 'out', 'inOut']

/**
 * Ease picker for demo GUIs, split so the panel never shows the full
 * family × direction matrix: one dropdown for the curve family, an
 * in/out/inOut toggle for the direction (hidden while the family is `none`).
 * Returns the composed GSAP ease string ('power2.out') — hand it to the
 * animation and the copy snippet alike.
 */
export function useEaseControl(folder: string, defaultEase: string) {
  const [defaultFamily, defaultDirection = 'out'] = defaultEase.split('.')
  const { easeFamily, easeDirection } = useDemoControls(folder, {
    easeFamily: { value: defaultFamily, options: EASE_FAMILIES, label: 'ease' },
    easeDirection: {
      value: defaultDirection,
      options: EASE_DIRECTIONS,
      label: 'ease type',
      render: (get) => get(`${folder}.easeFamily`) !== 'none',
    },
  })
  return easeFamily === 'none' ? 'none' : `${easeFamily}.${easeDirection}`
}
