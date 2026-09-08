'use client'

import { useRouter } from 'next/navigation'
import { useAuthStatus } from '@/features/auth'
import { ReportBreederAction } from '@/features/report'
import { NavigationBar } from '@/shared/ui'
import type { AdopterPublicProfile, BreederPublicProfile } from '@/shared/types'
import { FavoriteBreederIconButton } from '../../_ui/FavoriteBreederIconButton'

type PublicHomeProfileSectionProps =
  | { kind: 'adopter'; profile: AdopterPublicProfile }
  | { kind: 'breeder'; profile: BreederPublicProfile }

/**
 * 공개 사용자 홈의 상단 내비게이션 바.
 * 프로필 카드는 PC 2단 레이아웃에서 사이드바 자리에 들어가야 해 각 홈 컴포넌트가 직접 그린다.
 */
const PublicHomeProfileSection = ({ kind, profile }: PublicHomeProfileSectionProps) => {
  const router = useRouter()
  const { isReady, isLoggedIn, userRole } = useAuthStatus()
  // [refactored] 신고 노출 조건에 이름을 붙인다 — 브리더 신고는 입양자(비로그인 포함)에게만 보인다
  const canReportBreeder = isReady && (!isLoggedIn || userRole === 'adopter')
  const isBreeder = kind === 'breeder'

  return (
    <NavigationBar
      title={`${profile.nickname}의 홈`}
      onBack={isBreeder ? () => router.back() : undefined}
      right={
        isBreeder ? (
          <div className="flex items-center gap-2">
            <FavoriteBreederIconButton
              breederId={profile.breederId}
              isFavorited={profile.isFavorited}
              size="nav"
              className="pc:hidden"
            />
            {canReportBreeder && <ReportBreederAction breederId={profile.breederId} />}
          </div>
        ) : undefined
      }
    />
  )
}

export { PublicHomeProfileSection }
