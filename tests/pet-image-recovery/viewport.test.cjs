const { test } = require('node:test')
const assert = require('node:assert/strict')
const { loadTypescript } = require('../helpers/load-typescript.cjs')

function fixture({ missing = false, observer = true } = {}) {
  const variables = new Map(),
    listeners = new Map(),
    observed = [],
    effects = []
  let height = 350.2,
    resize,
    disconnected = false
  const device = { getBoundingClientRect: () => ({ height }) }
  const root = {
    querySelector: () => (missing ? null : device),
    style: {
      setProperty: (key, value) => variables.set(key, value),
      removeProperty: (key) => variables.delete(key),
    },
  }
  const { usePetDeviceViewport } = loadTypescript(
    'src/features/playground-pet/lib/usePetDeviceViewport.ts',
    {
      react: { useRef: () => ({ current: root }), useEffect: (callback) => effects.push(callback) },
    },
    {
      ResizeObserver: observer
        ? class {
            constructor(callback) {
              resize = callback
            }
            observe(element) {
              observed.push(element)
            }
            disconnect() {
              disconnected = true
            }
          }
        : undefined,
      window: {
        addEventListener: (name, callback) => listeners.set(name, callback),
        removeEventListener: (name) => listeners.delete(name),
      },
    },
  )
  usePetDeviceViewport()
  const cleanup = effects[0]()
  return {
    variables,
    listeners,
    observed,
    device,
    cleanup,
    resize: () => resize?.(),
    changeHeight: (value) => {
      height = value
    },
    disconnected: () => disconnected,
  }
}

test('방 높이를 올림 처리하고 오류 안내로 높이가 바뀌면 스크롤 여백도 갱신함', () => {
  const app = fixture()
  assert.equal(app.variables.get('--pet-device-height'), '351px')
  assert.deepEqual(app.observed, [app.device])
  app.changeHeight(456.6)
  app.resize()
  assert.equal(app.variables.get('--pet-device-height'), '457px')
})

test('화면을 떠나면 크기 관찰과 창 이벤트 및 로컬 스타일을 정리함', () => {
  const app = fixture()
  app.cleanup()
  assert.equal(app.disconnected(), true)
  assert.equal(app.listeners.size, 0)
  assert.equal(app.variables.size, 0)
})

test('크기 관찰 기능이 없는 환경에서도 창 크기 변경을 반영함', () => {
  const app = fixture({ observer: false })
  app.changeHeight(290)
  app.listeners.get('resize')()
  assert.equal(app.variables.get('--pet-device-height'), '290px')
  app.cleanup()
})

test('방 요소가 없으면 관찰이나 이벤트 등록을 하지 않음', () => {
  const app = fixture({ missing: true })
  assert.equal(app.variables.size, 0)
  assert.equal(app.listeners.size, 0)
  assert.equal(app.observed.length, 0)
})
