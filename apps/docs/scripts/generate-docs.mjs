import { generateFiles } from 'fumadocs-openapi'

// biome-ignore lint/complexity/noVoid: Only used for generating docs
void generateFiles({
  input: ['https://ezcmd-hermes.vercel.app/ezcmd/openapi'],
  output: './content/docs',
  includeDescription: true,
})
