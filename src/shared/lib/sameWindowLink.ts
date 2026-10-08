/** 새 탭, 다운로드, 같은 문서의 위치 이동은 작성 화면을 떠나지 않는다. */
export function sameWindowLinkHref(
  event: Pick<
    MouseEvent,
    'button' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey' | 'defaultPrevented'
  >,
  anchor: Pick<HTMLAnchorElement, 'href' | 'target' | 'hasAttribute'>,
  currentHref: string,
): string | null {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    (anchor.target && anchor.target !== '_self') ||
    anchor.hasAttribute('download')
  )
    return null
  const current = new URL(currentHref)
  const target = new URL(anchor.href, current)
  if (!['http:', 'https:'].includes(target.protocol)) return null
  if (
    target.origin === current.origin &&
    target.pathname === current.pathname &&
    target.search === current.search
  )
    return null
  return target.origin === current.origin
    ? `${target.pathname}${target.search}${target.hash}`
    : target.href
}
