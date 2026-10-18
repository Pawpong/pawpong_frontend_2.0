const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const path = require('node:path')
const cache = new Map()
function load(file) {
  const resolved = path.resolve(file)
  if (cache.has(resolved)) return cache.get(resolved)
  const exports = {}
  cache.set(resolved, exports)
  const code = ts.transpileModule(fs.readFileSync(resolved, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  new Function('exports', 'require', code)(exports, (name) =>
    name.startsWith('.') ? load(path.resolve(path.dirname(resolved), `${name}.ts`)) : require(name),
  )
  return exports
}
const model = load('src/features/playground-tools/model/checklist.ts')
const { createChecklistStore, checklistStorageKey } = load(
  'src/features/playground-tools/model/checklistStore.ts',
)
const card = load('src/features/playground-tools/model/memoryCard.ts')
const add = (state, outing, id = 'custom-123', label = '우리 아이 담요') =>
  model.changeChecklist(state, { type: 'add', outing, id, label })
function storage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }
}

test('separate outings preserve custom items and completion when switching and reloading', () => {
  let state = add(model.blankChecklist(), 'walk')
  state = model.changeChecklist(state, { type: 'toggle', outing: 'walk', id: 'custom-123' })
  state = model.changeChecklist(state, { type: 'select', outing: 'clinic' })
  const restored = model.parseChecklist(JSON.stringify(state))
  assert.equal(restored.selected, 'clinic')
  assert.deepEqual(restored.lists.walk.checked, ['custom-123'])
  assert.equal(restored.lists.clinic.custom.length, 0)
  assert.equal(model.checklistItems(restored, 'walk').at(-1).label, '우리 아이 담요')
})
test('custom removal cannot remove defaults, and uncheck retains custom items', () => {
  let state = add(model.blankChecklist(), 'walk')
  assert.strictEqual(
    model.changeChecklist(state, { type: 'remove', outing: 'walk', id: 'walk-0' }),
    state,
  )
  state = model.changeChecklist(state, { type: 'toggle', outing: 'walk', id: 'custom-123' })
  const unchecked = model.changeChecklist(state, { type: 'uncheck', outing: 'walk' })
  assert.equal(unchecked.lists.walk.checked.length, 0)
  assert.equal(unchecked.lists.walk.custom.length, 1)
  state = model.changeChecklist(state, { type: 'remove', outing: 'walk', id: 'custom-123' })
  assert.equal(state.lists.walk.custom.length, 0)
  assert.equal(state.lists.walk.checked.length, 0)
})
test('blank, duplicate, oversized and over-cap custom entries are refused without losing the list', () => {
  let state = model.blankChecklist()
  for (const label of ['', '   ', 'a'.repeat(51), '하네스와 리드줄'])
    assert.strictEqual(add(state, 'walk', 'custom-x', label), state)
  state = add(state, 'walk', 'custom-a', '  물놀이  수건  ')
  assert.equal(state.lists.walk.custom[0].label, '물놀이 수건')
  assert.strictEqual(add(state, 'walk', 'custom-b', '물놀이 수건'), state)
  for (let i = 1; i < 12; i++) state = add(state, 'walk', `custom-${i}`, `준비물 ${i}`)
  assert.equal(state.lists.walk.custom.length, 12)
  assert.strictEqual(add(state, 'walk', 'custom-over', '추가 용품'), state)
})
test('malformed device data, versions and malicious IDs cannot enter the list', () => {
  for (const raw of [null, '{broken', '[]', '{"version":2}', 'x'.repeat(30_001)])
    assert.deepEqual(model.parseChecklist(raw), model.blankChecklist())
  const raw = JSON.stringify({
    version: 1,
    selected: '__proto__',
    lists: {
      walk: {
        checked: ['walk-0', 'walk-0', 'not-found', 1],
        custom: [
          { id: '__proto__', label: 'bad' },
          { id: 'custom-ok', label: '   수건  ', custom: false },
          { id: 'custom-ok', label: '다른 이름' },
        ],
      },
    },
  })
  const parsed = model.parseChecklist(raw)
  assert.equal(parsed.selected, 'walk')
  assert.deepEqual(parsed.lists.walk.checked, ['walk-0'])
  assert.deepEqual(parsed.lists.walk.custom, [{ id: 'custom-ok', label: '수건', custom: true }])
})
test('account changes and guest mode use isolated storage; clear removes only the current owner', () => {
  const disk = storage()
  const first = createChecklistStore(disk, 'account:one')
  first.dispatch({ type: 'add', outing: 'walk', id: 'custom-one', label: '나의 담요' })
  const second = createChecklistStore(disk, 'account:two')
  second.dispatch({ type: 'toggle', outing: 'clinic', id: 'clinic-0' })
  assert.equal(createChecklistStore(disk, 'guest').getSnapshot().data.lists.walk.custom.length, 0)
  assert.equal(second.getSnapshot().data.lists.walk.custom.length, 0)
  first.dispatch({ type: 'clear' })
  assert.equal(disk.getItem(checklistStorageKey('account:one')), null)
  assert.deepEqual(
    createChecklistStore(disk, 'account:two').getSnapshot().data.lists.clinic.checked,
    ['clinic-0'],
  )
})
test('another tab update is read before edits, and clearing in another tab refreshes snapshots', () => {
  const disk = storage(),
    first = createChecklistStore(disk, 'guest'),
    second = createChecklistStore(disk, 'guest')
  first.dispatch({ type: 'toggle', outing: 'walk', id: 'walk-0' })
  second.dispatch({ type: 'toggle', outing: 'walk', id: 'walk-1' })
  first.reload()
  assert.deepEqual(first.getSnapshot().data.lists.walk.checked, ['walk-0', 'walk-1'])
  second.dispatch({ type: 'clear' })
  first.reload()
  assert.deepEqual(first.getSnapshot().data, model.blankChecklist())
})
test('blocked or full storage preserves current-screen edits and reports unsaved state honestly', () => {
  const blocked = {
    getItem() {
      throw new Error('denied')
    },
    setItem() {
      throw new Error('quota')
    },
    removeItem() {
      throw new Error('denied')
    },
  }
  const store = createChecklistStore(blocked, 'guest')
  store.dispatch({ type: 'add', outing: 'walk', id: 'custom-a', label: '수건' })
  store.dispatch({ type: 'toggle', outing: 'walk', id: 'custom-a' })
  assert.equal(store.getSnapshot().saved, false)
  assert.deepEqual(store.getSnapshot().data.lists.walk.checked, ['custom-a'])
  assert.equal(store.getSnapshot().data.lists.walk.custom.length, 1)
})
test('copy text includes completion and custom labels for the selected purpose only', () => {
  let state = add(model.blankChecklist(), 'clinic', 'custom-vet', '지난 검사 기록')
  state = model.changeChecklist(state, { type: 'select', outing: 'clinic' })
  state = model.changeChecklist(state, { type: 'toggle', outing: 'clinic', id: 'custom-vet' })
  assert.match(model.checklistText(state), /✓ 지난 검사 기록/)
  assert.match(model.checklistText(state), /^포퐁 · 병원 방문 준비함/)
  assert.doesNotMatch(model.checklistText(state), /돌아와서 닦을 수건/)
})
test('unsaved edits survive another tab update and persist once storage recovers', () => {
  const disk = storage()
  let full = false
  const flaky = {
    ...disk,
    setItem(key, value) {
      if (full) throw new Error('quota')
      disk.setItem(key, value)
    },
  }
  const store = createChecklistStore(flaky, 'guest')
  store.dispatch({ type: 'add', outing: 'walk', id: 'custom-first', label: '담요' })
  full = true
  store.dispatch({ type: 'add', outing: 'walk', id: 'custom-unsaved', label: '수건' })
  disk.removeItem(checklistStorageKey('guest'))
  store.reload()
  assert.equal(store.getSnapshot().saved, false)
  assert.equal(store.getSnapshot().data.lists.walk.custom.length, 2)
  full = false
  store.dispatch({ type: 'toggle', outing: 'walk', id: 'custom-unsaved' })
  const restored = createChecklistStore(disk, 'guest').getSnapshot()
  assert.equal(restored.saved, true)
  assert.equal(restored.data.lists.walk.custom.length, 2)
  assert.deepEqual(restored.data.lists.walk.checked, ['custom-unsaved'])
})
test('custom item IDs work without randomUUID and survive validation and reload', () => {
  const id = model.createChecklistItemId({
    getRandomValues(bytes) {
      bytes.fill(255)
      return bytes
    },
  })
  assert.match(id, /^custom-[0-9a-f]{32}$/)
  const state = add(model.blankChecklist(), 'walk', id, '인식표')
  assert.equal(model.parseChecklist(JSON.stringify(state)).lists.walk.custom[0].id, id)
})
test('memory dates validate leap years and impossible dates without UTC display drift', () => {
  assert.equal(card.validCardDate('2024-02-29'), true)
  for (const date of ['2023-02-29', '2026-04-31', '2026-13-01', 'foo', '1899-12-31'])
    assert.equal(card.validCardDate(date), false)
  assert.equal(card.formatCardDate('2026-10-07'), '2026.10.07')
  assert.equal(card.formatCardDate('oops'), '')
  const date = new Date(2026, 0, 1, 0, 15)
  assert.equal(card.todayLocalDate(date), '2026-01-01')
})
test('portrait and landscape crops stay in bounds across zoom and position extrema', () => {
  for (const [width, height] of [
    [2560, 1500],
    [1000, 2500],
    [1080, 1080],
  ]) {
    for (const zoom of [-1, 1, 1.7, 2.5, 99])
      for (const x of [-20, 0, 50, 100, 200])
        for (const y of [0, 50, 100]) {
          const crop = card.photoCrop(width, height, zoom, x, y)
          assert.ok(crop.x >= 0 && crop.y >= 0 && crop.size > 0)
          assert.ok(crop.x + crop.size <= width + 1e-8 && crop.y + crop.size <= height + 1e-8)
        }
  }
  assert.throws(() => card.photoCrop(0, 100, 1, 50, 50))
  assert.throws(() => card.photoCrop(100, 100, NaN, 50, 50))
})
test('export text is bounded by code points; filenames contain no private input or path', () => {
  assert.equal([...card.normalizeCardText('🐶'.repeat(24), 20)].length, 20)
  assert.equal(card.normalizeCardText(' 오늘\n함께  산책 ', 44), '오늘 함께 산책')
  assert.equal(card.memoryFileName('../../name'), 'pawpong-memory-today.png')
  assert.equal(card.memoryFileName('2026-10-07'), 'pawpong-memory-2026-10-07.png')
})
test('app export never falls back to unsupported Blob downloads', () => {
  assert.equal(card.memoryCardExportMode(true, false, false), 'unsupported')
  assert.equal(card.memoryCardExportMode(true, false, true), 'unsupported')
  assert.equal(card.memoryCardExportMode(true, true, false), 'share')
  assert.equal(card.memoryCardExportMode(true, true, true), 'share')
  assert.equal(card.memoryCardExportMode(false, false, true), 'download')
  assert.equal(card.memoryCardExportMode(false, true, false), 'download')
  assert.equal(card.memoryCardExportMode(false, true, true), 'share')
})
