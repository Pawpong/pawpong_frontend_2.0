import { Badge } from '@/shared/ui'

const PetInfoCard = () => {
  return (
    <div className="flex flex-col bg-white px-5 py-[0.4375rem] shadow-[1px_5px_3.75px_rgba(0,0,0,0.1)] pc:flex-row pc:gap-5 pc:p-5">
      {/* Mobile label */}
      <p className="text-xs font-bold leading-[1.5] text-text-primary pc:hidden">입양문의건</p>

      <div className="flex gap-[0.5625rem] pc:gap-5">
        {/* Pet Image */}
        <div className="size-[6.25rem] shrink-0 overflow-hidden rounded-lg bg-fill-placeholder pc:h-[14.6875rem] pc:w-[14.1875rem]">
          <div className="size-full bg-fill-placeholder" />
        </div>

        {/* Pet Info */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Title */}
          <p className="text-sm font-bold leading-[1.5] text-text-primary pc:hidden">
            레오파드 개코 도마뱀(만다린)
          </p>
          {/* PC Title Row */}
          <div className="hidden items-center gap-[1.125rem] pc:flex">
            <span className="text-xl font-semibold leading-[1.375rem] text-text-primary">
              레오파드 개코도마뱀 (만다린)
            </span>
            <span className="size-1 rounded-full bg-fill-muted" />
            <span className="text-xl font-semibold leading-[1.375rem] text-text-primary">성별</span>
            <span className="size-1 rounded-full bg-fill-muted" />
            <span className="text-xl font-semibold leading-[1.375rem] text-text-primary">6개월</span>
          </div>

          {/* Status Badges */}
          <div className="mt-0.5 flex items-center gap-[0.3125rem] pc:mt-2">
            <Badge variant="status" className="h-[1.375rem] text-xs pc:text-[0.819rem]">입양 가능</Badge>
            <Badge variant="outline" className="h-[1.375rem] text-xs pc:hidden">인기</Badge>
          </div>

          {/* PC Description */}
          <p className="mt-3 hidden line-clamp-3 text-xl font-semibold leading-[1.375rem] text-text-primary pc:block">
            경상남도 창원에 위치한 랙돌 캐터리 로지데이즈입니다.
            <br />
            저희 캐터리는 평균 생후 4개월령에 중성화 수술을 완료한 후 입양을 진행하고 있으며,...
          </p>

          {/* Stats */}
          <div className="mt-auto flex items-center justify-end gap-2 text-[0.625rem] font-medium leading-[1.25rem] text-text-muted pc:gap-5 pc:text-sm pc:leading-[1.375rem]">
            <span>문의 1</span>
            <span>관심 10</span>
            <span>조회 20</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-1 pc:mt-2 pc:gap-[0.625rem]">
            <button type="button" className="flex items-center gap-1 rounded-full pc:gap-[0.625rem] pc:p-[0.625rem]">
              <svg className="size-[1.4rem] pc:size-6" viewBox="0 0 24 24" fill="none">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#5d5d5d" />
              </svg>
              <span className="text-xs font-medium text-text-primary pc:text-sm">관심있어요</span>
            </button>
            <button type="button" className="hidden items-center gap-[0.625rem] rounded-full p-[0.625rem] pc:flex">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z" fill="#5d5d5d" />
              </svg>
              <span className="text-sm font-medium text-text-primary">공유</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { PetInfoCard }
