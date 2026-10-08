'use client'
import { useQuery } from '@tanstack/react-query'
import { activityConfigOptions } from '@/entities/gamification'
import { useActivitySession } from '../lib/useActivitySession'
import { ActivityDashboard } from './ActivityDashboard'

/** 계정 전환 중 이전 토큰의 세션이 다른 계정의 마이홈에 붙지 않도록 프로필 ID와 맞춰 본다. */
export function MyHomeActivity({ userId }: { userId?: string }) {
  const config = useQuery(activityConfigOptions)
  const session = useActivitySession()
  if (!config.data?.enabled || config.isError || !session || session.ownerId !== userId) return null
  return <ActivityDashboard key={session.scope} session={session} />
}
