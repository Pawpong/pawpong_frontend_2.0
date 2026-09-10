import Link from 'next/link'
import { ApplicationChatButton } from '@/features/chat-entry'
import { FavoriteIcon } from '@/shared/assets'
import { FAVORITE_ACTIVE } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'

interface AdoptionCtaBarProps {
  listingId: string
  isFavorite: boolean
  onToggleFavorite: () => void
  /**
   * 신청이 불가능한 사유. 지정되면 신청 버튼 대신 이 문구를 비활성 상태로 보여준다.
   * (서버가 어차피 거절하는 요청을 폼까지 다 채운 뒤에 알게 되는 걸 막는다)
   */
  applyBlockedReason?: string
  /**
   * 로그인 사용자가 이 개체에 이미 넣어둔 신청. 있으면 신청 버튼 대신
   * 채팅·신청서 보기로 바꾼다 — 다시 신청해도 서버가 409 로 막기 때문이다.
   */
  myApplication?: { applicationId: string; breederUserId: string }
  /**
   * fixed  — 하단 고정 바 (1024 미만)
   * inline — 결정 레일 안에 그대로 놓는 형태 (1024+). 고정 위치·스페이서·하트를 뺀다
   *          (관심 버튼은 레일이 이미 갖고 있다)
   */
  variant?: 'fixed' | 'inline'
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
  myApplication,
  variant = 'fixed',
}: AdoptionCtaBarProps) => {
  const isInline = variant === 'inline'
  // 버튼/비활성 문구가 폭·높이 스펙을 공유한다
  const ACTION_CLASS = cn(
    'flex h-[3rem] flex-1 items-center justify-center rounded-full px-[0.5rem] text-[1rem] font-semibold tab:h-[2.5rem]',
    // 레일 안에서는 컬럼 폭을 그대로 쓴다 (고정 바에서만 시안의 최대 폭을 지킨다)
    isInline ? 'tab:h-[2.75rem]' : 'max-w-[18.5625rem] tab:max-w-[16.125rem]',
  )

  return (
    <div
      className={cn(
        'flex items-center gap-[0.625rem]',
        isInline
          ? 'w-full'
          : 'fixed right-0 bottom-0 left-0 z-10 justify-center bg-white px-[1rem] py-[1rem] tab:justify-end tab:gap-[1.25rem] tab:px-[3rem] tab:py-[0.75rem] pc:px-[5rem]',
      )}
    >
      {/* 탭·pc 우측 정렬용 좌측 스페이서 (피그마 flex-1 h-45) */}
      {!isInline && <div className="hidden tab:block tab:h-[2.8125rem] tab:flex-1" />}

      {/* 하트 + 버튼 그룹 — 모바일: 가득 / 탭·pc: w-360 우측 고정 */}
      <div
        className={cn(
          'flex w-full items-center justify-center gap-[0.625rem]',
          !isInline &&
            'tab:w-[22.5rem] tab:max-w-[33.5rem] tab:min-w-[22.5rem] tab:justify-end tab:gap-[1.25rem]',
        )}
      >
        {/* 관심(하트) — 모바일 전용(탭·pc는 없음). size="lg"(48px)가 Figma 스펙이라 FavoriteToggle 대신 직접 사용
            상태가 예약중·분양완료여도 관심 등록은 계속 가능하다(서버도 isActive 만 본다) */}
        <button
          type="button"
          aria-label="관심있어요"
          aria-pressed={isFavorite}
          onClick={onToggleFavorite}
          className={cn('shrink-0 tab:hidden', isInline && 'hidden')}
        >
          <FavoriteIcon
            size="lg"
            status={isFavorite ? 'fill' : 'default'}
            className={isFavorite ? FAVORITE_ACTIVE : 'text-neutral-500'}
          />
        </button>

        {myApplication ? (
          // 이미 신청한 개체 — 신청 버튼을 다시 보여주면 폼을 다 채운 뒤에야 409 로 막힌다.
          // 신청 이후 할 일은 대화이므로 채팅을 주 액션으로 두고, 신청서 확인 경로를 함께 남긴다.
          <div className="flex flex-1 items-center justify-end gap-[0.625rem] tab:gap-[0.75rem]">
            <Link
              href={`/activity/applications/${myApplication.applicationId}`}
              className={`${ACTION_CLASS} border border-neutral-300 bg-white text-neutral-850 hover:text-neutral-700`}
            >
              내 신청서 보기
            </Link>
            <ApplicationChatButton
              counterpartUserId={myApplication.breederUserId}
              applicationId={myApplication.applicationId}
              className={`${ACTION_CLASS} bg-point-500 text-neutral-850 hover:text-neutral-700 active:bg-point-600`}
            />
          </div>
        ) : applyBlockedReason ? (
          // 브리더 사유("브리더 계정은...")가 ACTION_CLASS의 max-w(297px)에서 2줄로 줄바꿈되며
          // 고정 높이(h-3rem)를 넘쳐 버튼 영역을 침범했다 — max-w를 없애 남는 폭을 옆으로 다 쓰고
          // (모바일은 하트 옆 남은 공간, 탭/pc는 스페이서 옆 공간), 한 줄 유지 + 폰트를 살짝 줄인다.
          <p
            aria-live="polite"
            className="flex h-[3rem] flex-1 items-center justify-center overflow-hidden rounded-full bg-neutral-100 px-[0.75rem] text-[0.875rem] font-semibold whitespace-nowrap text-neutral-500 tab:h-[2.5rem] tab:text-[1rem]"
          >
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
