const {
  test,
  assert,
  load,
  PetCharacterResource,
  validatePetSheetPixels,
} = require('./fixtures/core.fixture.cjs')

test('개인 캐릭터 정리는 주소와 요청을 해제하고 늦은 개인 사진을 폐기함', async () => {
  const created = [],
    revoked = []
  const resource = new PetCharacterResource({
    createObjectURL: () => {
      const url = `blob:fixture-${created.length}`
      created.push(url)
      return url
    },
    revokeObjectURL: (url) => revoked.push(url),
  })
  let signal
  assert.equal(
    await resource.load(
      async (s) => {
        signal = s
        return new Blob(['png'])
      },
      async () => {},
    ),
    'blob:fixture-0',
  )
  resource.dispose()
  resource.dispose()
  assert.equal(signal.aborted, true)
  assert.deepEqual(revoked, ['blob:fixture-0'])
  let resolve
  const delayed = resource.load(
    () => new Promise((done) => (resolve = done)),
    async () => {},
  )
  resource.dispose()
  resolve(new Blob(['late']))
  assert.equal(await delayed, null)
  assert.equal(created.length, 1)
})

test('잘못된 캐릭터는 임시 주소를 해제하고 재시도로 정상 그림을 준비함', async () => {
  const revoked = []
  let index = 0
  const resource = new PetCharacterResource({
    createObjectURL: () => `blob:fixture-${index++}`,
    revokeObjectURL: (url) => revoked.push(url),
  })
  await assert.rejects(
    resource.load(
      async () => new Blob(['png']),
      async () => {
        throw new Error('wrong dimensions')
      },
    ),
    /wrong dimensions/,
  )
  assert.deepEqual(revoked, ['blob:fixture-0'])
  assert.equal(
    await resource.load(
      async () => new Blob(['png']),
      async () => {},
    ),
    'blob:fixture-1',
  )
  resource.dispose()
  assert.deepEqual(revoked, ['blob:fixture-0', 'blob:fixture-1'])
})

test('크기가 같아도 배경과 반투명 및 깨진 격자와 빈 프레임을 거부함', () => {
  const valid = new Uint8ClampedArray(576 * 96 * 4)
  for (let frame = 0; frame < 6; frame++)
    for (let y = 40; y < 84; y++)
      for (let x = frame * 96 + 20; x < frame * 96 + 76; x++)
        valid.set([240, 220, 180, 255], (y * 576 + x) * 4)
  validatePetSheetPixels(valid)
  const opaque = valid.slice()
  for (let i = 3; i < opaque.length; i += 4) opaque[i] = 255
  assert.throws(() => validatePetSheetPixels(opaque), /전신/)
  const partial = valid.slice()
  partial[(40 * 576 + 20) * 4 + 3] = 128
  assert.throws(() => validatePetSheetPixels(partial), /투명/)
  const blurry = valid.slice()
  blurry[(40 * 576 + 21) * 4] = 239
  assert.throws(() => validatePetSheetPixels(blurry), /격자/)
  assert.throws(() => validatePetSheetPixels(new Uint8ClampedArray(valid.length)), /프레임/)
})
