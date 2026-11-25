'use client'

import { useRouter } from 'next/navigation'
import { NavigationBar } from '@/shared/ui'
import { goBackFromScreen } from '@/shared/lib/nativeStack'
import type { AdopterPublicProfile, BreederPublicProfile } from '@/shared/types'
import { PublicProfileActions } from '../../_ui/PublicProfileActions'

type PublicHomeProfileSectionProps =
  | { kind: 'adopter'; profile: AdopterPublicProfile }
  | { kind: 'breeder'; profile: BreederPublicProfile }

/**
 * 공개 사용자 홈의 상단 바 — 모바일 전용 한 줄(뒤로 · 이름 · 공유·더보기(신고)).
 * 웹은 로고 바 바로 아래, 앱은 로고 바가 없어 맨 위에 붙는다 (52px).
 * 2단(tab+)에서는 좌측 프로필 카드 아바타 줄이 같은 공유·더보기를 갖고 있어 숨긴다.
 */
const PublicHomeProfileSection = ({ profile }: PublicHomeProfileSectionProps) => {
  const router = useRouter()

  return (
    <NavigationBar
      title=""
      onBack={() => goBackFromScreen(() => router.back())}
      right={<PublicProfileActions profile={profile} />}
      height="top"
      className="sticky top-(--header-h) z-sticky page-shell tab:hidden"
    />
  )
}

export { PublicHomeProfileSection }
