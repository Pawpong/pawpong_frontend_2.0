'use client'

import { useEffect } from 'react'
import { APP_UA_FLAGS } from './appFlags'

/**
 * 루트 레이아웃의 첫 페인트 스크립트가 붙인 앱 표시(<html data-app> 등)를 마운트 뒤에 한 번 더 붙인다.
 * 하이드레이션이 깨져 React 가 화면을 처음부터 다시 그리면 <html> 의 속성을 모두 지우는데,
 * 그러면 앱에서 숨겨야 할 사이트 푸터 같은 웹 전용 UI(in-data-app:hidden)가 앱에 다시 보이고
 * 상세 쌓기(hasNativeStack)도 꺼진다. 판단식은 레이아웃과 같은 APP_UA_FLAGS 를 쓴다.
 */
export function AppFlagBridge() {
  useEffect(() => {
    const { dataset } = document.documentElement
    for (const [marker, key] of APP_UA_FLAGS) {
      if (navigator.userAgent.includes(marker)) dataset[key] = ''
    }
  }, [])
  return null
}
