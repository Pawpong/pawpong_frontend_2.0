import Link from 'next/link'
import { FavoriteIcon } from '@/shared/assets/icons'

interface AdoptionCtaBarProps {
  listingId: string
  /** 이 분양글의 브리더 본인이면 신청 대신 관리 CTA 노출 */
  isOwner: boolean
}

/* ── 하단 고정 CTA 바 (입양 신청 / 소유자는 관리) ──
   피그마 btn layout — 모바일(1654:148608) / 탭(1654:148637) / pc(1654:148643)
   - 모바일: px-16 py-16, 가운데 정렬 · 하트(48) + 노란 버튼(h-48, 가득 max-297)
   - 탭:    px-48 py-12, 우측 정렬 · 하트(48) + 노란 버튼(h-32, max-258)
   - pc:    px-80 py-12, 우측 정렬 · 노란 버튼만 (하트 숨김)
   내부 그룹은 콘텐츠(max-w-90rem)와 동일 폭으로 중앙 정렬해 넓은 화면 정렬 유지 */
const CTA_BUTTON_CLASS =
  'flex h-[3rem] max-w-[18.5625rem] flex-1 items-center justify-center rounded-full bg-[#fffa94] px-[0.5rem] text-[1rem] font-semibold text-[#3e3e3e] tab:h-[2rem] tab:max-w-[16.125rem] tab:text-[0.875rem] hover:text-[#6b6b6b] active:bg-[#f3ec59] active:text-[#3e3e3e]'

const AdoptionCtaBar = ({ listingId, isOwner }: AdoptionCtaBarProps) => (
  <div className="fixed right-0 bottom-0 left-0 z-10 bg-white px-[1rem] py-[1rem] tab:px-[3rem] tab:py-[0.75rem] pc:px-[5rem]">
    <div className="mx-auto flex w-full max-w-[90rem] items-center justify-center gap-[0.625rem] tab:justify-end tab:gap-[1.25rem]">
      {/* 탭·pc 우측 정렬용 좌측 스페이서 (피그마 flex-1 h-45) */}
      <div className="hidden tab:block tab:h-[2.8125rem] tab:flex-1" />

      {/* 하트 + 버튼 그룹 — 모바일: 가득 / 탭·pc: w-360 우측 고정 */}
      <div className="flex w-full items-center justify-center gap-[0.625rem] tab:w-[22.5rem] tab:max-w-[33.5rem] tab:min-w-[22.5rem] tab:justify-end tab:gap-[1.25rem]">
        {isOwner ? (
          <Link href="/adoption/my-listings" className={CTA_BUTTON_CLASS}>
            내 분양글 관리
          </Link>
        ) : (
          <>
            {/* 관심(하트) — pc에서는 숨김 */}
            <button type="button" aria-label="관심있어요" className="shrink-0 pc:hidden">
              <FavoriteIcon className="size-[3rem] text-[#5d5d5d]" />
            </button>

            <Link href={`/adoption/${listingId}/apply`} className={CTA_BUTTON_CLASS}>
              입양 신청하기
            </Link>
          </>
        )}
      </div>
    </div>
  </div>
)

export { AdoptionCtaBar }
