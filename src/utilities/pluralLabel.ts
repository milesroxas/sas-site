/**
 * Singular or plural heading for a list, by how many entries it holds. Matches
 * the `count > 1` reading the taxonomy meta groups already used inline: a
 * single term reads "Industry", two or more read "Industries".
 */
export const pluralLabel = (count: number, singular: string, plural: string): string =>
  count > 1 ? plural : singular
