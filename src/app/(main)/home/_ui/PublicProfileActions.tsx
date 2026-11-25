'use client'

import { useAuthStatus } from '@/shared/lib/useAuthStatus'
import { ReportBreederAction } from '@/features/report'
import { ShareButton } from '@/shared/ui'
import type { AdopterPublicProfile, BreederPublicProfile } from '@/shared/types'
import { FavoriteBreederIconButton } from './FavoriteBreederIconButton'

/**
 * 남의 홈 즐겨찾기·공유·더보기 — 모바일은 상단 바 오른쪽, 2단(tab+)은 프로필 카드 아바타 줄 오른쪽에 둔다.
 * 즐겨찾기는 공유 옆에 모으고 팔로우·메시지는 프로필 아래에 둔다 (즐겨찾기는 브리더 홈에만).
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
      {'businessLocation' in profile && (
        <FavoriteBreederIconButton
          breederId={profile.breederId}
          isFavorited={profile.isFavorited}
          size="inline"
        />
      )}
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
