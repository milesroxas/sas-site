import { generateInsightsIndexMetadata, InsightsIndexView } from './InsightsIndexView'

export const revalidate = 600

export default InsightsIndexView

export function generateMetadata() {
  return generateInsightsIndexMetadata('/insights')
}
