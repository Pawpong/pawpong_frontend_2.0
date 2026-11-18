import { profileQueries } from '@/entities/profile'
import { findHomeProfile, getProfileMetadata } from '@/app/_lib/contentMetadata'
import { ServerPrefetch } from '@/app/_lib/ServerPrefetch'
import { UserHomeRouter } from './_ui/UserHomeRouter'

interface UserHomePageProps {
  params: Promise<{ userId: string }>
}

export const generateMetadata = async ({ params }: UserHomePageProps) =>
  getProfileMetadata((await params).userId)

const UserHomePage = async ({ params }: UserHomePageProps) => {
  const { userId } = await params
  // 입양자인지 브리더인지 메타데이터와 같은 조회로 찾는다 — 찾은 프로필이 캐시에 남아 화면으로 넘어간다
  await findHomeProfile(userId)
  return (
    // 로그인 방문은 내 프로필도 받아, 내 홈인지 확인하는 동안 스켈레톤으로 깜빡이지 않게 한다
    <ServerPrefetch loggedInQueries={[profileQueries.me()]}>
      <UserHomeRouter userId={userId} />
    </ServerPrefetch>
  )
}

export default UserHomePage
