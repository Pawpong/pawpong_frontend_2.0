'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { isEligiblePetImage } from '@/entities/playground-pet'
import { buttonVariants } from '@/shared/ui/Button'
import { inPetSession, usePetSession } from '../lib/usePetSession'
import { petConfigOptions } from '../lib/usePetController'

/** 생성 필터 이름이나 클라이언트 픽셀 판정은 사용하지 않는다. */
export function PetResultLink({ sourceJobId }: { sourceJobId: string }) {
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
    !eligibility.data ||
    eligibility.isError
  )
    return null
  return (
    <div className="mt-3">
      <Link
        href={`/playground/pet?sourceJobId=${encodeURIComponent(sourceJobId)}`}
        className={buttonVariants({ intent: 'secondary', width: 'full' })}
      >
        이 그림으로 반려동물 키우기
      </Link>
    </div>
  )
}
