function effectHarness() {
  const slots = [],
    effects = [],
    cleanups = []
  let cursor = 0,
    pending = []
  const react = {
    useMemo: (fn) => fn(),
    useState(initial) {
      const index = cursor++
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial
      return [
        slots[index],
        (value) => (slots[index] = typeof value === 'function' ? value(slots[index]) : value),
      ]
    },
    useRef(initial) {
      const index = cursor++
      if (!(index in slots)) slots[index] = { current: initial }
      return slots[index]
    },
    useEffect(fn, dependencies) {
      const index = cursor++
      if (
        !effects[index] ||
        dependencies.some((value, i) => !Object.is(value, effects[index][i]))
      ) {
        effects[index] = dependencies
        pending.push(() => {
          cleanups[index]?.()
          cleanups[index] = fn()
        })
      }
    },
  }
  return {
    react,
    render(fn) {
      cursor = 0
      pending = []
      return fn()
    },
    flush() {
      pending.forEach((fn) => fn())
      pending = []
    },
    unmount() {
      cleanups.forEach((fn) => fn?.())
    },
  }
}

function elementNodes(node) {
  if (!node || typeof node !== 'object') return []
  if (Array.isArray(node)) return node.flatMap(elementNodes)
  return [node, ...elementNodes(node.props?.children)]
}

module.exports = { effectHarness, elementNodes }
