import { openAPISpecs } from 'hono-openapi'
import packageJson from '../../package.json'
import type { BaseRouter } from './router'

const configOpenAPI = (api: BaseRouter) => {
  api.get(
    '/openapi',
    openAPISpecs(api, {
      documentation: {
        info: {
          title: 'ezcmd hermes openapi spec',
          version: packageJson.version,
          description: packageJson.description,
        },
        servers: [{ url: 'https://api.kaiden.sh', description: 'Production' }],
      },
    })
  )
}

export default configOpenAPI
