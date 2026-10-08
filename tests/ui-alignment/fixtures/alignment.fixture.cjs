const fs = require('node:fs')
const { loadTypescript } = require('../../helpers/load-typescript.cjs')

const source = (file) => fs.readFileSync(file, 'utf8')

// 필터 조회 상태만 바꿔 가며 훅이 내놓는 화면 상태를 확인한다.
function pixelFilter(query) {
  let refetches = 0
  const { useAiPixelFilter } = loadTypescript('src/features/ai-image/lib/useAiPixelFilter.ts', {
    react: { useState: (value) => [value, () => {}], useCallback: (fn) => fn },
    '@tanstack/react-query': {
      useQuery: () => ({
        refetch: async () => {
          refetches++
        },
        ...query,
      }),
    },
    '@/entities/ai-image': { aiImageQueries: { filters: () => ({}) } },
    './useAiPixelTransform': {
      useAiPixelTransform: () => ({ transform: async () => null, phase: 'idle', isWorking: false }),
    },
  })
  return { state: useAiPixelFilter(), refetches: () => refetches }
}

module.exports = { source, pixelFilter }
