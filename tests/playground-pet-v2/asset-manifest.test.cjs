const { test, assert, petAsset, loadPetAssets } = require('./fixtures/core.fixture.cjs')

test('에셋 경로는 외부 주소와 상위 경로를 거부하고 전체 소품 규격을 검사함', async () => {
  const descriptor = {
    url: '/playground/pet/v2/toy_bone.png',
    width: 64,
    height: 64,
    logicalWidth: 24,
    logicalHeight: 24,
  }
  assert.equal(petAsset({ assets: { toy_bone: descriptor } }, 'toy_bone'), descriptor)
  assert.equal(
    petAsset({ assets: { bad: { ...descriptor, url: 'https://external.test/image' } } }, 'bad'),
    null,
  )
  assert.equal(
    petAsset({ assets: { bad: { ...descriptor, url: '/playground/pet/v2/../secret' } } }, 'bad'),
    null,
  )
  assert.equal(petAsset({ assets: {} }, 'unknown'), null)
  const previousFetch = global.fetch
  try {
    global.fetch = async () => ({
      ok: true,
      json: async () => ({
        world: { width: 320, height: 224, wallHeight: 128 },
        assets: { toy_bone: descriptor },
      }),
    })
    await assert.rejects(loadPetAssets(new AbortController().signal), /목록/)
  } finally {
    global.fetch = previousFetch
  }
})
