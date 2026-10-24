'use client'

import { useAuthStatus } from '@/features/auth'
import { ReportBreederAction } from '@/features/report'
import { ShareButton } from '@/shared/ui'
import type { AdopterPublicProfile, BreederPublicProfile } from '@/shared/types'

/**
 * 남의 홈 공유·더보기 — 모바일은 상단 바 오른쪽, 2단(tab+)은 프로필 카드 아바타 줄 오른쪽에 둔다.
 * 이름 줄에 아이콘을 늘어놓으면 긴 이름이 잘리고 어수선해서 옮겼다.
 * 신고는 드물고 부정적인 행동이라 ⋯ 메뉴 안에 숨긴다 (브리더 홈에서 입양자·비로그인에게만).
 */
const PublicProfileActions = ({
  profile,
}: {
  profile: AdopterPublicProfile | BreederPublicProfile
}) => {
  const { isReady, isLoggedIn, userRole } = useAuthStatus()
  const breederId = 'businessLocation' in profile ? profile.breederId : null
  const homeId = 'businessLocation' in profile ? profile.breederId : profile.userId
  const canReport = breederId !== null && isReady && (!isLoggedIn || userRole === 'adopter')

  return (
    <div className="flex shrink-0 items-center gap-1">
      <ShareButton
        url={`/home/${homeId}`}
        title={`${profile.nickname}님의 홈`}
        description={profile.bio}
        imageUrl={profile.profileImageUrl}
        ariaLabel="프로필 공유하기"
      />
      {canReport && <ReportBreederAction breederId={breederId} triggerVariant="menu" />}
    </div>
  )
}

export { PublicProfileActions }
