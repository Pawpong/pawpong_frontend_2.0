'use client'

import { useAdopterPublicProfile } from '@/entities/adopter'
import { UserHomeContent } from './UserHomeContent'
import { BreederHomeContent } from './BreederHomeContent'

interface UserHomeRouterProps {
  userId: string
}

const UserHomeRouter = ({ userId }: UserHomeRouterProps) => {
  const { data: adopterProfile, isError: isAdopterError } = useAdopterPublicProfile(userId)

  if (isAdopterError) {
    return <BreederHomeContent userId={userId} />
  }

  if (adopterProfile) {
    return <UserHomeContent userId={userId} />
  }

  return null
}

export { UserHomeRouter }
