'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { PawPrintIcon, ProfileStarIcon } from '@/shared/assets'
import { buttonVariants } from '@/shared/ui/Button'
import { petConfigOptions } from '../lib/usePetController'

export function PetEntryCard() {
  const config = useQuery(petConfigOptions)
  if (!config.data?.enabled || config.isError) return null
  return (
    <section
      aria-labelledby="playground-pet"
      className="grid items-center gap-6 rounded-2xl border border-secondary-200 bg-point-50 p-5 tab:grid-cols-[1fr_auto] tab:p-8"
    >
      <div>
        <p className="text-xs font-semibold text-brand">사진에서 시작되는 작은 일상</p>
        <h2 id="playground-pet" className="mt-2 font-cafe24 text-2xl text-neutral-850">
          내 반려동물 키우기
        </h2>
        <p className="mt-3 text-sm leading-6 text-neutral-700">
          사진으로 나만의 도트 반려동물을 만들고 함께 성장해요.
          <br />
          완성된 그림을 고르고 이름을 지으면, 매일 돌볼 수 있어요.
        </p>
        <div className="mt-5">
          <Link href="/playground/pet" className={buttonVariants()}>
            키우기 시작하기
          </Link>
        </div>
      </div>
      <div className="hidden items-center gap-3 text-brand tab:flex" aria-hidden>
        <ProfileStarIcon className="size-7" />
        <PawPrintIcon className="size-24 text-secondary-500" />
        <ProfileStarIcon filled className="size-5" />
      </div>
    </section>
  )
}
