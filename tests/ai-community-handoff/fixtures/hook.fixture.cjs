function hookFixture() {
  const slots = []
  let cursor = 0
  const hooks = {
    useRef(initial) {
      const index = cursor++
      return (slots[index] ??= { current: initial })
    },
    useState(initial) {
      const index = cursor++
      if (!(index in slots)) slots[index] = initial
      return [
        slots[index],
        (next) => {
          slots[index] = typeof next === 'function' ? next(slots[index]) : next
        },
      ]
    },
    useCallback(fn) {
      return fn
    },
    useEffect(effect, deps) {
      const index = cursor++
      const previous = slots[index]
      if (!previous || deps.some((value, i) => value !== previous.deps[i])) {
        previous?.cleanup?.()
        slots[index] = { deps, cleanup: effect() }
      }
    },
  }
  return {
    hooks,
    render(fn) {
      cursor = 0
      return fn()
    },
    unmount() {
      for (const slot of slots) slot?.cleanup?.()
    },
  }
}

module.exports = { hookFixture }
