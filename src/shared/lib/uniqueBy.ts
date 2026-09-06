/**
 * 배열에서 key 기준 중복을 제거한다(첫 항목 우선 유지, 순서 보존).
 *
 * 주 용도: 무한스크롤(useInfiniteQuery)로 받은 `pages`를 flatMap 으로 합칠 때
 * 백엔드 페이지네이션이 페이지 경계에서 같은 항목을 겹쳐 내려주면
 * 리스트에 동일 id 가 두 번 들어가 React "two children with the same key" 경고가 난다.
 * 렌더 직전에 이 함수로 걸러 중복 key 를 원천 차단한다.
 *
 * @example
 * const posts = uniqueBy(data?.pages.flatMap((p) => p.items) ?? [], (p) => p.postId)
 */
export const uniqueBy = <T>(items: T[], getKey: (item: T) => string | number): T[] => {
  const seen = new Set<string | number>()
  const result: T[] = []
  for (const item of items) {
    const key = getKey(item)
    if (seen.has(key)) continue
    seen.add(key)
    result.push(item)
  }
  return result
}
