import { statusCodes } from '@ezcmd/statix'
import { describeRoute } from 'hono-openapi'
import { resolver } from 'hono-openapi/zod'
import { z } from 'zod'
import { createRouter } from '../lib/router'

const riotRouter = createRouter('/')

const RiotAuthSchema = z.literal('9ba1edea-c670-4e0a-a1eb-35f9719d969e')

riotRouter.get(
  '/riot.txt',
  describeRoute({
    description: 'Return the Riot Games verification file',
    responses: {
      200: {
        description: 'Success',
        content: {
          'text/plain': { schema: resolver(RiotAuthSchema) },
        },
      },
    },
  }),
  () => {
    const content = '9ba1edea-c670-4e0a-a1eb-35f9719d969e'

    return new Response(content, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="riot.txt"',
        'Cache-Control': 'public, max-age=31536000',
      },
      status: statusCodes.OK,
    })
  }
)

export default riotRouter
