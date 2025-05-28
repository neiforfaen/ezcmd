import { errorHandler, notFoundHandler } from '@ezcmd/statix'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { cors } from 'hono/cors'

type Env = {
  VAL_API_KEY: string
  LOG_LEVEL: 'debug' | 'info' | 'error' | 'warning' | 'fatal'
  NODE_ENV: 'development' | 'production'
}

type Bindings = {
  Variables: {
    VAL_API_KEY: string
    LOG_LEVEL: 'debug' | 'info' | 'error' | 'warning' | 'fatal'
    NODE_ENV: 'development' | 'production'
  }
}

export const createRouter = (basePath: string) =>
  new Hono<Bindings>({ strict: false }).basePath(basePath)

export const createBaseRouter = () => {
  const base = new Hono<Bindings>({ strict: false })
    .basePath('/ezcmd')
    .use(async (c, next) => {
      const { VAL_API_KEY, LOG_LEVEL, NODE_ENV } = env<Env>(c, 'edge-light')

      c.set('VAL_API_KEY', VAL_API_KEY)
      c.set('LOG_LEVEL', LOG_LEVEL)
      c.set('NODE_ENV', NODE_ENV)

      await next()
    })

  base.onError(errorHandler)
  base.notFound(notFoundHandler)
  base.use(cors({ origin: '*' }))

  return base
}

export type BaseRouter = ReturnType<typeof createBaseRouter>
