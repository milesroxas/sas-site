import { generateInsightsIndexMetadata, InsightsIndexView } from '../insights/InsightsIndexView'

export const revalidate = 600

export default InsightsIndexView

export function generateMetadata() {
  return generateInsightsIndexMetadata('/posts')
}
