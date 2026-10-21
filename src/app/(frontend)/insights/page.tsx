import { generateInsightsIndexMetadata, InsightsIndexView } from './InsightsIndexView'

// Time fallback only: the collection hooks purge this page on publish, so a
// short window only let crawlers regenerate it (and wake the database) all night.
export const revalidate = 86400

export default InsightsIndexView

export function generateMetadata() {
  return generateInsightsIndexMetadata('/insights')
}
