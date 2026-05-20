import { UserHomeContent } from './_ui/UserHomeContent'

interface UserHomePageProps {
  params: Promise<{ userId: string }>
}

const UserHomePage = async ({ params }: UserHomePageProps) => {
  const { userId } = await params

  return <UserHomeContent userId={userId} />
}

export default UserHomePage
