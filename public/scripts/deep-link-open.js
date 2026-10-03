// 공유 랜딩의 기본 링크 동작을 유지하며 앱 실행 실패 시 다운로드 주소로 이동한다.
;(() => {
  const link = document.getElementById('open-pawpong-app')
  if (!link) return

  const android = /android/i.test(navigator.userAgent)
  const ios =
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (/macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1)
  const storeUrl = android ? link.dataset.androidStore : ios ? link.dataset.iosStore : ''
  const fallbackUrl = storeUrl || link.dataset.webUrl
  let timer

  const cancel = () => {
    window.clearTimeout(timer)
    timer = undefined
  }

  link.addEventListener('click', (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return
    cancel()
    // 기본 href 이동을 취소하지 않아 앱 실행에 필요한 직접적인 사용자 클릭을 유지한다.
    timer = window.setTimeout(() => {
      timer = undefined
      if (document.visibilityState === 'visible' && fallbackUrl) window.location.assign(fallbackUrl)
    }, 1800)
  })

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') cancel()
  })
  window.addEventListener('pagehide', cancel)
  // 대기 중 사용자가 웹 보기나 다운로드를 직접 선택했다면 예약된 이동은 취소한다.
  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('a') : null
    if (target && target !== link) cancel()
  })
})()
