import { createPageMetadata } from '@/shared/lib/metadata'

import { Suspense } from 'react'
import { requireAuth } from '@/features/auth/server'
import { RootHeader } from '@/shared/ui'
import { MyHomeContent } from './_ui/MyHomeContent'

export const metadata = createPageMetadata({ title: '마이홈', noIndex: true })

interface MyHomePageProps {
  searchParams: Promise<{ tab?: string | string[] }>
}

// MyHomeContent 가 ?tab= 을 읽으므로(useSearchParams) Suspense 경계가 필요하다
const MyHomePage = async ({ searchParams }: MyHomePageProps) => {
  const { tab } = await searchParams
  const selectedTab = Array.isArray(tab) ? tab[0] : tab
  // 비로그인이면 프로필 조회 실패 화면을 거치지 않고 바로 로그인으로 보낸다 (채팅과 같은 방식)
  await requireAuth(selectedTab ? `/home?tab=${encodeURIComponent(selectedTab)}` : '/home')

  return (
    <>
      {/* 앱 하단 탭 '마이' 루트 머리 — 앱은 여기서 로고 바를 숨긴다. 웹은 로고 바가 맡아 숨긴다 */}
      <RootHeader title="마이" className="page-shell hidden in-data-app:flex" />
      <Suspense>
        <MyHomeContent />
      </Suspense>
    </>
  )
}

export default MyHomePage
