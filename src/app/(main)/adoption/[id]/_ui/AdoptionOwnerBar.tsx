import Link from 'next/link'

interface AdoptionOwnerBarProps {
  listingId: string
  onDelete: () => void
  /** 삭제 요청 진행 중 — 중복 요청을 막고 이탈을 늦춘다 */
  isDeleting?: boolean
}

/* ── 하단 고정 오너 바 (내 분양글) ──
   신청 CTA 자리를 그대로 쓴다. 내 글에는 신청 버튼이 없어 이 영역이 비어 있었고,
   수정 진입점이 없어 브리더가 올린 글을 고칠 방법 자체가 없었다.
   폭·높이 스펙은 AdoptionCtaBar 와 맞춰 두 상태가 같은 자리에 같은 크기로 보이게 한다. */
const AdoptionOwnerBar = ({ listingId, onDelete, isDeleting = false }: AdoptionOwnerBarProps) => {
  const ACTION_CLASS =
    'flex h-[3rem] max-w-[18.5625rem] flex-1 items-center justify-center rounded-full px-[0.5rem] text-[1rem] font-semibold tab:h-[2.5rem] tab:max-w-[16.125rem]'

  return (
    <div className="fixed right-0 bottom-0 left-0 z-10 flex items-center justify-center gap-[0.625rem] bg-white px-[1rem] py-[1rem] tab:justify-end tab:gap-[1.25rem] tab:px-[3rem] tab:py-[0.75rem] pc:px-[5rem]">
      {/* 탭·pc 우측 정렬용 좌측 스페이서 — CtaBar 와 동일 */}
      <div className="hidden tab:block tab:h-[2.8125rem] tab:flex-1" />

      <div className="flex w-full items-center justify-center gap-[0.625rem] tab:w-[22.5rem] tab:max-w-[33.5rem] tab:min-w-[22.5rem] tab:justify-end tab:gap-[1.25rem]">
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className={`${ACTION_CLASS} border border-neutral-300 bg-white text-neutral-850 hover:text-neutral-700 disabled:opacity-50`}
        >
          삭제
        </button>

        <Link
          href={`/adoption/${listingId}/edit`}
          className={`${ACTION_CLASS} bg-point-500 text-neutral-850 hover:text-neutral-700 active:bg-point-600 active:text-neutral-850`}
        >
          수정하기
        </Link>
      </div>
    </div>
  )
}

export { AdoptionOwnerBar }
