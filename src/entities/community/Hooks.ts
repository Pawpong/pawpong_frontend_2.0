'use client'

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import type { CommunitySortType, CommunityPetType } from '@/shared/types'
import { communityQueries } from './Queries'

export const useCommunityPosts = (
  sort: CommunitySortType = 'latest',
  petType?: CommunityPetType,
  category?: string,
  pageSize?: number,
) => useInfiniteQuery(communityQueries.posts(sort, petType, category, pageSize))

export const useCommunityPostDetail = (postId: string) =>
  useQuery(communityQueries.detail(postId))
