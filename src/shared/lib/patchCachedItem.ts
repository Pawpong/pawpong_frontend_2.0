/**
 * 쿼리 캐시에 담긴 항목을 캐시 형태와 무관하게 갈아끼운다.
 * 캐시에 들어있는 형태는 네 가지 — 무한 목록(pages), 페이지 응답(items), 배열, 단일 객체.
 *
 * apply는 "항목 하나"를 받아 교체 대상이면 새 값을, 아니면 받은 값을 그대로 돌려준다.
 * 대상 판별(타입 가드 + id 비교)은 호출부 책임이다.
 */
const patchCachedItem = (data: unknown, apply: (value: unknown) => unknown): unknown => {
  if (Array.isArray(data)) return data.map(apply)
  if (typeof data !== 'object' || data === null) return data

  if ('pages' in data && Array.isArray(data.pages)) {
    return { ...data, pages: data.pages.map((page) => patchCachedItem(page, apply)) }
  }
  if ('items' in data && Array.isArray(data.items)) {
    return { ...data, items: data.items.map(apply) }
  }
  return apply(data)
}

export { patchCachedItem }
