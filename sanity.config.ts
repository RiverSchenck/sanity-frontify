import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {frontifyPlugin as frontifyLegacyPlugin} from '@frontify/sanity-plugin-frontify'
import {schemaTypes} from './schemaTypes'
import {frontifyPlugin as frontifyCdnPlugin} from './plugins/frontify-dam'

export default defineConfig({
  name: 'default',
  title: 'Demo',

  projectId: 'crtwac40',
  dataset: 'production',

  plugins: [
    structureTool(),
    visionTool(),
    frontifyCdnPlugin({
      domain: 'https://demo.frontify.com',
      cdn: 'preview',
    }),
    frontifyLegacyPlugin({
      domain: 'https://demo.frontify.com',
      allowMultiSelect: false,
      filters: [
        {
          key: 'object_type',
          values: ['IMAGE'],
          inverted: false,
        },
      ],
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
