import { statusCodes, statusPhrases } from '@ezcmd/statix'
import { describeRoute } from 'hono-openapi'
import { resolver } from 'hono-openapi/zod'
import { z } from 'zod'
import { createRouter } from '../lib/router'

const healthRouter = createRouter('/health')

const HealthStatusSchema = z.object({
  status: z.literal(statusPhrases.OK),
})

healthRouter.get(
  '/',
  describeRoute({
    description: 'Check if the API is active',
    responses: {
      200: {
        description: 'Success',
        content: {
          'application/json': { schema: resolver(HealthStatusSchema) },
        },
      },
    },
  }),
  (c) => {
    return c.json({ status: statusPhrases.OK }, statusCodes.OK)
  }
)

export default healthRouter
