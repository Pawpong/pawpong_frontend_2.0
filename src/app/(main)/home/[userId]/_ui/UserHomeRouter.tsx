'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { profileQueries } from '@/entities/profile'
import { adopterQueries } from '@/entities/adopter'
import { useAuthStatus } from '@/features/auth'
import { isApiError } from '@/shared/api'
import { Container } from '@/shared/ui'
import { UserHomeContent } from './UserHomeContent'
import { BreederHomeContent } from './BreederHomeContent'

interface UserHomeRouterProps {
  userId: string
}

const UserHomeRouter = ({ userId }: UserHomeRouterProps) => {
  const router = useRouter()
  const { isLoggedIn } = useAuthStatus()
  const {
    data: myProfile,
    isPending: isMyProfilePending,
    isError: isMyProfileError,
  } = useQuery({
    ...profileQueries.me(),
    enabled: isLoggedIn,
  })
  const isMine = myProfile?.userId === userId

  const {
    data: adopterProfile,
    error: adopterError,
    isError: isAdopterError,
  } = useQuery({
    ...adopterQueries.publicProfile(userId),
    // 내 홈이면 곧바로 /home 으로 보내므로 조회할 필요가 없다 (브리더 ID 로 조회하면 400)
    enabled: !!userId && !isMine,
  })

  // 현재 API는 브리더 ID를 입양자 공개 프로필에 조회하면 400을 반환한다. 향후 404로
  // 정상화되는 경우도 함께 허용하되, 네트워크/5xx 오류를 브리더로 오판하지 않는다.
  const isNotAdopter =
    isApiError(adopterError) && (adopterError.status === 400 || adopterError.status === 404)

  useEffect(() => {
    if (isMine) router.replace('/home')
  }, [isMine, router])

  // 로그인 사용자는 본인 여부 판정이 끝나기 전 방문자 액션을 노출하지 않는다.
  if (isLoggedIn && isMyProfilePending) return null
  if (isMine) return null

  // 로그인했지만 내 신원을 확인하지 못하면 자기 자신에게 방문자 액션을 노출할 수 있으므로 중단한다.
  if (isLoggedIn && isMyProfileError) {
    return (
      <Container className="py-10 text-center text-sm text-neutral-700">
        프로필을 불러오지 못했습니다.
      </Container>
    )
  }

  if (isAdopterError && isNotAdopter) {
    return <BreederHomeContent userId={userId} />
  }

  if (isAdopterError) {
    return (
      <Container className="py-10 text-center text-sm text-neutral-700">
        프로필을 불러오지 못했습니다.
      </Container>
    )
  }

  if (adopterProfile) {
    return <UserHomeContent userId={userId} />
  }

  return null
}

export { UserHomeRouter }
