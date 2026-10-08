const { aiSessionFixture, load, deferred, token } = require('./ai-session.fixture.cjs')
const { hookFixture } = require('./hook.fixture.cjs')

function transformSessionFixture(overrides = {}) {
  const h = aiSessionFixture()
  const react = hookFixture()
  const calls = { upload: [], request: [], status: [], image: [] }
  const recovery = load('src/features/ai-image/lib/aiImageRecovery.ts', {
    '@/shared/api/unwrap': { ApiError: h.ApiError },
  })
  const job = {
    jobId: 'fixture-job',
    status: 'succeeded',
    resultImageUrl: '/synthetic.png',
    resultObjectKey: 'ai-image/result/synthetic.png',
  }
  const track =
    (key, fallback) =>
    async (...args) => {
      calls[key].push(args)
      return (overrides[key] ?? fallback)(...args)
    }
  const { useAiPixelTransform } = load('src/features/ai-image/lib/useAiPixelTransform.ts', {
    react: react.hooks,
    '@/shared/lib/authReadSession': h.session,
    '@/entities/ai-image': {
      uploadAiImageSource: track('upload', () => ({
        inputObjectKey: 'ai-image/source/synthetic.png',
      })),
      requestAiImageGeneration: track('request', () => job),
      getAiImageGeneration: track('status', () => job),
      getAiImageGenerationImage: track('image', () => new Blob(['photo'])),
    },
    './aiImageRecovery': {
      ...recovery,
      waitForAiImage: overrides.wait ?? (async () => {}),
      readAiImageWithRetry: (read) => read(10000),
    },
  })
  return {
    ...h,
    calls,
    job,
    recovery,
    render: () => react.render(useAiPixelTransform),
    unmount: react.unmount,
  }
}
const input = {
  file: new File(['source'], 'source.png', { type: 'image/png' }),
  filterId: 'synthetic',
}
module.exports = { transformSessionFixture, input, deferred, token }
