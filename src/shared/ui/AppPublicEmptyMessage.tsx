'use client'

import { useEffect, useState, type ReactNode } from 'react'

/** 앱 공개 권한 때문에 비어 있는 목록을 일반 웹의 빈 목록과 구분해서 안내한다. */
export function AppPublicEmptyMessage({ children }: { children: ReactNode }) {
  const [isApp, setIsApp] = useState(false)
  useEffect(() => {
    const detect = () =>
      setIsApp(Boolean((window as Window & { ReactNativeWebView?: unknown }).ReactNativeWebView))
    detect()
    window.addEventListener('pawpong:app-ready', detect)
    return () => window.removeEventListener('pawpong:app-ready', detect)
  }, [])
  if (!isApp) return children
  return (
    <>
      <span className="block">이 목록에 표시할 앱 공개 콘텐츠가 없어요.</span>
      <span className="mt-2 block max-w-sm text-xs leading-5 text-neutral-500">
        앱은 작성자가 공개를 허락한 게시물·사진·브리더를 보여드려요. 다른 회원의 콘텐츠는 해당
        작성자의 허락이 확인된 뒤 표시됩니다.
      </span>
    </>
  )
}
