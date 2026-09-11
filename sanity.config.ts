import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {frontifyPlugin} from './plugins/frontify-dam'

export default defineConfig({
  name: 'default',
  title: 'Demo',

  projectId: 'crtwac40',
  dataset: 'production',

  plugins: [
    structureTool(),
    visionTool(),
    frontifyPlugin({
      domain: 'https://demo.frontify.com',
      cdn: 'preview',
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
