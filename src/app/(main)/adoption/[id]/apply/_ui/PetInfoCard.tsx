import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon } from '@/shared/assets/icons'
import { Badge } from '@/shared/ui'
import type { AdoptionDetailDto } from '@/shared/types'
import { ADOPTION_STATUS_LABEL, GENDER_LABEL } from '@/shared/types'
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
              <Badge variant="default" className="absolute top-[0.875rem] left-4">
                인기
              </Badge>
            )}
          </div>

          {/* 우측 정보 */}
          <div className="flex min-w-px flex-1 flex-col justify-center self-stretch text-[#3e3e3e] pc:justify-between">
            <div className="flex flex-col gap-1">
              {/* 상태 + 제목(제목은 pc에서만 같은 줄) */}
              <div className="flex items-center gap-4 whitespace-nowrap">
                <span className="text-sm font-bold pc:text-base">
                  {ADOPTION_STATUS_LABEL[detail.status]}
                </span>
                <span className="hidden pc:inline pc:text-base pc:font-semibold">{title}</span>
              </div>
              {/* 둘째 줄 — 탭: 품종 이름(제목) / pc: 설명 */}
              <p className="truncate text-sm font-medium pc:hidden">{title}</p>
              <p className="line-clamp-2 hidden text-base leading-normal font-medium pc:block">
                {detail.description}
              </p>
            </div>

            {/* 하단: 입양 상세보기 (pc 전용) */}
            <div className="hidden justify-end pc:flex">
              <Link
                href={`/adoption/${detail.listingId}`}
                className="flex items-center px-1 text-sm leading-normal font-semibold text-[#3e3e3e]"
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
