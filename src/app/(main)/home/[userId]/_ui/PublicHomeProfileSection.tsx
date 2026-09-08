'use client'

import { useRouter } from 'next/navigation'
import { useAuthStatus } from '@/features/auth'
import { ReportBreederAction } from '@/features/report'
import { Container, NavigationBar } from '@/shared/ui'
import type { AdopterPublicProfile, BreederPublicProfile } from '@/shared/types'
import { FavoriteBreederIconButton } from '../../_ui/FavoriteBreederIconButton'
import { ProfileCard } from '../../_ui/ProfileCard'

type PublicHomeProfileSectionProps =
  | { kind: 'adopter'; profile: AdopterPublicProfile }
  | { kind: 'breeder'; profile: BreederPublicProfile }

/** 공개 사용자 홈의 내비게이션과 프로필 영역. 사용자 유형에 따른 슬롯만 분기한다. */
const PublicHomeProfileSection = ({ kind, profile }: PublicHomeProfileSectionProps) => {
  const router = useRouter()
  const { isReady, isLoggedIn, userRole } = useAuthStatus()
  // [refactored] 신고 노출 조건에 이름을 붙인다 — 브리더 신고는 입양자(비로그인 포함)에게만 보인다
  const canReportBreeder = isReady && (!isLoggedIn || userRole === 'adopter')
  const isBreeder = kind === 'breeder'

  return (
    <>
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

      <Container className="px-4 py-5 tab:px-12 tab:py-5 pc:px-20 pc:py-10">
        {isBreeder ? (
          <ProfileCard profile={profile} mode="breeder" />
        ) : (
          <ProfileCard profile={profile} mode="other" />
        )}
      </Container>
    </>
  )
}

export { PublicHomeProfileSection }
