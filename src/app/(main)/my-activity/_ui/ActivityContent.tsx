'use client'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useMe } from '@/features/auth'
import { usePurchases } from '@/features/in-app-purchase'
import { activityConfigOptions } from '@/entities/gamification'
import { ActivityDashboard } from '@/features/gamification'
export function ActivityContent() {
  const config = useQuery(activityConfigOptions)
  const { me, isLoggedIn } = useMe()
  const { generation } = usePurchases()
  if (config.isPending)
    return (
      <p role="status" className="p-10 text-center">
        배지함을 준비하고 있어요.
      </p>
    )
  if (config.isError || !config.data?.enabled)
    return (
      <p role="status" className="p-10 text-center">
        활동 기능은 현재 개발 환경에서 확인 중이에요.
      </p>
    )
  if (!isLoggedIn)
    return (
      <div className="p-10 text-center">
        <p>내 배지함은 로그인 후 볼 수 있어요.</p>
        <Link href="/login?returnUrl=%2Fmy-activity">로그인하기</Link>
      </div>
    )
  if (!me?.userId)
    return (
      <p role="status" className="p-10 text-center">
        로그인한 계정의 배지함을 확인하고 있어요.
      </p>
    )
  return (
    <ActivityDashboard
      key={`${me.userId}:${generation}`}
      ownerId={me.userId}
      generation={generation}
    />
  )
}
