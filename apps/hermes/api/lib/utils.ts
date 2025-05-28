export const isValidRegion = (region: string): boolean => {
  const validRegions = new Set(['eu', 'na', 'latam', 'ap', 'kr', 'br'])
  return validRegions.has(region)
}
