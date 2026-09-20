import type { Condition, Tab } from 'payload'

import { link } from '@/fields/link'
import { visualSlotFields } from '@/fields/visual'

/** Everything under the switch shows, and validates, only once the banner is on. */
const shown: Condition = (_, siblingData) => siblingData?.show === true

/**
 * The index banner: one dark slab between the index title and the listing,
 * pointing at a destination the listing itself does not hold (the lab index
 * sends visitors to the Playground). Copy and link are the editor's; the
 * control panel drawn on its trailing side is illustration and stays
 * code-owned (`src/sections/IndexBanner`).
 *
 * The background is a visual slot like any other, drawn through the `Visual`
 * adapter at the `block` placement. The slab is a dark band in both site
 * themes, so the slot offers no face pin (`themed: false`) and, having no
 * block root to wash across, no bleed (`hosted: false`).
 */
export const indexBannerTab: Tab = {
  label: 'Banner',
  description:
    'A dark banner between the index title and the list. Off, the page goes straight from the title to the list.',
  fields: [
    {
      name: 'banner',
      type: 'group',
      label: false,
      interfaceName: 'IndexBanner',
      fields: [
        {
          name: 'show',
          type: 'checkbox',
          label: 'Show the banner',
          defaultValue: false,
          admin: {
            description:
              'Hiding the banner never clears its fields. It also stays hidden until it has a heading and a working link.',
          },
        },
        {
          name: 'heading',
          type: 'text',
          required: true,
          admin: { condition: shown },
        },
        {
          name: 'body',
          type: 'textarea',
          admin: {
            condition: shown,
            description: 'One or two supporting sentences under the heading. Optional.',
          },
        },
        link({
          appearances: false,
          overrides: {
            label: 'Button',
            admin: { condition: shown },
          },
        }),
        ...visualSlotFields(
          {
            name: 'media',
            type: 'upload',
            relationTo: 'media',
            label: 'Background media',
          },
          {
            condition: shown,
            hosted: false,
            themed: false,
            visualTypeDescription:
              'What runs behind the banner copy. Leave empty for the plain dark slab. A Streak Field runs live here only while the Hero tab has no Streak Field of its own: a page draws one live field at a time, and the index ground outranks the banner, which then rests on its poster.',
          },
        ),
      ],
    },
  ],
}
