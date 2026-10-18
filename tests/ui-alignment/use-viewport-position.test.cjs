const { test } = require('node:test')
const assert = require('node:assert/strict')
const { loadTypescript } = require('../helpers/load-typescript.cjs')

// 훅 하나만 돌리는 작은 React 대역. 상태 변경 뒤 다시 렌더하고, 의존성이 바뀐 효과만 실행·정리한다.
function hookRunner() {
  const states = []
  const effects = []
  let index = 0
  let effectIndex = 0
  const react = {
    useState: (initial) => {
      const i = index++
      if (!(i in states)) states[i] = initial
      return [states[i], (value) => (states[i] = value)]
    },
    useEffect: (effect, deps) => {
      const i = effectIndex++
      const previous = effects[i]
      const changed = !previous || deps.some((dep, j) => dep !== previous.deps[j])
      if (changed) {
        previous?.cleanup?.()
        effects[i] = { deps, cleanup: effect() }
      }
    },
  }
  const render = (hook) => {
    index = 0
    effectIndex = 0
    return hook()
  }
  return { react, render }
}

test('useViewportPosition 은 요소가 아래·안·위 어디에 있는지 따라가고 요소가 사라지면 안으로 봄', () => {
  const observers = []
  class FakeObserver {
    constructor(callback) {
      this.callback = callback
      this.observed = []
      this.disconnected = false
      observers.push(this)
    }
    observe(node) {
      this.observed.push(node)
    }
    disconnect() {
      this.disconnected = true
    }
  }
  const { react, render } = hookRunner()
  const { useViewportPosition } = loadTypescript(
    'src/shared/lib/useViewportPosition.ts',
    { react },
    { IntersectionObserver: FakeObserver },
  )
  const run = () => render(() => useViewportPosition())

  let [setNode, position] = run()
  assert.equal(position, 'inside')
  assert.equal(observers.length, 0)

  const node = { id: 'cta' }
  setNode(node)
  ;[setNode, position] = run()
  assert.deepEqual(observers[0].observed, [node])

  // 아직 화면 아래에 있음 → 모바일 하단 버튼을 띄울 자리
  observers[0].callback([{ isIntersecting: false, boundingClientRect: { top: 1200 } }])
  ;[setNode, position] = run()
  assert.equal(position, 'below')

  observers[0].callback([{ isIntersecting: true, boundingClientRect: { top: 300 } }])
  ;[setNode, position] = run()
  assert.equal(position, 'inside')

  // 버튼을 지나 아래 내용까지 내려감 → 위로 지나감
  observers[0].callback([{ isIntersecting: false, boundingClientRect: { top: -80 } }])
  ;[setNode, position] = run()
  assert.equal(position, 'above')

  setNode(null)
  ;[setNode, position] = run()
  assert.equal(position, 'inside')
  assert.equal(observers[0].disconnected, true)
})
