'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { aiImageQueries } from '@/entities/ai-image'
import { PlaygroundBilling } from '@/features/in-app-purchase'
import { PetEntryCard } from '@/features/playground-pet/ui/PetEntryCard'
import { PlaygroundToolShelf } from '@/features/playground-tools'
import { PawPrintIcon, PixelArrowRightIcon } from '@/shared/assets'
import { PLAYGROUND_BILLING_ENABLED } from '@/shared/config/playground'
import { buttonVariants } from '@/shared/ui/Button'
import { FeatureIntro } from '@/shared/ui/FeatureIntro'

export function PlaygroundContent() {
  // AI 필터와 같은 활성 목록을 사용해 관리자가 내린 예시가 계속 노출되지 않도록 한다.
  const filters = useQuery(aiImageQueries.filters())
  const previews = filters.data?.filter((filter) => filter.thumbnailUrl).slice(0, 3) ?? []

  return (
    <div className="mx-auto w-full max-w-[68rem] space-y-8 px-5 pt-6 pb-16 tab:px-8 tab:pt-10 pc:px-10">
      <FeatureIntro eyebrow="우리 아이와 함께" title="포퐁 놀이터">
        산책을 준비하고, 사진으로 놀고, 하루를 기록해요.
        <br className="tab:hidden" /> 우리 아이와 함께할 작은 즐거움을 찾아보세요.
      </FeatureIntro>

      <PlaygroundToolShelf />

      <section
        aria-labelledby="playground-ai"
        className="overflow-hidden rounded-2xl border border-secondary-200 bg-base-white"
      >
        <div className="grid items-center gap-7 p-5 tab:p-8 lap:grid-cols-[1fr_1.1fr] lap:gap-10">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-point-100 px-3 py-1.5 text-xs font-semibold text-neutral-850">
              <PawPrintIcon aria-hidden className="size-3.5 text-secondary-600" />
              사진으로 노는 시간
            </span>
            <h2
              id="playground-ai"
              className="mt-4 font-cafe24 text-2xl leading-snug text-neutral-850 tab:text-3xl"
            >
              AI 사진 만들기
            </h2>
            <p className="mt-3 text-sm leading-6 break-keep text-neutral-700">
              도트 그림부터 스티커·수채화까지.
              <br />
              우리 아이에게 어울리는 모습을 골라보세요.
            </p>
            <div className="mt-5 inline-flex">
              <Link href="/ai-filter" className={buttonVariants()}>
                우리 아이 사진 만들기
                <PixelArrowRightIcon aria-hidden className="ml-2 size-4" />
              </Link>
            </div>
          </div>

          {previews.length > 0 ? (
            <div className="grid min-w-0 grid-cols-3 gap-2 tab:gap-3" aria-label="AI 필터 예시">
              {previews.map((filter) => (
                <figure key={filter.filterId} className="min-w-0">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary-50">
                    <Image
                      src={filter.thumbnailUrl!}
                      alt={`${filter.name} 예시`}
                      fill
                      loading="eager"
                      sizes="(max-width: 767px) 28vw, (max-width: 1023px) 26vw, 150px"
                      className="object-contain p-1.5"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs leading-5 font-medium break-keep text-neutral-700">
                    {filter.name}
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div
              className="flex items-center justify-center gap-5 rounded-xl bg-point-50 px-6 py-10"
              aria-hidden
            >
              <PawPrintIcon className="size-10 -rotate-12 text-secondary-300" />
              <PawPrintIcon className="size-20 rotate-12 text-secondary-500" />
              <PawPrintIcon className="size-10 -rotate-12 text-secondary-300" />
            </div>
          )}
        </div>

        <ol className="grid gap-3 border-t border-secondary-100 bg-secondary-50/50 p-5 text-sm text-neutral-850 tab:grid-cols-3 tab:gap-5 tab:px-8">
          {['우리 아이 사진 고르기', '마음에 드는 필터 선택', '저장하고 함께 자랑하기'].map(
            (step, index) => (
              <li key={step} className="flex items-center gap-2.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-point-200 text-xs font-semibold">
                  {index + 1}
                </span>
                {step}
              </li>
            ),
          )}
        </ol>
      </section>

      <PetEntryCard />
      {PLAYGROUND_BILLING_ENABLED && <PlaygroundBilling />}
    </div>
  )
}
