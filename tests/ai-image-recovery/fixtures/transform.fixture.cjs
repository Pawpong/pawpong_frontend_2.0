const { load, recovery, job } = require('./core.fixture.cjs')

function mount(overrides = {}) {
  const slots = [],
    cleanups = [],
    calls = { upload: [], request: [], status: [], image: [] }
  let cursor = 0
  const wrap =
    (key, fallback) =>
    async (...args) => {
      calls[key].push(args)
      return (overrides[key] ?? fallback)(...args)
    }
  const api = {
    uploadAiImageSource: wrap('upload', () => ({ inputObjectKey: 'ai-image/source/fixture.png' })),
    requestAiImageGeneration: wrap('request', () => job()),
    getAiImageGeneration: wrap('status', () => job('succeeded')),
    getAiImageGenerationImage: wrap('image', () => new Blob(['fixture-result'])),
  }
  const hooks = {
    useState(initial) {
      const i = cursor++
      if (!(i in slots)) slots[i] = initial
      return [
        slots[i],
        (value) => {
          slots[i] = value
        },
      ]
    },
    useRef(initial) {
      const i = cursor++
      if (!(i in slots)) slots[i] = { current: initial }
      return slots[i]
    },
    useCallback(fn) {
      return fn
    },
    useEffect(fn) {
      const i = cursor++
      if (!(i in slots)) {
        slots[i] = true
        cleanups.push(fn())
      }
    },
  }
  const { useAiPixelTransform } = load('src/features/ai-image/lib/useAiPixelTransform.ts', {
    react: hooks,
    '@/entities/ai-image': api,
    './aiImageRecovery': recovery,
  })
  return {
    calls,
    render() {
      cursor = 0
      return useAiPixelTransform()
    },
    unmount() {
      cleanups.forEach((cleanup) => cleanup?.())
    },
  }
}

module.exports = { mount }
