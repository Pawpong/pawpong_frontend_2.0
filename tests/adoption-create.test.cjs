const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const root = path.resolve('src/app/(main)/adoption/create/_lib')
const load = (file) => {
  const filename = path.join(root, file + '.ts')
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021 },
  })
  const loaded = { exports: {} }
  new Function('require', 'module', 'exports', outputText)(
    (id) => (id.startsWith('./') ? load(id.slice(2)) : require(id)),
    loaded,
    loaded.exports,
  )
  return loaded.exports
}
const { adoptionCreateSchema: schema } = load('schema')
const { createAdoptionDefaultValues } = load('defaultValues')
const { BREEDING_ENV_IMAGE_MAX } = load('constants')
const { toCreatePetPostingRequest: create } = load('toCreatePetPostingRequest')
const { toSavePetPostingDraftRequest: draft } = load('toSavePetPostingDraftRequest')
const { fromPetPostingDraft: restore } = load('fromPetPostingDraft')
const photos = { pet: ['pet.jpg'], parents: [], representativeIndex: 0 }
const valid = () => ({
  ...createAdoptionDefaultValues(),
  name: '봄이',
  breed: '푸들',
  gender: 'female',
  birthDate: '2025-01-01',
  price: '300,000',
  introduction: '사람을 좋아해요',
  vaccinationStatus: 'incomplete',
  vaccinationReason: '일정 확인 중',
  geneticTestStatus: 'incomplete',
  geneticTestReason: '검사 예정',
})

test('optional parent section starts empty', () => {
  assert.deepEqual(createAdoptionDefaultValues().parents, [])
})
test('environment photo picker matches the single-photo server field', () => {
  assert.equal(BREEDING_ENV_IMAGE_MAX, 1)
})
test('parent birthday is optional and omitted from create/draft DTOs', () => {
  const values = valid()
  values.parents = [{ relationship: 'mother', name: '엄마', breed: '푸들', birthDate: '' }]
  const parsed = schema.parse(values)
  assert.equal('birthDate' in create(parsed, photos).parentPetSnapshots[0], false)
  assert.equal('birthDate' in draft(values, photos).parentPetSnapshots[0], false)
})
test('provided parent dates must still be valid and relations cannot repeat', () => {
  const values = valid()
  values.parents = [
    { relationship: 'mother', name: '엄마', breed: '푸들', birthDate: '2025-02-31' },
  ]
  assert.equal(schema.safeParse(values).success, false)
  values.parents[0].birthDate = ''
  values.parents.push({ ...values.parents[0] })
  assert.equal(schema.safeParse(values).success, false)
})
test('draft preserves comma-formatted prices, including zero', () => {
  assert.equal(draft(valid(), photos).price, 300000)
  assert.equal(draft({ ...valid(), price: '0' }, photos).price, 0)
  assert.equal('price' in draft({ ...valid(), price: '' }, photos), false)
})
test('health records are conditional and incomplete reasons are required', () => {
  const values = valid()
  assert.equal(schema.safeParse(values).success, true)
  assert.equal(schema.safeParse({ ...values, vaccinationReason: '' }).success, false)
  assert.equal(schema.safeParse({ ...values, vaccinationStatus: 'completed' }).success, false)
  values.vaccinationStatus = 'completed'
  values.vaccinations = [{ name: '접종 기록', date: '2025-06-01', dose: '1' }]
  const request = create(schema.parse(values), photos)
  assert.equal(request.vaccinationRecords[0].round, 1)
  assert.equal('vaccinationIncompleteReason' in request, false)
})

test('incomplete status preserves existing records and reason in create and draft round trip', () => {
  const values = valid()
  values.vaccinations = [{ name: '백신 A', date: '2025-06-01', dose: '2' }]
  values.geneticTests = [
    { testName: '검사 A', date: '2025-06-01', institution: '병원', result: '결과서 내용' },
  ]
  const request = create(schema.parse(values), photos)
  assert.equal(request.vaccinationRecords.length, 1)
  assert.equal(request.vaccinationIncompleteReason, values.vaccinationReason)
  assert.equal(request.geneticTestRecords.length, 1)
  assert.equal(request.geneticTestIncompleteReason, values.geneticTestReason)
  const restored = restore(draft(values, photos))
  assert.deepEqual(restored.vaccinations, values.vaccinations)
  assert.deepEqual(restored.geneticTests, values.geneticTests)
})

test('partial records are validated even when not completed; empty rows are omitted', () => {
  const values = valid()
  values.vaccinations = [{ name: '백신 A', date: '', dose: '' }]
  assert.equal(schema.safeParse(values).success, false)
  values.vaccinations = [{ name: '', date: '', dose: '' }]
  assert.deepEqual(create(schema.parse(values), photos).vaccinationRecords, [])
  assert.equal(schema.safeParse({ ...values, vaccinationStatus: 'completed' }).success, false)
})

test('dose must be a positive integer; removing all records produces explicit empty arrays', () => {
  for (const dose of ['0', '-1', '1.5', 'abc']) {
    assert.equal(
      schema.safeParse({ ...valid(), vaccinations: [{ name: 'A', date: '2025-06-01', dose }] })
        .success,
      false,
    )
  }
  const request = create(schema.parse(valid()), photos)
  assert.deepEqual(request.vaccinationRecords, [])
  assert.deepEqual(request.geneticTestRecords, [])
  assert.deepEqual(restore(draft(valid(), photos)).vaccinations, [])
})
