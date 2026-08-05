import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon } from '@/shared/assets/icons'
import { PopularBadge } from '@/shared/ui'
import type { AdoptionDetailDto } from '@/shared/types'
import { GENDER_LABEL } from '@/shared/types'
import { ADOPTION_CARD_STATUS } from '@/entities/adoption'
import { getAgeText } from '../_lib/schema'

interface PetInfoCardProps {
  detail: AdoptionDetailDto
}

/* 입양 신청 상단 동물 요약 카드 (Figma 1862-173641, 데스크탑 전용)
   골격은 브리더의 다른 분양건 카드(OtherListingCard)와 동일:
   이미지(좌, 가운데정렬) + 우측 정보 컬럼(flex-col justify-between self-stretch) + 하단 행 */
const PetInfoCard = ({ detail }: PetInfoCardProps) => {
  const title = `${detail.name} | ${GENDER_LABEL[detail.gender]} ${getAgeText(detail.birthDate)}`

  return (
    <div>
      {/* card-2 (Figma): 흰 바 padding — mo 4px 16px / tab 4px 48px / pc 12px 48px, 풀폭 + 컨텐츠 가운데 정렬 */}
      <div className="flex w-full items-center justify-center bg-white px-4 py-1 shadow-[1px_5px_3.75px_rgba(0,0,0,0.1)] tab:px-12 pc:py-3">
        <div className="flex w-full max-w-[57.5rem] items-center gap-4 pc:gap-7">
          {/* 썸네일 + 인기 뱃지 */}
          <div className="relative h-[4.0625rem] w-[5.4375rem] shrink-0 overflow-hidden rounded bg-[#c6c6c6] pc:h-[6.25rem] pc:w-[8.333rem] pc:rounded-lg">
            <Image src={detail.imageUrls[0]} alt={detail.name} fill className="object-cover" />
            {detail.isPopular && (
              <PopularBadge variant="default" className="absolute top-[0.875rem] left-4" />
            )}
          </div>

          {/* 우측 정보 — pc: 텍스트(좌) + 입양 상세보기(우하단) 가로 배치 (Figma 1862-173645) */}
          <div className="flex min-w-px flex-1 flex-col justify-center self-stretch text-neutral-850 pc:flex-row pc:items-end pc:gap-4">
            <div className="flex min-w-0 flex-col gap-1 pc:h-full pc:flex-1 pc:justify-between pc:gap-0">
              {/* 상태 + 제목(제목은 pc에서만 같은 줄) */}
              <div className="flex items-center gap-4 whitespace-nowrap">
                <span className="text-sm font-bold pc:text-base">
                  {ADOPTION_CARD_STATUS[detail.status].label}
                </span>
                <span className="hidden pc:inline pc:text-base pc:font-semibold">{title}</span>
              </div>
              {/* 둘째 줄 — 탭: 품종 이름(제목) / pc: 설명 */}
              <p className="truncate text-sm font-medium pc:hidden">{title}</p>
              {/* pc 설명: 2줄까지만, 초과분 말줄임 — line-clamp(display:-webkit-box)가 pc:block에 덮이지 않게 pc:line-clamp-2 사용 */}
              <p className="hidden text-base leading-normal font-medium pc:line-clamp-2">
                {detail.description}
              </p>
            </div>

            {/* 입양 상세보기 (pc 전용) — 텍스트 우측 하단 */}
            <div className="hidden shrink-0 pc:flex">
              <Link
                href={`/adoption/${detail.listingId}`}
                className="flex items-center rounded-md px-1 text-sm leading-normal font-semibold text-neutral-850 transition-colors hover:bg-neutral-50 active:bg-neutral-100"
              >
                입양 상세보기
                <ArrowRightIcon className="size-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { PetInfoCard }
