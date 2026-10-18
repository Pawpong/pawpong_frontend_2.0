'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { isEligiblePetImage } from '@/entities/playground-pet'
import { buttonVariants } from '@/shared/ui/Button'
import { inPetSession, usePetSession } from '../lib/usePetSession'
import { petConfigOptions } from '../lib/usePetController'
import { cn } from '@/shared/lib/cn'

/** 생성 필터 이름이나 클라이언트 픽셀 판정은 사용하지 않는다. */
export function PetResultLink({
  sourceJobId,
  className,
}: {
  sourceJobId: string
  className?: string
}) {
  const session = usePetSession()
  const config = useQuery(petConfigOptions)
  const eligibility = useQuery({
    queryKey: ['playground-pet', 'private', session?.scope, 'eligibility', sourceJobId],
    queryFn: ({ signal }) =>
      session ? inPetSession(session, () => isEligiblePetImage(sourceJobId, signal)) : false,
    enabled: !!session && config.data?.enabled === true && !config.isError,
    retry: false,
    throwOnError: false,
    gcTime: 0,
    staleTime: 0,
  })
  if (
    !config.data?.enabled ||
    config.isError ||
    !session ||
    eligibility.isPending ||
    eligibility.isError ||
    typeof eligibility.data !== 'boolean'
  )
    return null
  const eligible = eligibility.data
  return (
    <div className={cn('mt-3', className)}>
      <Link
        href={
          eligible
            ? `/playground/pet?sourceJobId=${encodeURIComponent(sourceJobId)}`
            : `/ai-filter?purpose=pet-sprite-v1&sourceJobId=${encodeURIComponent(sourceJobId)}`
        }
        className={buttonVariants({ intent: 'secondary', width: 'full' })}
      >
        {eligible ? '이 캐릭터로 시작하기' : '이 사진으로 캐릭터 만들기'}
      </Link>
      {!eligible && (
        <p className="mt-2 text-center text-xs text-neutral-700">
          사진을 고른 뒤 만들기를 누르면 AI 이용 횟수 1회를 사용해요.
        </p>
      )}
    </div>
  )
}
