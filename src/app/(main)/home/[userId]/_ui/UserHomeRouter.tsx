'use client'

import { useQuery } from '@tanstack/react-query'
import { adopterQueries } from '@/entities/adopter'
import { UserHomeContent } from './UserHomeContent'
import { BreederHomeContent } from './BreederHomeContent'

interface UserHomeRouterProps {
  userId: string
}

const UserHomeRouter = ({ userId }: UserHomeRouterProps) => {
  const { data: adopterProfile, isError: isAdopterError } = useQuery(
    adopterQueries.publicProfile(userId),
  )

  if (isAdopterError) {
    return <BreederHomeContent userId={userId} />
  }

  if (adopterProfile) {
    return <UserHomeContent userId={userId} />
  }

  return null
}

export { UserHomeRouter }
