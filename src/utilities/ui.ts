/**
 * Utility functions for UI components automatically added by ShadCN and used in a few of our frontend components and blocks.
 *
 * Other functions may be exported from here in the future or by installing other shadcn components.
 */

import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/* Register the fluid type-scale tokens (globals.css @theme) as font-size
   classes. Without this, tailwind-merge reads `text-heading-2` as a text
   color, so a base class like `text-sm` survives the merge and the token is
   silently dropped. */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display', 'heading-1', 'heading-2', 'heading-3', 'lead'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
