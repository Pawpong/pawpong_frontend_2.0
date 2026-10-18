const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
function load(file) {
  const { outputText } = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  })
  const module = { exports: {} }
  new Function('module', 'exports', outputText)(module, module.exports)
  return module.exports
}
const { prepareComparisonPost } = load('src/features/ai-image/lib/postAiComparison.ts')
const file = (name) => new File([name], name + '.png', { type: 'image/png' })
const choice = (before, after, enabled = true, privateBefore = false) => ({
  enabled,
  before,
  after,
  sources: [before],
  privateBefore,
})

test('비교 공개를 끄면 메타데이터뿐 아니라 업로드에서도 원본을 제외함', () => {
  const before = file('original'),
    after = file('result')
  const result = prepareComparisonPost([after, before], choice(before, after, false))
  assert.deepEqual(result.files, [after])
  assert.equal(result.aiComparison, null)
  assert.equal(result.error, null)
})
test('비교 글을 결과 전용으로 바꾸면 공개 원본을 제거하고 다른 사진은 유지함', () => {
  const result = prepareComparisonPost(
    ['original', 'extra', 'result'],
    choice('original', 'result', false),
  )
  assert.deepEqual(result.keptImageUrls, ['extra', 'result'])
  assert.equal(result.aiComparison, null)
})
test('비공개 원본은 동의 전까지 공개하지 않고 사진 인덱스는 업로드 순서를 따름', () => {
  const before = file('original'),
    after = file('result')
  const hidden = prepareComparisonPost(['extra', after], choice(before, after, false, true))
  assert.deepEqual(hidden.files, [after])
  const shared = prepareComparisonPost(['extra', after], choice(before, after, true, true))
  assert.deepEqual(shared.files, [after, before])
  assert.deepEqual(shared.aiComparison, { beforePhotoIndex: 2, afterPhotoIndex: 1 })
})
test('사진 삭제 후 인덱스를 바꾸어도 같은 원본과 결과 사진을 가리킴', () => {
  const result = prepareComparisonPost(['result', 'original'], choice('original', 'result'))
  assert.deepEqual(result.aiComparison, { beforePhotoIndex: 1, afterPhotoIndex: 0 })
})
test('비교 사진 중 하나를 제거하면 잘못된 비교 쌍을 발행하지 않음', () => {
  for (const photos of [['result'], ['original']]) {
    const result = prepareComparisonPost(photos, choice('original', 'result'))
    assert.ok(result.error)
    assert.equal(result.aiComparison, null)
    assert.ok(!result.keptImageUrls.includes('original'))
  }
})
test('원본을 교체하면 이전 원본을 공개 갤러리에 남기지 않음', () => {
  const next = file('new-original')
  const selected = { ...choice(next, 'result', true, true), sources: ['old-original', next] }
  const result = prepareComparisonPost(['old-original', 'result'], selected)
  assert.deepEqual(result.keptImageUrls, ['result'])
  assert.deepEqual(result.files, [next])
})
test('사진 열 장 제한에는 선택적으로 공개한 원본도 포함함', () => {
  const photos = Array.from({ length: 10 }, (_, i) => 'photo-' + i)
  const result = prepareComparisonPost(photos, choice(file('original'), photos[0], true, true))
  assert.ok(result.error.includes('10장'))
})
test('원본을 자동 조회하지 않고 결과와 작업 식별자만 한 번 전달함', () => {
  const { handoffFixture } = require('./ai-community-handoff/fixtures/handoff.fixture.cjs')
  const handoff = handoffFixture()
  const result = file('result')
  handoff.setPendingCommunityPhoto(result, undefined, 'owned-job', handoff.session)
  assert.deepEqual(handoff.takePendingCommunityPost('ai-photo'), {
    files: [result],
    aiComparison: null,
    jobId: 'owned-job',
  })
  assert.equal(handoff.takePendingCommunityPost('ai-photo'), null)
})
