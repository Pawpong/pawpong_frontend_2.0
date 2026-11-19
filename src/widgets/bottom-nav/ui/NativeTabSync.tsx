'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BOTTOM_NAV } from '@/shared/config'
import { useMe } from '@/features/auth'
import { useRoutePathname } from '@/shared/lib/useRoutePathname'
import { shouldShowBottomNav } from '../model/visibility'
import { useChatUnreadCount } from '../model/useChatUnreadCount'
import {
  NATIVE_MESSAGE,
  hasNativeTabBar,
  postNativeMessage,
  subscribeNativeMessage,
} from '@/shared/lib/nativeBridge'
import { buildTabConfig } from '../model/tabConfig'

/**
 * 앱이 하단 탭 바를 직접 그릴 때(PawpongTabs/) 웹과 앱의 탭 상태를 맞춘다. 화면에는 아무것도 그리지 않는다.
 * - 웹 → 앱 TAB_CONFIG: 탭 목록·라벨·아이콘 그림 (열 때 한 번 — 탭 구성의 원본은 웹이다)
 * - 웹 → 앱 TAB_STATE: 지금 탭, 탭 바를 보여도 되는 화면인지, 채팅 안 읽은 수, 마이홈 프로필 사진
 * - 앱 → 웹 NAVIGATE_TAB: 탭을 누르면 그 화면으로, 지금 탭을 다시 누르면 맨 위로
 */
const NativeTabSync = () => {
  const pathname = useRoutePathname()
  // 로그인·가입처럼 웹 하단바가 없는 화면도 '숨겨라'를 알려야 하므로 루트 레이아웃에 둔다
  const visible = shouldShowBottomNav(pathname)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { me } = useMe()
  const profileImageUrl = me?.profileImageUrl ?? null
  const chatUnread = useChatUnreadCount() // [refactored] 웹 하단바와 같은 조회를 훅으로
  const isChatRoom = pathname === '/chat' && searchParams.has('roomId')
  const activeHref = BOTTOM_NAV.find((item) => item.isActive(pathname))?.href ?? null

  useEffect(() => {
    if (hasNativeTabBar()) postNativeMessage(buildTabConfig())
  }, [])

  useEffect(() => {
    if (!hasNativeTabBar()) return
    postNativeMessage({
      type: NATIVE_MESSAGE.TAB_STATE,
      href: activeHref,
      visible: visible && !isChatRoom,
      chatUnread,
      // 앱 탭 바의 마이홈 칸에 그릴 프로필 사진 — 앱은 상대 주소를 모르므로 절대 주소로 보낸다
      avatarUrl: profileImageUrl && new URL(profileImageUrl, window.location.origin).href,
    })
  }, [activeHref, visible, isChatRoom, chatUnread, profileImageUrl])

  useEffect(() => {
    if (!hasNativeTabBar()) return
    return subscribeNativeMessage(NATIVE_MESSAGE.NAVIGATE_TAB, ({ href }) => {
      if (typeof href !== 'string' || !BOTTOM_NAV.some((item) => item.href === href)) return
      if (href === activeHref) window.scrollTo({ top: 0, behavior: 'smooth' })
      else router.push(href)
    })
  }, [activeHref, router])

  return null
}

export { NativeTabSync }
