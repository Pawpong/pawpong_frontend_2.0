'use client'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { activityConfigOptions, BreederLevelBadge, getActivity } from '@/entities/gamification'
import { useActivitySession } from '../lib/useActivitySession'

/**
 * 마이홈 이름 옆 내 레벨. 본인 화면이라 공개 레벨 플래그와 무관하게 보인다.
 * 나의 활동 화면과 같은 key 를 써서 그 화면의 대조 결과가 바로 반영되고 요청도 한 번만 나간다.
 * 마이홈에서 나의 활동 탭을 뺐으므로 이 배지가 나의 활동으로 가는 입구다.
 */
export function MyLevelBadge({ userId }: { userId?: string }) {
  const config = useQuery(activityConfigOptions)
  const session = useActivitySession()
  const enabled = !!config.data?.enabled && !config.isError && session?.ownerId === userId
  const view = useQuery({
    queryKey: ['gamification', 'private', session?.scope],
    queryFn: ({ signal }) => getActivity(session!, signal),
    enabled: enabled && !!session,
    retry: false,
    throwOnError: false,
  })
  if (!enabled || !view.data?.level) return null
  return (
    <Link href="/my-activity" className="inline-flex shrink-0 rounded focus-ring">
      <BreederLevelBadge level={view.data.level} iconOnly showFamily />
      <span className="sr-only">나의 활동 보기</span>
    </Link>
  )
}
