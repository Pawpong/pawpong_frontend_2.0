'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { PixelArrowRightIcon } from '@/shared/assets'
import { buttonVariants } from '@/shared/ui/Button'
import { FeatureShowcase, FeatureShowcaseTiles } from '@/shared/ui/FeatureShowcase'
import { PET_ROOM_PREVIEWS, PET_STEPS } from '../constants/pet-intro'
import { petConfigOptions } from '../lib/usePetController'

export function PetEntryCard() {
  const config = useQuery(petConfigOptions)
  if (!config.data?.enabled || config.isError) return null
  return (
    <FeatureShowcase
      headingId="playground-pet"
      badge="사진에서 시작되는 작은 일상"
      title="내 반려동물 키우기"
      description={
        <>
          사진으로 나만의 도트 반려동물을 만들고 함께 성장해요.
          <br />
          완성된 그림을 고르고 이름을 지으면, 매일 돌볼 수 있어요.
        </>
      }
      actions={
        <div>
          <Link href="/playground/pet" className={buttonVariants({ width: 'full' })}>
            키우기 시작하기
            <PixelArrowRightIcon aria-hidden className="ml-2 size-4" />
          </Link>
        </div>
      }
      media={<FeatureShowcaseTiles label="반려동물 방 소품 예시" tiles={PET_ROOM_PREVIEWS} />}
      steps={PET_STEPS}
    />
  )
}
