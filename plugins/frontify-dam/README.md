# Frontify DAM (local)

Pick Frontify assets in Studio. The document stores Frontify ids and CDN URLs; the file is never copied into Sanity. Do not use `type: 'image'` — that uploads the binary to Sanity’s CDN.

```
Finder → stored JSON on the document → frontend renders Frontify URLs
```

## Schema

| Type | Use |
| --- | --- |
| `frontifyAsset` | One asset |
| `frontifyAssets` | Gallery (de-duped by Frontify id) |

Stored on each asset: the full Frontify Finder payload (`id`, `externalId`, `title`, `description`, `creator`, `createdAt`, `type`, `author`, `expiresAt`, `alternativeText`, `isDecorative`, `licenses`, `copyright`, `tags`, `customMetadata`, `filename`, `extension`, `size`, `previewUrl`, `downloadUrl`, `dynamicPreviewUrl`, `thumbnailUrl`, `icon`, `focalPoint`, `width`, `height`, `duration`, `bitrate`, `pageCount`). Nested object arrays get Sanity `_key`s on write. Keep these read-only, not `hidden` — if every child field is hidden, Studio omits the whole input.

## Config

```ts
frontifyPlugin({
  domain: 'https://demo.frontify.com',
  cdn: 'preview', // or 'dynamic' — read-time, no re-pick needed
  // filters: [{key: 'object_type', values: ['IMAGE'], inverted: false}],
})
```

Field `options` can override `domain`, `filters`, `allowMultiSelect`, and `cdn`. Finder is opened with `permanentDownloadUrls: true`.

`cdn` chooses which stored URL Studio (and `getFrontifyUrl` by default) uses:

- `preview` (default) → `previewUrl`
- `dynamic` → `dynamicPreviewUrl` plus transform params (Studio passes a width)

Studio thumbnails use `getFrontifyPreviewImageUrl`: `thumbnailUrl` or `icon` (Frontify’s generic file image), then an image `previewUrl`. Audio/video `previewUrl` is the media file, not an `<img>`.

## Frontend

```ts
import {getFrontifyPreviewImageUrl, getFrontifyUrl} from './plugins/frontify-dam'

getFrontifyUrl(hero)
getFrontifyUrl(hero, {cdn: 'dynamic', width: 800, format: 'webp'})
```

Document list previews should use the image helper so audio/files don’t put an `.mp3` in an `<img>`:

```ts
frontifyPreviewMedia(getFrontifyPreviewImageUrl(hero, {cdn: getStudioCdn(), width: 200}))
```

## Limitations

- No Sanity hotspot, crop, LQIP, or `@sanity/image-url`
- URLs are a snapshot at pick time; `id` is the join key if the DAM asset changes
- Finder auth runs in the browser against the Frontify domain
- Local plugin — not npm `@frontify/sanity-plugin-frontify` (that copies files into Sanity)
