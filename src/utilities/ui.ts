/**
 * Utility functions for UI components automatically added by ShadCN and used in a few of our frontend components and blocks.
 *
 * Other functions may be exported from here in the future or by installing other shadcn components.
 */

import { type ClassValue, clsx } from 'clsx'
import { type ClassValidator, extendTailwindMerge, validators } from 'tailwind-merge'

const { isArbitraryValue, isNumber } = validators

/* One tw-animate-css enter/exit group: the bare utility (`fade-in`) plus its
   sized form (`fade-in-0`, `fade-in-[.4]`). */
const animateGroup = (...names: string[]): (string | Record<string, ClassValidator[]>)[] => [
  ...names,
  Object.fromEntries(names.map((name) => [name, [isNumber, isArbitraryValue]])),
]

type AnimateGroupIds =
  | 'animate-fade-in'
  | 'animate-fade-out'
  | 'animate-zoom-in'
  | 'animate-zoom-out'
  | 'animate-slide-in-y'
  | 'animate-slide-in-x'
  | 'animate-slide-out-y'
  | 'animate-slide-out-x'

const twMerge = extendTailwindMerge<AnimateGroupIds>({
  extend: {
    classGroups: {
      /* Register the fluid type-scale tokens (globals.css @theme) as
         font-size classes. Without this, tailwind-merge reads
         `text-heading-2` as a text color, so a base class like `text-sm`
         survives the merge and the token is silently dropped. */
      'font-size': [{ text: ['display', 'heading-1', 'heading-2', 'heading-3', 'lead'] }],
      /* tw-animate-css enter/exit utilities, so a consumer can retune a
         primitive's `data-open:zoom-in-95` with `data-open:zoom-in-98`.
         Unregistered, both classes ship and the primitive's wins on source
         order, since the variant's attribute selector outranks a bare
         override anyway. Each axis is its own group: a slide from the top
         and one from the left compose, but two from the top conflict. */
      'animate-fade-in': animateGroup('fade-in'),
      'animate-fade-out': animateGroup('fade-out'),
      'animate-zoom-in': animateGroup('zoom-in'),
      'animate-zoom-out': animateGroup('zoom-out'),
      'animate-slide-in-y': animateGroup('slide-in-from-top', 'slide-in-from-bottom'),
      'animate-slide-in-x': animateGroup('slide-in-from-left', 'slide-in-from-right'),
      'animate-slide-out-y': animateGroup('slide-out-to-top', 'slide-out-to-bottom'),
      'animate-slide-out-x': animateGroup('slide-out-to-left', 'slide-out-to-right'),
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
