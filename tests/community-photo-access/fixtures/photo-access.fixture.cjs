const { loadTypescript: load } = require('../../helpers/load-typescript.cjs')
const { NextRequest } = require('next/server')
const model = load('src/entities/community/model/communityPhoto.ts')
const body = load('src/entities/community/api/communityPhotoRead.server.ts')
const file = 'review-00000000-0000-4000-8000-000000000000.png'
const postId = 'a'.repeat(24)
const pixel = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aXioAAAAASUVORK5CYII=',
  'base64',
)
const photoResponse = () =>
  new Response(pixel, {
    headers: { 'Content-Type': 'image/png', 'Content-Length': String(pixel.length) },
  })

function fixture(upstream = photoResponse) {
  const calls = []
  const handler = load(
    'src/app/api/community/photos/[...segments]/route.ts',
    {
      '@/entities/community/server': { ...model, ...body },
      '@/shared/lib/server': {
        ...load('src/shared/lib/server/developmentCommunityHost.ts'),
        ...load('src/shared/lib/server/sameOrigin.ts'),
      },
    },
    {
      fetch: async (...args) => {
        calls.push(args)
        return upstream(...args)
      },
    },
  )
  const request = (
    segments = ['posts', postId, file],
    headers = {},
    host = 'dev.pawpong.kr',
    signal,
  ) =>
    handler.GET(
      new NextRequest(`https://${host}/api/community/photos/${segments.join('/')}?ignored=secret`, {
        headers,
        signal,
      }),
      { params: Promise.resolve({ segments }) },
    )
  return { request, calls }
}

module.exports = { load, model, body, file, postId, pixel, photoResponse, fixture }
