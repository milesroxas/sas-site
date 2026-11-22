import type { Testimonial } from '@/payload-types'

/**
 * A quote may only appear once it is published and the speaker has approved it
 * for public use: a draft or an internal-only testimonial never reaches the
 * site. Every block that renders testimonials filters through this, so no
 * caller can mount one around an unapproved quote. An unpopulated id (depth 0)
 * never passes either.
 */
export const isPublicTestimonial = (
  testimonial: number | Testimonial | null | undefined,
): testimonial is Testimonial =>
  typeof testimonial === 'object' &&
  testimonial !== null &&
  testimonial._status === 'published' &&
  testimonial.approvalStatus === 'approved-public'
