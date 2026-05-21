import { UserHomeContent } from './_ui/UserHomeContent'
import { BreederHomeContent } from './_ui/BreederHomeContent'

interface UserHomePageProps {
  params: Promise<{ userId: string }>
}

// TODO: API 연동 후 userId로 사용자 타입 판별
const MOCK_BREEDER_IDS = ['breeder-1']

const UserHomePage = async ({ params }: UserHomePageProps) => {
  const { userId } = await params
  const isBreeder = MOCK_BREEDER_IDS.includes(userId)

  if (isBreeder) {
    return <BreederHomeContent userId={userId} />
  }

  return <UserHomeContent userId={userId} />
}

export default UserHomePage
