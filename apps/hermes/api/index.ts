import { handle } from 'hono/vercel'
import configOpenAPI from './lib/openapi'
import { createBaseRouter } from './lib/router'
import healthRouter from './routes/health'
import riotRouter from './routes/riot'
import valorantRouter from './routes/valorant'

export const config = {
  runtime: 'edge',
}

const app = createBaseRouter()

const routes = [healthRouter, valorantRouter, riotRouter]

configOpenAPI(app)

for (const route of routes) {
  app.route('/', route)
}

export default handle(app)
