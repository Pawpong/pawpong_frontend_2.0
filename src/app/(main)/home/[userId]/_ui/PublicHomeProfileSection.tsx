'use client'

import { useRouter } from 'next/navigation'
import { NavigationBar } from '@/shared/ui'
import type { AdopterPublicProfile, BreederPublicProfile } from '@/shared/types'

type PublicHomeProfileSectionProps =
  | { kind: 'adopter'; profile: AdopterPublicProfile }
  | { kind: 'breeder'; profile: BreederPublicProfile }

/**
 * 공개 사용자 홈의 상단 내비게이션 바 — 모바일 전용 뒤로가기.
 * 2단(tab+)에서는 좌측 프로필 카드가 이름·즐겨찾기·신고를 모두 갖고 있어 숨긴다.
 */
const PublicHomeProfileSection = ({ kind, profile }: PublicHomeProfileSectionProps) => {
  const router = useRouter()

  return (
    <NavigationBar
      title={`${profile.nickname}의 홈`}
      onBack={kind === 'breeder' ? () => router.back() : undefined}
      className="tab:hidden"
    />
  )
}

export { PublicHomeProfileSection }
