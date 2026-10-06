'use client'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { activityConfigOptions } from '@/entities/gamification'
export function ActivityEntry() {
  const config = useQuery(activityConfigOptions)
  if (!config.data?.enabled || config.isError) return null
  return (
    <Link
      href="/my-activity"
      className="mb-4 inline-flex rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900"
    >
      나의 도트 배지함
    </Link>
  )
}
