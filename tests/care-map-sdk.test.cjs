const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')

const source = ts.transpileModule(
  fs.readFileSync('src/features/care-map/lib/kakao-map.ts', 'utf8'),
  {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  },
).outputText

function createLoader() {
  const scripts = [],
    timers = new Map()
  let timerId = 0
  const window = {
    // 공유 SDK가 먼저 초기화되어 있어도 지도 SDK 준비 완료로 오인하지 않는다.
    Kakao: { isInitialized: () => true },
    setTimeout(fn) {
      const id = ++timerId
      timers.set(id, fn)
      return id
    },
    clearTimeout(id) {
      timers.delete(id)
    },
  }
  const document = {
    createElement: () => ({
      remove() {
        this.removed = true
      },
    }),
    head: {
      appendChild(script) {
        scripts.push(script)
      },
    },
  }
  const exports = {}
  new Function('exports', 'window', 'document', source)(exports, window, document)
  return { ...exports, window, scripts, timers }
}

test('concurrent map mounts load one script and wait for the maps callback', async () => {
  const loader = createLoader()
  const first = loader.loadKakaoMaps('public-test-key'),
    second = loader.loadKakaoMaps('public-test-key')
  assert.equal(first, second)
  assert.equal(loader.scripts.length, 1)
  assert.match(loader.scripts[0].src, /autoload=false/)
  let done
  const maps = {
    load(callback) {
      done = callback
    },
  }
  loader.window.kakao = { maps }
  loader.scripts[0].onload()
  maps.Map = function Map() {}
  done()
  assert.equal(await first, maps)
  assert.equal(loader.timers.size, 0)
  assert.equal(await loader.loadKakaoMaps('public-test-key'), maps)
  assert.equal(loader.scripts.length, 1)
})

test('a failed script can be retried without reloading the page', async () => {
  const loader = createLoader()
  const failed = loader.loadKakaoMaps('public-test-key')
  loader.scripts[0].onerror()
  await assert.rejects(failed, /지도를 불러오지 못했어요/)
  assert.equal(loader.scripts[0].removed, true)
  const retried = loader.loadKakaoMaps('public-test-key')
  assert.equal(loader.scripts.length, 2)
  loader.scripts[1].onerror()
  await assert.rejects(retried)
})

test('an SDK callback that never arrives times out and releases the pending load', async () => {
  const loader = createLoader()
  const pending = loader.loadKakaoMaps('public-test-key')
  loader.timers.values().next().value()
  await assert.rejects(pending)
  assert.equal(loader.timers.size, 0)
  const retried = loader.loadKakaoMaps('public-test-key')
  assert.equal(loader.scripts.length, 2)
  loader.scripts[1].onerror()
  await assert.rejects(retried)
})
