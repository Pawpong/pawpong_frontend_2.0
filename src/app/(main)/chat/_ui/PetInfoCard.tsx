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
    <div className="bg-white px-4 py-1 tab:px-12 pc:px-5 pc:py-3">
      {/* 태블릿 이하: 컴팩트 (medium) — 작은 이미지 + 품종 1줄, 소개·상세보기 없음 */}
      <div className="flex w-full items-center gap-4 pc:hidden">
        <div className="relative h-[4.0625rem] w-[5.4375rem] shrink-0 overflow-hidden rounded bg-neutral-300">
          {detail.primaryPhotoUrl && (
            <Image
              src={detail.primaryPhotoUrl}
              alt={detail.name}
              fill
              sizes="87px"
              className="object-cover"
            />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1 text-neutral-850">
          <span className="text-sm leading-[1.5] font-bold">{statusLabel}</span>
          <span className="truncate text-sm leading-[1.5] font-medium">{title}</span>
        </div>
      </div>

      {/* PC: full (large) — 큰 이미지 + 2줄 소개 + 입양 상세보기 */}
      <div className={cn(CHAT_CONTENT_WIDTH, 'hidden items-center gap-7 pc:flex')}>
        <div className="relative h-[6.25rem] w-[8.333rem] shrink-0 overflow-hidden rounded-lg bg-neutral-300">
          {detail.primaryPhotoUrl && (
            <Image
              src={detail.primaryPhotoUrl}
              alt={detail.name}
              fill
              sizes="134px"
              className="object-cover"
            />
          )}
          {detail.isPopular && (
            <PopularBadge variant="default" className="absolute top-3.5 left-4" />
          )}
        </div>

        {/* 정보 */}
        <div className="flex min-w-0 flex-1 items-end justify-between gap-4 self-stretch">
          <div className="flex h-full w-[33.4375rem] max-w-full flex-col items-start justify-between text-neutral-850">
            <div className="flex items-center gap-4">
              <span className="shrink-0 text-base leading-[1.5] font-bold">{statusLabel}</span>
              <span className="truncate text-base leading-[1.5] font-semibold">{title}</span>
            </div>
            <p className="line-clamp-2 text-base leading-[1.5] font-medium">{detail.description}</p>
          </div>

          <Link href={`/adoption/${detail.petId}`} className="flex shrink-0 items-center px-1">
            <span className="text-sm leading-[1.5] font-semibold text-neutral-850">
              입양 상세보기
            </span>
            <ArrowRightIcon className="size-5 text-neutral-850" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export { PetInfoCard }
