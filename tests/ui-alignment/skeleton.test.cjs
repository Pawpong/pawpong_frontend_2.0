const { test } = require('node:test')
const assert = require('node:assert/strict')
const { renderToStaticMarkup } = require('react-dom/server')
const { createElement } = require('react')
const { loadTypescript } = require('../helpers/load-typescript.cjs')
const { source } = require('./fixtures/alignment.fixture.cjs')

const cn = (...values) => values.filter(Boolean).join(' ')
const { GridSkeleton } = loadTypescript('src/shared/ui/Skeleton.tsx', { '@/shared/lib/cn': { cn } })

test('격자 스켈레톤은 실제 격자 틀에 빈 칸을 채우고 안내 문구는 낭독용으로만 둠', () => {
  const html = renderToStaticMarkup(
    createElement(GridSkeleton, {
      label: '불러오는 중이에요.',
      count: 3,
      className: 'grid grid-cols-3',
    }),
  )
  assert.match(html, /role="status"/)
  assert.match(html, /aria-busy="true"/)
  assert.match(html, /<span class="sr-only">불러오는 중이에요\.<\/span>/)
  assert.match(html, /<div class="grid grid-cols-3">/)
  assert.equal(html.match(/aspect-square/g).length, 3)
  assert.match(html, /motion-reduce:animate-none/)
})

test('마이홈 글 격자와 AI 사진 보관함은 로딩 중에 같은 격자의 스켈레톤을 보여줌', () => {
  assert.match(
    source('src/shared/ui/ListState.tsx'),
    /loadingFallback \?\? <AsyncState status="loading"/,
  )
  const grid = source('src/app/(main)/home/_ui/HomePostGrid.tsx')
  assert.match(grid, /loadingFallback=\{\s*<GridSkeleton[\s\S]*?className=\{gridClasses\}/)
  assert.match(grid, /<div className=\{gridClasses\}>/)
  assert.match(
    source('src/features/ai-image/ui/AiPhotoArchive.tsx'),
    /<GridSkeleton\s+label="보관함을 불러오는 중이에요\."/,
  )
})
