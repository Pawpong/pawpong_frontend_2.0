'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { PixelArrowRightIcon } from '@/shared/assets'
import { buttonVariants } from '@/shared/ui/Button'
import { FeatureShowcase, FeatureShowcaseTiles } from '@/shared/ui/FeatureShowcase'
import { petConfigOptions } from '../lib/usePetController'

// 방에 실제로 놓이는 도트 소품으로 키우기 화면을 미리 보여준다.
const ROOM_PREVIEWS = [
  { key: 'bed', src: '/playground/pet/v2/bed_basket.png', caption: '포근한 바구니 침대' },
  { key: 'toy', src: '/playground/pet/v2/toy_ball.png', caption: '함께 노는 공' },
  { key: 'plant', src: '/playground/pet/v2/plant_flower.png', caption: '방을 채우는 꽃 화분' },
].map((item) => ({ ...item, alt: `${item.caption} 소품`, pixelated: true }))

const PET_STEPS = ['우리 아이 사진 올리기', '도트 친구 고르고 이름 짓기', '매일 돌보고 방 꾸미기']

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
      media={<FeatureShowcaseTiles label="반려동물 방 소품 예시" tiles={ROOM_PREVIEWS} />}
      steps={PET_STEPS}
    />
  )
}
