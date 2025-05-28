import { statusCodes, statusPhrases } from '@ezcmd/statix'
import get from 'axios'
import { describeRoute } from 'hono-openapi'
import { resolver } from 'hono-openapi/zod'
import { z } from 'zod'
import { createRouter } from '../lib/router'
import { aggregateMmr, isValidRegion } from '../lib/utils'

export type Record = {
  currenttier: number
  currenttierpatched: string
  images: {
    small: string
    large: string
    triangle_up: string
    triangle_down: string
  }
  match_id: string
  map: {
    id: string
    name: string
  }
  season_id: string
  ranking_in_tier: number
  mmr_change_to_last_game: number
  elo: number
  date: string
  date_raw: number
}

export type MMRHistory = Pick<
  Record,
  'date' | 'date_raw' | 'mmr_change_to_last_game'
>[]

const valorantRouter = createRouter('/valorant')

const ValorantResponseSchema = z.object({
  message: z.string(),
})

const PlayerNotFoundSchema = z.object({
  message: z.literal('Player not found'),
})

const ErrorSchema = z.object({
  error: z.union([
    z.literal(statusPhrases.BAD_REQUEST),
    z.literal(statusPhrases.INTERNAL_SERVER_ERROR),
    z.string(), // Defined error message
  ]),
})

// Formatted rank response
valorantRouter.get(
  '/v1/rank/:region/:name/:tag',
  describeRoute({
    description:
      'Retrieve valorant player rank and respond with a formatted message',
    responses: {
      200: {
        description: 'Success',
        content: {
          'application/json': { schema: resolver(ValorantResponseSchema) },
        },
      },
      400: {
        description: 'Invalid region or missing name/tag',
        content: {
          'application/json': { schema: resolver(ErrorSchema) },
        },
      },
      404: {
        description: 'Player not found',
        content: {
          'application/json': { schema: resolver(PlayerNotFoundSchema) },
        },
      },
      500: {
        description: 'Internal server error',
        content: {
          'application/json': { schema: resolver(ErrorSchema) },
        },
      },
    },
  }),
  async (c) => {
    try {
      const { name, tag, region } = c.req.param()
      const VAL_API_KEY = c.get('VAL_API_KEY')

      if (!isValidRegion(region) || !name || !tag) {
        return c.json(
          { error: statusPhrases.BAD_REQUEST },
          statusCodes.BAD_REQUEST
        )
      }

      const {
        data: {
          data: { current_data, highest_rank },
        },
      } = await get(
        `https://api.henrikdev.xyz/valorant/v2/mmr/${region}/${name}/${tag}?api_key=${VAL_API_KEY}`
      )

      if (!current_data) {
        return c.json({ message: 'Player not found' }, statusCodes.NOT_FOUND)
      }

      return c.json(
        {
          message: `${current_data.currenttierpatched} [${current_data.ranking_in_tier}RR] | Peak: ${highest_rank.patched_tier} @ ${highest_rank.season}`,
        },
        statusCodes.OK
      )
    } catch (error) {
      const { message } = error as Error
      return c.json({ error: message }, statusCodes.INTERNAL_SERVER_ERROR)
    }
  }
)

// Formatted daily record response
valorantRouter.get(
  '/v1/record/:region/:name/:tag',
  describeRoute({
    description:
      'Retrieve valorant player rank and respond with a formatted message',
    responses: {
      200: {
        description: 'Success',
        content: {
          'application/json': { schema: resolver(ValorantResponseSchema) },
        },
      },
      400: {
        description: 'Invalid region or missing name/tag',
        content: {
          'application/json': { schema: resolver(ErrorSchema) },
        },
      },
      404: {
        description: 'Player not found',
        content: {
          'application/json': { schema: resolver(PlayerNotFoundSchema) },
        },
      },
      500: {
        description: 'Internal server error',
        content: {
          'application/json': { schema: resolver(ErrorSchema) },
        },
      },
    },
  }),
  async (c) => {
    try {
      const { name, tag, region } = c.req.param()
      const VAL_API_KEY = c.get('VAL_API_KEY')

      if (!isValidRegion(region) || !name || !tag) {
        return c.json(
          { error: statusPhrases.BAD_REQUEST },
          statusCodes.BAD_REQUEST
        )
      }

      const {
        data: { data },
      } = await get(
        `https://api.henrikdev.xyz/valorant/v1/mmr-history/${region}/${name}/${tag}?api_key=${VAL_API_KEY}`
      )

      if (!data) {
        return c.json({ message: 'Player not found' }, statusCodes.NOT_FOUND)
      }

      const mmrHistory: MMRHistory = data
        .filter(
          ({ map }: { map: { id: string; name: string } }) => map.id !== ''
        )
        .map(({ date, date_raw, mmr_change_to_last_game }: Record) => ({
          date,
          date_raw,
          mmr_change_to_last_game,
        }))

      const { mmr, wins, losses } = aggregateMmr(mmrHistory)
      const sign = mmr === 0 || mmr < 0 ? '' : '+'

      return c.json(
        {
          message: `${wins}W / ${losses}L | ${sign}${mmr}RR`,
        },
        statusCodes.OK
      )
    } catch (error) {
      const { message } = error as Error
      return c.json({ error: message }, statusCodes.INTERNAL_SERVER_ERROR)
    }
  }
)

export default valorantRouter
