'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import type { PetStatus } from '@/shared/types'
import { petPostingQueries } from './Queries'

export const useMyPetPostings = (status?: PetStatus, pageSize?: number) =>
  useInfiniteQuery(petPostingQueries.myList(status, pageSize))
