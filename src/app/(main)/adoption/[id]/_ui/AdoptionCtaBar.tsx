import Link from 'next/link'
import { FavoriteIcon } from '@/shared/assets'
import { FAVORITE_ACTIVE } from '@/shared/ui'

interface AdoptionCtaBarProps {
  listingId: string
  isFavorite: boolean
  onToggleFavorite: () => void
  /**
   * 신청이 불가능한 사유. 지정되면 신청 버튼 대신 이 문구를 비활성 상태로 보여준다.
   * (서버가 어차피 거절하는 요청을 폼까지 다 채운 뒤에 알게 되는 걸 막는다)
   */
  applyBlockedReason?: string
}

/* ── 하단 고정 CTA 바 (입양 신청) ──
   피그마 btn layout — 모바일(1654:148608) / 탭(1654:148637) / pc(1654:148643)
   - 모바일: px-16 py-16, 가운데 정렬 · 하트(48) + 노란 버튼(h-48, 가득 max-297)
   - 탭:    px-48 py-12, 우측 정렬 · 노란 버튼만 (h-40, max-258) — 하트 없음
   - pc:    px-80 py-12, 우측 정렬 · 노란 버튼만 (하트 숨김)
   세 상태를 한 트리에서 반응형 클래스로만 분기 (중복 최소화) */
const AdoptionCtaBar = ({
  listingId,
  isFavorite,
  onToggleFavorite,
  applyBlockedReason,
}: AdoptionCtaBarProps) => {
  // 버튼/비활성 문구가 폭·높이 스펙을 공유한다
  const ACTION_CLASS =
    'flex h-[3rem] max-w-[18.5625rem] flex-1 items-center justify-center rounded-full px-[0.5rem] text-[1rem] font-semibold tab:h-[2.5rem] tab:max-w-[16.125rem]'

  return (
    <div className="fixed right-0 bottom-0 left-0 z-10 flex items-center justify-center gap-[0.625rem] bg-white px-[1rem] py-[1rem] tab:justify-end tab:gap-[1.25rem] tab:px-[3rem] tab:py-[0.75rem] pc:px-[5rem]">
      {/* 탭·pc 우측 정렬용 좌측 스페이서 (피그마 flex-1 h-45) */}
      <div className="hidden tab:block tab:h-[2.8125rem] tab:flex-1" />

      {/* 하트 + 버튼 그룹 — 모바일: 가득 / 탭·pc: w-360 우측 고정 */}
      <div className="flex w-full items-center justify-center gap-[0.625rem] tab:w-[22.5rem] tab:max-w-[33.5rem] tab:min-w-[22.5rem] tab:justify-end tab:gap-[1.25rem]">
        {/* 관심(하트) — 모바일 전용(탭·pc는 없음). size="lg"(48px)가 Figma 스펙이라 FavoriteToggle 대신 직접 사용
            상태가 예약중·분양완료여도 관심 등록은 계속 가능하다(서버도 isActive 만 본다) */}
        <button
          type="button"
          aria-label="관심있어요"
          aria-pressed={isFavorite}
          onClick={onToggleFavorite}
          className="shrink-0 tab:hidden"
        >
          <FavoriteIcon
            size="lg"
            status={isFavorite ? 'fill' : 'default'}
            className={isFavorite ? FAVORITE_ACTIVE : 'text-neutral-500'}
          />
        </button>

        {applyBlockedReason ? (
          <p aria-live="polite" className={`${ACTION_CLASS} bg-neutral-100 text-neutral-500`}>
            {applyBlockedReason}
          </p>
        ) : (
          <Link
            href={`/adoption/${listingId}/apply`}
            // hover: 글씨 #6b6b6b / press(active): 배경 #f3ec59 · 글씨 #3e3e3e (피그마 743-70327·743-70329)
            className={`${ACTION_CLASS} bg-point-500 text-neutral-850 hover:text-neutral-700 active:bg-point-600 active:text-neutral-850`}
          >
            입양 신청하기
          </Link>
        )}
      </div>
    </div>
  )
}

export { AdoptionCtaBar }
