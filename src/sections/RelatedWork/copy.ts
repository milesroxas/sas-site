/**
 * Standing copy for the related-work closer's aside. Site voice: the one
 * cluster that tells a reader why the list is worth reading. Segment pages
 * may override each line from the Positioning tab; an empty field falls
 * back to the line here, so this is the single place the default is stated
 * (the admin placeholders read from it too).
 */
export type RelatedWorkAsideCopy = {
  eyebrow: string
  heading: string
  description: string
}

export const RELATED_WORK_DEFAULT_COPY: RelatedWorkAsideCopy = {
  eyebrow: 'Related work',
  heading: 'See the thinking in practice.',
  description:
    'A selection of projects that show how we turn complex business challenges into clearer brands, websites, and digital experiences.',
}

/** The editable lines, as stored on a segment page. Empty or missing lines fall back. */
export type RelatedWorkCopyOverrides = {
  [K in keyof RelatedWorkAsideCopy]?: string | null
}

const present = (value: string | null | undefined): value is string =>
  typeof value === 'string' && value.trim().length > 0

/** The page's lines over the standing ones, blank lines ignored. */
export const resolveRelatedWorkCopy = (
  overrides: RelatedWorkCopyOverrides | null | undefined,
): RelatedWorkAsideCopy => ({
  eyebrow: present(overrides?.eyebrow) ? overrides.eyebrow : RELATED_WORK_DEFAULT_COPY.eyebrow,
  heading: present(overrides?.heading) ? overrides.heading : RELATED_WORK_DEFAULT_COPY.heading,
  description: present(overrides?.description)
    ? overrides.description
    : RELATED_WORK_DEFAULT_COPY.description,
})
