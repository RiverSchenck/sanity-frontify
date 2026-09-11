import {defineType, defineField} from 'sanity'

import {frontifyPreviewMedia, getFrontifyPreviewImageUrl, getStudioCdn} from '../plugins/frontify-dam'

export default defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {source: 'title', maxLength: 96},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      title: 'Excerpt',
      rows: 3,
    }),
    defineField({
      name: 'hero',
      type: 'frontifyAsset',
      title: 'Hero',
      description: 'Featured asset from Frontify.',
    }),
    defineField({
      name: 'gallery',
      type: 'frontifyAssets',
      title: 'Gallery',
      description: 'Additional assets from Frontify.',
    }),
    defineField({
      name: 'cover',
      type: 'image',
      title: 'Cover',
      description: 'Image stored in Sanity.',
      options: {hotspot: true},
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        {type: 'block'},
        {type: 'frontifyAsset', title: 'Frontify'},
        {type: 'image', title: 'Image', options: {hotspot: true}},
      ],
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      title: 'Published at',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      previewUrl: 'hero.previewUrl',
      dynamicPreviewUrl: 'hero.dynamicPreviewUrl',
      downloadUrl: 'hero.downloadUrl',
      thumbnailUrl: 'hero.thumbnailUrl',
      icon: 'hero.icon',
      type: 'hero.type',
      cover: 'cover',
    },
    prepare({title, previewUrl, dynamicPreviewUrl, downloadUrl, thumbnailUrl, icon, type, cover}) {
      return {
        title: title || 'Untitled article',
        media:
          frontifyPreviewMedia(
            getFrontifyPreviewImageUrl(
              {previewUrl, dynamicPreviewUrl, downloadUrl, thumbnailUrl, icon, type},
              {cdn: getStudioCdn(), width: 200},
            ),
          ) || cover,
      }
    },
  },
})
