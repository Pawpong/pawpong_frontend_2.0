import Image from 'next/image'
import Link from 'next/link'
import { PopularBadge } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { formatBirthDate } from '@/shared/lib/formatBirthDate'
import { ArrowRightIcon } from '@/shared/assets'
import { GENDER_LABEL, type AdoptionPetDetail } from '@/shared/types'
import { ADOPTION_CARD_STATUS } from '@/entities/adoption'
import { CHAT_CONTENT_WIDTH } from '../_lib/constants'

interface PetInfoCardProps {
  detail: AdoptionPetDetail
}

const PetInfoCard = ({ detail }: PetInfoCardProps) => {
  const title = `${detail.breed} ${detail.name} | ${GENDER_LABEL[detail.gender]} ${formatBirthDate(detail.birthDate)}`
  const statusLabel = ADOPTION_CARD_STATUS[detail.status].label

  return (
    <section className="shrink-0 border-b border-neutral-150 bg-white px-4 py-3 tab:px-12 pc:px-5">
      {/* 태블릿 이하: 컴팩트 (medium) — 작은 이미지 + 품종 1줄, 소개·상세보기 없음 */}
      <Link
        href={`/adoption/${detail.petId}`}
        className="flex w-full items-center gap-3 rounded-lg pc:hidden"
      >
        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-point-50">
          {detail.primaryPhotoUrl && (
            <Image
              src={detail.primaryPhotoUrl}
              alt={detail.name}
              fill
              sizes="56px"
              className="object-cover"
            />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-neutral-850">
          <span className="text-xs font-semibold text-primary-600">{statusLabel}</span>
          <span className="truncate text-sm leading-[1.5] font-semibold">{title}</span>
          <span className="text-xs font-medium text-neutral-500">분양 정보 보기</span>
        </div>
        <ArrowRightIcon className="size-5 shrink-0 text-neutral-500" />
      </Link>

      {/* PC: full (large) — 큰 이미지 + 2줄 소개 + 입양 상세보기 */}
      <div className={cn(CHAT_CONTENT_WIDTH, 'hidden items-center gap-4 pc:flex')}>
        <div className="relative h-20 w-[6.625rem] shrink-0 overflow-hidden rounded-lg bg-point-50">
          {detail.primaryPhotoUrl && (
            <Image
              src={detail.primaryPhotoUrl}
              alt={detail.name}
              fill
              sizes="106px"
              className="object-cover"
            />
          )}
          {detail.isPopular && <PopularBadge variant="default" className="absolute top-2 left-2" />}
        </div>

        {/* 정보 */}
        <div className="flex min-w-0 flex-1 items-center justify-between gap-4 self-stretch">
          <div className="flex max-w-[33.4375rem] min-w-0 flex-col gap-1 text-neutral-850">
            <div className="flex min-w-0 items-center gap-3">
              <span className="shrink-0 text-sm font-semibold text-primary-600">{statusLabel}</span>
              <span className="truncate text-base leading-[1.5] font-semibold">{title}</span>
            </div>
            <p className="line-clamp-2 text-sm leading-[1.5] font-medium text-neutral-700">
              {detail.description}
            </p>
          </div>

          <Link
            href={`/adoption/${detail.petId}`}
            className="flex shrink-0 items-center rounded-lg px-2 py-1 text-primary-600 transition-colors hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            <span className="text-sm leading-[1.5] font-semibold">입양 상세보기</span>
            <ArrowRightIcon className="size-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export { PetInfoCard }
