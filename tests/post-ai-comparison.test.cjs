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

test('turning comparison off excludes the original from the upload, not only the metadata', () => {
  const before = file('original'),
    after = file('result')
  const result = prepareComparisonPost([after, before], choice(before, after, false))
  assert.deepEqual(result.files, [after])
  assert.equal(result.aiComparison, null)
  assert.equal(result.error, null)
})
test('editing a comparison to result-only removes the public original and keeps unrelated photos', () => {
  const result = prepareComparisonPost(
    ['original', 'extra', 'result'],
    choice('original', 'result', false),
  )
  assert.deepEqual(result.keptImageUrls, ['extra', 'result'])
  assert.equal(result.aiComparison, null)
})
test('a privately fetched original remains private until enabled, and indices follow API upload order', () => {
  const before = file('original'),
    after = file('result')
  const hidden = prepareComparisonPost(['extra', after], choice(before, after, false, true))
  assert.deepEqual(hidden.files, [after])
  const shared = prepareComparisonPost(['extra', after], choice(before, after, true, true))
  assert.deepEqual(shared.files, [after, before])
  assert.deepEqual(shared.aiComparison, { beforePhotoIndex: 2, afterPhotoIndex: 1 })
})
test('reindexing after photo deletion still points at the same before and after photos', () => {
  const result = prepareComparisonPost(['result', 'original'], choice('original', 'result'))
  assert.deepEqual(result.aiComparison, { beforePhotoIndex: 1, afterPhotoIndex: 0 })
})
test('removing either comparison photo blocks publishing a misleading pair', () => {
  for (const photos of [['result'], ['original']]) {
    const result = prepareComparisonPost(photos, choice('original', 'result'))
    assert.ok(result.error)
    assert.equal(result.aiComparison, null)
    assert.ok(!result.keptImageUrls.includes('original'))
  }
})
test('replacing the original never leaves the previous original in the public gallery', () => {
  const next = file('new-original')
  const selected = { ...choice(next, 'result', true, true), sources: ['old-original', next] }
  const result = prepareComparisonPost(['old-original', 'result'], selected)
  assert.deepEqual(result.keptImageUrls, ['result'])
  assert.deepEqual(result.files, [next])
})
test('the ten-photo limit includes the optional original', () => {
  const photos = Array.from({ length: 10 }, (_, i) => 'photo-' + i)
  const result = prepareComparisonPost(photos, choice(file('original'), photos[0], true, true))
  assert.ok(result.error.includes('10장'))
})
test('handoff keeps the job reference without fetching or including a private original', () => {
  const handoff = load('src/features/ai-image/lib/pendingCommunityPhoto.ts')
  const result = file('result')
  handoff.setPendingCommunityPhoto(result, undefined, 'owned-job')
  assert.deepEqual(handoff.takePendingCommunityPost(), {
    files: [result],
    aiComparison: null,
    jobId: 'owned-job',
  })
  assert.equal(handoff.takePendingCommunityPost(), null)
})
