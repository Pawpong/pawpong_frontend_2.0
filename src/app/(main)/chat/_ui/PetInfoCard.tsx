import Image from 'next/image'
import { Badge } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { ArrowRightIcon } from '@/shared/assets/icons'
import { CHAT_CONTENT_WIDTH } from '../_lib/constants'

const PetInfoCard = () => {
  return (
    <div className="bg-white px-4 py-1 tab:px-12 pc:px-5 pc:py-3">
      {/* 태블릿 이하: 컴팩트 (medium) — 작은 이미지 + 품종 1줄, 소개·상세보기 없음 */}
      <div className="flex w-full items-center gap-4 pc:hidden">
        <Image
          src="/images/mock-pet.jpg"
          alt="입양 가능한 반려동물"
          width={348}
          height={260}
          className="h-[4.0625rem] w-[5.4375rem] shrink-0 rounded object-cover"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1 text-neutral-850">
          <span className="text-sm leading-[1.5] font-bold">입양가능</span>
          <span className="truncate text-sm leading-[1.5] font-medium">
            품종 이름 | 성별 나이 1줄이내로 작성하기
          </span>
        </div>
      </div>

      {/* PC: full (large) — 큰 이미지 + 2줄 소개 + 입양 상세보기 */}
      <div className={cn(CHAT_CONTENT_WIDTH, 'hidden items-center gap-7 pc:flex')}>
        <div className="relative h-[6.25rem] w-[8.333rem] shrink-0 overflow-hidden rounded-lg">
          <Image
            src="/images/mock-pet.jpg"
            alt="입양 가능한 반려동물"
            fill
            sizes="134px"
            className="object-cover"
          />
          <Badge variant="primaryOutline" size="lg" className="absolute top-3.5 left-4 bg-white">
            인기
          </Badge>
        </div>

        {/* 정보 */}
        <div className="flex min-w-0 flex-1 items-end justify-between gap-4 self-stretch">
          <div className="flex h-full w-[33.4375rem] max-w-full flex-col items-start justify-between text-neutral-850">
            <div className="flex items-center gap-4">
              <span className="shrink-0 text-base leading-[1.5] font-bold">입양가능</span>
              <span className="truncate text-base leading-[1.5] font-semibold">
                품종 이름 | 성별 나이 1줄이내로 작성하기
              </span>
            </div>
            <p className="line-clamp-2 text-base leading-[1.5] font-medium">
              동물 품종 및 이름 및 이미지 및 소개 2줄 미리보기만 가능합니다 동물 품종 및 이름 및
              이미지 및 소개 2줄 미리보기만 가능합니다 동물 품종 및 이름 및 이미지 및 소개 2줄
              미리보기만 가능합니다
            </p>
          </div>

          <button type="button" className="flex shrink-0 items-center px-1">
            <span className="text-sm leading-[1.5] font-semibold text-neutral-850">
              입양 상세보기
            </span>
            <ArrowRightIcon className="size-5 text-neutral-850" />
          </button>
        </div>
      </div>
    </div>
  )
}

export { PetInfoCard }
