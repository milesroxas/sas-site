import { generateInsightsIndexMetadata, InsightsIndexView } from '../insights/InsightsIndexView'

// Time fallback only: the collection hooks purge this page on publish, so a
// short window only let crawlers regenerate it (and wake the database) all night.
export const revalidate = 86400

export default InsightsIndexView

/** `/insights` owns the listing; this legacy path is a copy and says so. */
export function generateMetadata() {
  return generateInsightsIndexMetadata('/insights')
}
