const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')

const source = ts.transpileModule(fs.readFileSync('src/shared/lib/useImageCarousel.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText

// Execute the real hook with persistent state and render-phase update settling.
// Effects are not flushed: a changed photo must be correct before the first commit.
function mount(images = ['a', 'b', 'c'], initialIndex = 0) {
  const slots = []
  let cursor = 0
  let dirty = false
  const hooks = {
    useState(initial) {
      const slot = cursor++
      if (!(slot in slots)) slots[slot] = typeof initial === 'function' ? initial() : initial
      return [
        slots[slot],
        (next) => {
          const value = typeof next === 'function' ? next(slots[slot]) : next
          if (!Object.is(slots[slot], value)) dirty = true
          slots[slot] = value
        },
      ]
    },
    useCallback(fn) {
      return fn
    },
    useEffect() {},
  }
  const loaded = { exports: {} }
  new Function('require', 'module', 'exports', source)(
    (name) => {
      assert.equal(name, 'react')
      return hooks
    },
    loaded,
    loaded.exports,
  )
  return {
    render(nextImages = images, nextInitialIndex = initialIndex) {
      images = nextImages
      initialIndex = nextInitialIndex
      for (let attempt = 0; attempt < 25; attempt++) {
        cursor = 0
        dirty = false
        const value = loaded.exports.useImageCarousel(images, initialIndex)
        if (!dirty) return value
      }
      assert.fail('Carousel did not settle within the React render limit')
    },
  }
}

test('opens at the requested photo and keeps navigation across unchanged props', () => {
  const app = mount(['a', 'b', 'c'], 1)
  assert.equal(app.render().currentIndex, 1)
  app.render().handleNext()
  assert.equal(app.render(['a', 'b', 'c'], 1).currentIndex, 2)
  app.render().setCurrentIndex(0)
  assert.equal(app.render().currentIndex, 0)
})

test('opening another initial photo updates before effects and can return to the first', () => {
  const app = mount()
  app.render().handleNext()
  assert.equal(app.render().currentIndex, 1)
  assert.equal(app.render(['a', 'b', 'c'], 2).currentIndex, 2)
  assert.equal(app.render(['a', 'b', 'c'], 0).currentIndex, 0)
})

test('previous and next wrap at both ends', () => {
  const app = mount()
  app.render().handlePrev()
  assert.equal(app.render().currentIndex, 2)
  app.render().handleNext()
  assert.equal(app.render().currentIndex, 0)
})

test('removing photos clamps selection and growing the list does not revive it', () => {
  const app = mount(['a', 'b', 'c'], 2)
  assert.equal(app.render(['a']).currentIndex, 0)
  assert.equal(app.render(['a', 'new-b', 'new-c']).currentIndex, 0)
  app.render().setCurrentIndex(99)
  assert.equal(app.render().currentIndex, 2)
  app.render().setCurrentIndex(-1)
  assert.equal(app.render().currentIndex, 0)
})

test('empty and single-photo lists always retain index zero', () => {
  for (const images of [[], ['a']]) {
    const app = mount(images, 5)
    assert.equal(app.render().currentIndex, 0)
    app.render().handlePrev()
    assert.equal(app.render().currentIndex, 0)
    app.render().handleNext()
    assert.equal(app.render().currentIndex, 0)
  }
})

test('invalid initial indices settle at a valid whole-photo index', () => {
  for (const [initial, expected] of [
    [-2, 0],
    [20, 2],
    [1.5, 1],
    [NaN, 0],
    [Infinity, 0],
  ]) {
    assert.equal(mount(['a', 'b', 'c'], initial).render().currentIndex, expected)
  }
})

test('arrow keys navigate photos but leave editable fields alone', () => {
  const app = mount()
  let prevented = 0
  const event = (key, editable = false) => ({
    key,
    target: { closest: () => (editable ? {} : null) },
    preventDefault: () => prevented++,
  })
  app.render().handleKeyDown(event('ArrowRight'))
  assert.equal(app.render().currentIndex, 1)
  app.render().handleKeyDown(event('ArrowLeft', true))
  assert.equal(app.render().currentIndex, 1)
  assert.equal(prevented, 1)
})
