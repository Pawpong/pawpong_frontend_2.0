/** 첫 등장 순서를 유지하면서 getKey가 같은 항목을 제거한다. */
const dedupeBy = <T, K>(items: readonly T[], getKey: (item: T) => K): T[] => {
  const seen = new Set<K>()

  return items.filter((item) => {
    const key = getKey(item)
    if (seen.has(key)) return false

    seen.add(key)
    return true
  })
}

export { dedupeBy }
