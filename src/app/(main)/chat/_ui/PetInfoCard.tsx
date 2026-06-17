import { Badge } from '@/shared/ui'
import { ArrowRightIcon } from '@/shared/assets/icons'

const PetInfoCard = () => {
  return (
    <div className="bg-white px-5 py-3 tab:px-8 pc:px-20">
      <div className="mx-auto flex w-full max-w-[55rem] items-center gap-7">
        {/* 이미지 */}
        <div className="relative h-[6.25rem] w-[8.333rem] shrink-0 overflow-hidden rounded-lg bg-[#6b6b6b]">
          <Badge variant="default" className="absolute top-3.5 left-4">
            인기
          </Badge>
        </div>

        {/* 정보 */}
        <div className="flex min-w-0 flex-1 items-end justify-between gap-4 self-stretch py-1">
          <div className="flex min-w-0 flex-col gap-2 text-[#3e3e3e]">
            <div className="flex items-center gap-4">
              <span className="shrink-0 text-base leading-[1.5] font-bold">입양가능</span>
              <span className="truncate text-base leading-[1.5] font-semibold">
                품종 이름 | 성별 나이
              </span>
            </div>
            <p className="line-clamp-2 text-base leading-[1.5] font-medium">
              동물 품종 및 이름 및 이미지 및 소개 2줄 미리보기만 가능합니다 동물 품종 및 이름 및
              이미지 및 소개 2줄 미리보기만 가능합니다
            </p>
          </div>

          <button type="button" className="flex shrink-0 items-center px-1">
            <span className="text-sm leading-[1.5] font-semibold text-[#3e3e3e]">
              입양 상세보기
            </span>
            <ArrowRightIcon className="size-5 text-[#3e3e3e]" />
          </button>
        </div>
      </div>
    </div>
  )
}

export { PetInfoCard }
