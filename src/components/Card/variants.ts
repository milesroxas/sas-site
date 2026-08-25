/**
 * Card variant registry — shared between the React component and the Payload
 * block configs so editor-facing options can never drift from what the
 * component implements.
 */
export const CARD_VARIANTS = ['contained', 'open', 'overlay', 'split', 'backdrop'] as const

export type CardVariant = (typeof CARD_VARIANTS)[number]

export const CARD_VARIANT_LABELS: Record<CardVariant, string> = {
  contained: 'Contained',
  open: 'Open',
  overlay: 'Overlay',
  split: 'Split (image right)',
  backdrop: 'Backdrop (media background, blurred base)',
}
