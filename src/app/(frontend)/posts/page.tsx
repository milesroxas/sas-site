import { generateInsightsIndexMetadata, InsightsIndexView } from '../insights/InsightsIndexView'

export const revalidate = 600

export default InsightsIndexView

/** `/insights` owns the listing; this legacy path is a copy and says so. */
export function generateMetadata() {
  return generateInsightsIndexMetadata('/insights')
}
