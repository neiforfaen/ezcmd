import { statusCodes, statusPhrases } from '@ezcmd/statix'
import get from 'axios'
import { describeRoute } from 'hono-openapi'
import { resolver } from 'hono-openapi/zod'
import { z } from 'zod'
import { createRouter } from '../lib/router'
import { isValidRegion } from '../lib/utils'

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
  '/v1/:region/:name/:tag',
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

export default valorantRouter
