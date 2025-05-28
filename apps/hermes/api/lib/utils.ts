import type { MMRHistory } from '../routes/valorant'

// Check valid regions
export const isValidRegion = (region: string): boolean => {
  const validRegions = new Set(['eu', 'na', 'latam', 'ap', 'kr', 'br'])
  return validRegions.has(region)
}

// Check date is strictly today
export const isToday = (timestamp: number): boolean => {
  const now = new Date()
  const startOfDay =
    new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000
  const endOfDay = startOfDay + 86400 - 1

  return timestamp >= startOfDay && timestamp <= endOfDay
}

// Aggregate MMR
type AggregatedMMR = {
  mmr: number
  wins: number
  losses: number
}

export const aggregateMmr = (history: MMRHistory): AggregatedMMR => {
  const { mmr, wins, losses } = history.reduce(
    (acc, record) => {
      if (isToday(record.date_raw)) {
        acc.mmr += record.mmr_change_to_last_game
        if (record.mmr_change_to_last_game > 0) {
          acc.wins++
        } else if (record.mmr_change_to_last_game < 0) {
          acc.losses++
        }
      }
      return acc
    },
    { mmr: 0, wins: 0, losses: 0 }
  )

  return {
    mmr,
    wins,
    losses,
  }
}
