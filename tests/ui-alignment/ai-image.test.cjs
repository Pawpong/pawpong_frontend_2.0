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
  // 로딩은 필터 카드 모양 스켈레톤으로, 안내 문구는 화면 낭독용으로 둔다.
  assert.match(studio, /<span className="sr-only">필터 목록을 불러오고 있어요\.<\/span>/)
  assert.match(studio, /<div role="status" aria-busy="true">/)
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

test('AI 사진 화면의 글자 링크는 포커스 표시와 44px 높이를 갖고 화살표 기호를 읽지 않음', () => {
  const archive = source('src/features/ai-image/ui/AiPhotoArchive.tsx')
  assert.equal((archive.match(/inline-flex min-h-11 items-center[^"]*focus-ring/g) ?? []).length, 2)
  const studio = source('src/features/ai-image/ui/AiFilterStudio.tsx')
  // 글자 화살표 대신 읽지 않는 픽셀 화살표를 쓴다.
  assert.match(studio, /보관함\s*<PixelArrowRightIcon aria-hidden/)
  assert.doesNotMatch(studio, /보관함\s*(<span aria-hidden>)?→/)
  assert.match(
    studio,
    /min-h-11 items-center text-sm font-semibold text-primary-700 underline focus-ring/,
  )
})

test('AI 필터는 모바일에서 사진 칸을 낮추고 만들기 버튼이 밀려나면 하단 메뉴 위에 같은 버튼을 띄움', () => {
  const studio = source('src/features/ai-image/ui/AiFilterStudio.tsx')
  assert.match(studio, /selectLabel="우리 아이 사진 선택"/)
  assert.match(studio, /frameClassName="aspect-\[4\/3\] tab:aspect-square"/)
  assert.match(
    studio,
    /const showFloatingCta =\s*isLoggedIn &&\s*canConvert &&\s*ctaPosition === 'below' &&\s*!ai\.isWorking &&\s*!awaitingResult &&\s*!result/,
  )
  assert.match(studio, /<div ref=\{ctaRef\}>/)
  assert.match(
    studio,
    /fixed inset-x-0 bottom-\[calc\(3\.5rem\+env\(safe-area-inset-bottom\)\)\][^"]*tab:hidden/,
  )
  // 두 버튼은 같은 문구와 같은 만들기 동작을 쓴다.
  assert.equal(studio.match(/\{generateLabel\}/g).length, 2)
  const field = source('src/shared/ui/PhotoUploadField.tsx')
  assert.match(field, /selectLabel = '참여 사진 선택'/)
  assert.match(field, /frameClassName = 'aspect-square'/)
})

test('비로그인 AI 필터 안내 칸도 로그인 상태 사진 칸과 같은 모바일 4:3 높이를 씀', () => {
  const studio = source('src/features/ai-image/ui/AiFilterStudio.tsx')
  assert.match(
    studio,
    /flex aspect-\[4\/3\] w-full flex-col items-center justify-center gap-4 rounded-xl border border-primary-200 bg-point-50 p-6 text-center tab:aspect-square/,
  )
})
