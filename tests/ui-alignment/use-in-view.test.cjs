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

test('useInView 는 요소가 화면 밖으로 나가면 false, 돌아오거나 요소가 사라지면 true 를 돌려줌', () => {
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
  const { useInView } = loadTypescript(
    'src/shared/lib/useInView.ts',
    { react },
    { IntersectionObserver: FakeObserver },
  )
  const run = () => render(() => useInView())

  let [setNode, inView] = run()
  assert.equal(inView, true)
  assert.equal(observers.length, 0)

  const node = { id: 'cta' }
  setNode(node)
  ;[setNode, inView] = run()
  assert.equal(observers.length, 1)
  assert.deepEqual(observers[0].observed, [node])

  observers[0].callback([{ isIntersecting: false }])
  ;[setNode, inView] = run()
  assert.equal(inView, false)

  observers[0].callback([{ isIntersecting: true }])
  ;[setNode, inView] = run()
  assert.equal(inView, true)

  observers[0].callback([{ isIntersecting: false }])
  setNode(null)
  ;[setNode, inView] = run()
  assert.equal(inView, true)
  assert.equal(observers[0].disconnected, true)
})
