/**
 * Two-digit ordinal for a list index lane ("01", "02", ...): the mono label
 * beside a question or an insight. Stated once so every numbered run pads
 * the same way.
 */
export const ordinalLabel = (index: number) => String(index + 1).padStart(2, '0')
