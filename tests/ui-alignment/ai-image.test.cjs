const { test } = require('node:test')
const assert = require('node:assert/strict')
const { source, pixelFilter } = require('./fixtures/alignment.fixture.cjs')

test('필터 목록을 아직 못 받았거나 실패하면 필터 없음과 구분하고 다시 시도할 수 있음', () => {
  assert.equal(pixelFilter({ data: undefined, isError: false }).state.filtersState, 'loading')
  const failed = pixelFilter({ data: undefined, isError: true, isFetching: false })
  assert.equal(failed.state.filtersState, 'error')
  assert.equal(failed.state.isAvailable, false)
  failed.state.retryFilters()
  assert.equal(failed.refetches(), 1)
  assert.equal(pixelFilter({ data: [], isError: false }).state.filtersState, 'ready')
  const kept = pixelFilter({ data: [{ filterId: 'a' }], isError: true })
  assert.equal(kept.state.filtersState, 'ready')
  assert.equal(kept.state.selectedFilterId, 'a')
})

test('AI 사진 화면은 공통 상태 블록으로 로딩과 실패를 보여주고 이동 위치를 고정 헤더 아래로 둠', () => {
  const studio = source('src/features/ai-image/ui/AiFilterStudio.tsx')
  assert.match(studio, /<AsyncState status="loading" message="필터 목록을 불러오고 있어요\." \/>/)
  assert.match(studio, /status="error"[\s\S]{0,120}onRetry=\{ai\.retryFilters\}/)
  assert.match(studio, /aria-labelledby="ai-filter-heading" className="min-w-0 scroll-mt-24"/)
  assert.match(studio, /\.closest\('section'\)/)
  assert.match(studio, /id="ai-archive-heading" className="scroll-mt-24/)
})

test('원본 비교 편집은 오류 색 토큰과 공통 재시도 블록과 44px 파일 선택을 씀', () => {
  const editor = source('src/features/ai-image/ui/PostAiComparisonEditor.tsx')
  assert.doesNotMatch(editor, /text-red-500|focus-within:ring/)
  assert.match(editor, /text-error-500/)
  assert.match(
    editor,
    /<AsyncState\s+status="error"[\s\S]{0,160}onRetry=\{\(\) => void archive\.refetch\(\)\}/,
  )
  assert.match(editor, /min-h-11 cursor-pointer[^"]*focus-within:outline-primary-500/)
})
