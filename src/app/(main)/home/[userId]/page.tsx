import { UserHomeRouter } from './_ui/UserHomeRouter'

interface UserHomePageProps {
  params: Promise<{ userId: string }>
}

const UserHomePage = async ({ params }: UserHomePageProps) => {
  const { userId } = await params
  return <UserHomeRouter userId={userId} />
}

export default UserHomePage
