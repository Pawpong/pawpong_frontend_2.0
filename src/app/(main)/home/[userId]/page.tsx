import { getProfileMetadata } from '@/app/_lib/contentMetadata'
import { UserHomeRouter } from './_ui/UserHomeRouter'

interface UserHomePageProps {
  params: Promise<{ userId: string }>
}

export const generateMetadata = async ({ params }: UserHomePageProps) =>
  getProfileMetadata((await params).userId)

const UserHomePage = async ({ params }: UserHomePageProps) => {
  const { userId } = await params
  return <UserHomeRouter userId={userId} />
}

export default UserHomePage
