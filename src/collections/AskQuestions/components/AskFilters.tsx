import { FilterLinks } from '@/components/admin/FilterLinks'
import { ASK_QUERIES } from './queries'

/** The four ways the team reads the Ask log, one click each. */
export function AskFilters() {
  return (
    <FilterLinks
      filters={[
        { label: 'All', query: '' },
        { label: 'New', query: ASK_QUERIES.new },
        { label: 'Content gaps', query: ASK_QUERIES.gaps },
        { label: 'Thumbs down', query: ASK_QUERIES.thumbsDown },
        { label: 'Went to a person', query: ASK_QUERIES.handedOff },
      ]}
      label="Ask filters"
    />
  )
}
