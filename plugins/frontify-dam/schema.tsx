import {defineField, defineType, type ArrayOfObjectsInputProps, type ObjectInputProps} from 'sanity'

import {AssetInput} from './components/AssetInput'
import {AssetsInput} from './components/AssetsInput'
import {DEFAULT_CDN, type FrontifyPluginOptions} from './types'
import {frontifyPreviewMedia, getFrontifyPreviewImageUrl} from './urls'

const storedFields = [
  defineField({name: 'id', type: 'string', readOnly: true}),
  defineField({name: 'externalId', type: 'string', readOnly: true}),
  defineField({name: 'title', type: 'string', readOnly: true}),
  defineField({name: 'description', type: 'text', readOnly: true}),
  defineField({
    name: 'creator',
    type: 'object',
    readOnly: true,
    fields: [defineField({name: 'name', type: 'string'})],
  }),
  defineField({name: 'createdAt', type: 'datetime', readOnly: true}),
  defineField({name: 'type', type: 'string', readOnly: true}),
  defineField({name: 'author', type: 'string', readOnly: true}),
  defineField({name: 'expiresAt', type: 'datetime', readOnly: true}),
  defineField({name: 'alternativeText', type: 'string', readOnly: true}),
  defineField({name: 'isDecorative', type: 'boolean', readOnly: true}),
  defineField({
    name: 'licenses',
    type: 'array',
    readOnly: true,
    of: [
      {
        type: 'object',
        fields: [
          defineField({name: 'title', type: 'string'}),
          defineField({name: 'text', type: 'text'}),
        ],
      },
    ],
  }),
  defineField({
    name: 'copyright',
    type: 'object',
    readOnly: true,
    fields: [
      defineField({name: 'status', type: 'string'}),
      defineField({name: 'notice', type: 'text'}),
    ],
  }),
  defineField({
    name: 'tags',
    type: 'array',
    readOnly: true,
    of: [
      {
        type: 'object',
        fields: [
          defineField({name: 'value', type: 'string'}),
          defineField({name: 'source', type: 'string'}),
        ],
      },
    ],
  }),
  defineField({
    name: 'customMetadata',
    type: 'array',
    readOnly: true,
    of: [
      {
        type: 'object',
        fields: [
          defineField({
            name: 'property',
            type: 'object',
            fields: [
              defineField({name: 'id', type: 'string'}),
              defineField({name: 'name', type: 'string'}),
              defineField({
                name: 'type',
                type: 'object',
                fields: [defineField({name: 'name', type: 'string'})],
              }),
            ],
          }),
          defineField({
            name: 'value',
            type: 'object',
            fields: [
              defineField({name: 'value', type: 'string'}),
              defineField({name: 'optionId', type: 'string'}),
              defineField({name: 'text', type: 'string'}),
            ],
          }),
          defineField({
            name: 'values',
            type: 'array',
            of: [
              {
                type: 'object',
                fields: [
                  defineField({name: 'optionId', type: 'string'}),
                  defineField({name: 'text', type: 'string'}),
                ],
              },
            ],
          }),
        ],
      },
    ],
  }),
  defineField({name: 'filename', type: 'string', readOnly: true}),
  defineField({name: 'extension', type: 'string', readOnly: true}),
  defineField({name: 'size', type: 'number', readOnly: true}),
  defineField({name: 'previewUrl', type: 'url', readOnly: true}),
  defineField({name: 'downloadUrl', type: 'url', readOnly: true}),
  defineField({name: 'dynamicPreviewUrl', type: 'url', readOnly: true}),
  defineField({name: 'thumbnailUrl', type: 'url', readOnly: true}),
  defineField({name: 'icon', type: 'url', readOnly: true}),
  defineField({
    name: 'focalPoint',
    type: 'array',
    readOnly: true,
    of: [{type: 'number'}],
  }),
  defineField({name: 'width', type: 'number', readOnly: true}),
  defineField({name: 'height', type: 'number', readOnly: true}),
  defineField({name: 'duration', type: 'number', readOnly: true}),
  defineField({name: 'bitrate', type: 'number', readOnly: true}),
  defineField({name: 'pageCount', type: 'number', readOnly: true}),
]

export function createFrontifySchemaTypes(defaults: FrontifyPluginOptions) {
  const cdn = defaults.cdn ?? DEFAULT_CDN

  return [
    defineType({
      name: 'frontifyAsset',
      title: 'Frontify asset',
      type: 'object',
      fields: storedFields,
      components: {
        input: (props: ObjectInputProps) => <AssetInput {...props} defaults={defaults} />,
      },
      preview: {
        select: {
          title: 'title',
          filename: 'filename',
          type: 'type',
          previewUrl: 'previewUrl',
          dynamicPreviewUrl: 'dynamicPreviewUrl',
          downloadUrl: 'downloadUrl',
          thumbnailUrl: 'thumbnailUrl',
          icon: 'icon',
        },
        prepare({title, filename, type, previewUrl, dynamicPreviewUrl, downloadUrl, thumbnailUrl, icon}) {
          return {
            title: title || filename || 'Frontify asset',
            subtitle: type,
            media: frontifyPreviewMedia(
              getFrontifyPreviewImageUrl(
                {previewUrl, dynamicPreviewUrl, downloadUrl, thumbnailUrl, icon, type},
                {cdn, width: 200},
              ),
            ),
          }
        },
      },
    }),
    defineType({
      name: 'frontifyAssets',
      title: 'Frontify assets',
      type: 'array',
      of: [{type: 'frontifyAsset'}],
      components: {
        input: (props: ArrayOfObjectsInputProps) => (
          <AssetsInput {...props} defaults={defaults} />
        ),
      },
    }),
  ]
}
