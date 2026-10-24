const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const { loadModule } = require('./helpers/load-module.cjs')

const root = path.resolve(__dirname, '..')

// 실제 Storage 처럼 저장한 키만 Object.keys 에 잡히도록 메서드는 프로토타입에 둔다
class FakeStorage {
  getItem(key) {
    return Object.hasOwn(this, key) ? this[key] : null
  }
  setItem(key, value) {
    this[key] = String(value)
  }
  removeItem(key) {
    delete this[key]
  }
}

globalThis.localStorage = new FakeStorage()
const lifecycle = loadModule(path.join(root, 'src/shared/lib/authSessionLifecycle.ts'))
const draft = loadModule(
  path.join(root, 'src/app/(main)/adoption/[id]/apply/_lib/applicationDraft.ts'),
  {
    '@/shared/lib/authSessionLifecycle': lifecycle,
  },
)

test('입양 신청서 임시저장은 글자 입력만 남기고 동의 체크는 저장하지 않는다', () => {
  const storage = new FakeStorage()
  const key = draft.applicationDraftKey('user-1', 'pet-1')
  draft.writeApplicationDraft(
    storage,
    key,
    { adoptionPlan: '주말마다 산책', familyMembers: '  ', privacyConsent: true },
    { q1: '네' },
    1000,
  )
  assert.deepEqual(draft.readApplicationDraft(storage, key, 2000), {
    values: { adoptionPlan: '주말마다 산책' },
    customAnswers: { q1: '네' },
  })
})

test('빈 신청서는 저장하지 않고, 7일이 지난 임시저장은 버린다', () => {
  const storage = new FakeStorage()
  const key = draft.applicationDraftKey('user-1', 'pet-1')
  draft.writeApplicationDraft(storage, key, { adoptionPlan: '계획' }, {}, 0)
  draft.writeApplicationDraft(storage, key, { adoptionPlan: '' }, {}, 0)
  assert.equal(storage.getItem(key), null)

  draft.writeApplicationDraft(storage, key, { adoptionPlan: '계획' }, {}, 0)
  assert.equal(draft.readApplicationDraft(storage, key, 8 * 24 * 60 * 60 * 1000), null)
  assert.equal(storage.getItem(key), null)

  storage.setItem(key, '{깨진 값')
  assert.equal(draft.readApplicationDraft(storage, key), null)
})

test('계정·분양글마다 따로 저장하고, 로그아웃하면 임시저장을 모두 지운다', () => {
  const mine = draft.applicationDraftKey('user-1', 'pet-1')
  const other = draft.applicationDraftKey('user-2', 'pet-1')
  assert.notEqual(mine, other)
  draft.writeApplicationDraft(localStorage, mine, { adoptionPlan: '계획' }, {})
  draft.writeApplicationDraft(localStorage, other, { adoptionPlan: '다른 계정' }, {})
  localStorage.setItem('pawpong:outing:v1:user-1', '{}')

  lifecycle.beginLogout()

  assert.equal(localStorage.getItem(mine), null)
  assert.equal(localStorage.getItem(other), null)
  assert.equal(localStorage.getItem('pawpong:outing:v1:user-1'), '{}')
})
