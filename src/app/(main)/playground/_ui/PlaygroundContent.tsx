'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { aiImageQueries } from '@/entities/ai-image'
import { PlaygroundBilling } from '@/features/in-app-purchase'
import { PetEntryCard } from '@/features/playground-pet/ui/PetEntryCard'
import { PlaygroundCareShelf, PlaygroundPlayShelf } from '@/features/playground-tools'
import { CameraIcon, PixelArrowRightIcon } from '@/shared/assets'
import { PLAYGROUND_BILLING_ENABLED } from '@/shared/config/playground'
import { buttonVariants } from '@/shared/ui/Button'
import { FeatureIntro } from '@/shared/ui/FeatureIntro'
import {
  FeatureShowcase,
  FeatureShowcasePlaceholder,
  FeatureShowcaseTiles,
  FeatureShowcaseTilesSkeleton,
} from '@/shared/ui/FeatureShowcase'

const AI_STEPS = ['우리 아이 사진 고르기', '마음에 드는 필터 선택', '저장하고 함께 자랑하기']

export function PlaygroundContent() {
  // AI 필터와 같은 활성 목록을 사용해 관리자가 내린 예시가 계속 노출되지 않도록 한다.
  const filters = useQuery(aiImageQueries.filters())
  const previews = filters.data?.filter((filter) => filter.thumbnailUrl).slice(0, 3) ?? []

  return (
    <div className="mx-auto w-full max-w-[68rem] space-y-8 px-5 pt-6 pb-16 tab:px-8 tab:pt-10 pc:px-10">
      <FeatureIntro eyebrow="우리 아이와 함께" title="포퐁 놀이터">
        놀이 카드를 뽑고, 사진으로 남기고, 방에서 함께 놀아요.
        <br className="tab:hidden" /> 우리 아이와 함께할 작은 즐거움을 찾아보세요.
      </FeatureIntro>

      <FeatureShowcase
        headingId="playground-ai"
        label="AI PHOTO"
        icon={<CameraIcon aria-hidden className="size-5" />}
        eyebrow="사진으로 노는 시간"
        title="AI 사진 만들기"
        description={
          <>
            도트 그림부터 스티커·수채화까지.
            <br />
            우리 아이에게 어울리는 모습을 골라보세요.
          </>
        }
        actions={
          <>
            <div>
              <Link href="/ai-filter" className={buttonVariants({ width: 'full' })}>
                우리 아이 사진 만들기
                <PixelArrowRightIcon aria-hidden className="ml-2 size-4" />
              </Link>
            </div>
            <div>
              <Link
                href="/playground/memory-card"
                className={buttonVariants({ intent: 'secondary', width: 'full' })}
              >
                추억 카드 꾸미기
              </Link>
            </div>
          </>
        }
        media={
          filters.isPending ? (
            <FeatureShowcaseTilesSkeleton label="AI 필터 예시를 불러오고 있어요." />
          ) : previews.length > 0 ? (
            <FeatureShowcaseTiles
              label="AI 필터 예시"
              tiles={previews.map((filter) => ({
                key: filter.filterId,
                src: filter.thumbnailUrl!,
                alt: `${filter.name} 예시`,
                caption: filter.name,
              }))}
            />
          ) : (
            <FeatureShowcasePlaceholder />
          )
        }
        steps={AI_STEPS}
      />

      <PetEntryCard />
      <PlaygroundPlayShelf />
      <PlaygroundCareShelf />
      {PLAYGROUND_BILLING_ENABLED && <PlaygroundBilling />}
    </div>
  )
}
