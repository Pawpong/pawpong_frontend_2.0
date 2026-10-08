function hooks() {
  const cells = [],
    effects = new Map(),
    scheduled = new Map()
  let index = 0
  return {
    react: {
      useState(initial) {
        const position = index++
        if (!(position in cells))
          cells[position] = typeof initial === 'function' ? initial() : initial
        return [
          cells[position],
          (value) => {
            cells[position] = typeof value === 'function' ? value(cells[position]) : value
          },
        ]
      },
      useRef(initial) {
        const position = index++
        return (cells[position] ??= { current: initial })
      },
      useEffect(fn, deps) {
        const position = index++,
          previous = effects.get(position)
        if (!previous || deps.some((value, key) => value !== previous.deps[key]))
          scheduled.set(position, { fn, deps })
      },
    },
    render(fn) {
      index = 0
      const tree = fn()
      scheduled.forEach(({ fn, deps }, position) => {
        effects.get(position)?.cleanup?.()
        effects.set(position, { deps, cleanup: fn() })
      })
      scheduled.clear()
      return tree
    },
    unmount() {
      effects.forEach((effect) => effect.cleanup?.())
    },
  }
}

function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes)
  if (!tree || typeof tree !== 'object') return []
  return [tree, ...nodes(tree.props?.children)]
}

module.exports = { hooks, nodes }
