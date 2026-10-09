'use client'

import { useQuery } from '@tanstack/react-query'
import { profileQueries } from '@/entities/profile'
import { MyHomeActivity } from '@/features/gamification'
import { NavigationBar } from '@/shared/ui'

/** 마이홈 탭에서 옮겨 온 나의 활동. 이름 앞 레벨 배지와 커뮤니티의 활동 단계 진입점이 여기로 온다. */
const MyActivityContent = () => {
  // 계정 전환 중 이전 세션이 붙지 않게 MyHomeActivity 가 내 프로필 ID 와 세션 소유자를 맞춰 본다
  const { data: myProfile } = useQuery({ ...profileQueries.me(), throwOnError: false })

  return (
    <div className="flex w-full flex-col">
      <NavigationBar title="나의 활동" backHref="/home" />
      <MyHomeActivity userId={myProfile?.userId} />
    </div>
  )
}

export { MyActivityContent }
