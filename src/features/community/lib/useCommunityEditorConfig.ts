'use client'

import { useQuery } from '@tanstack/react-query'
import {
  communityExperienceConfigOptions,
  communityReviewConfigOptions,
} from '@/entities/community'

export function useCommunityEditorConfig() {
  const experience = useQuery({ ...communityExperienceConfigOptions, throwOnError: false })
  const review = useQuery({ ...communityReviewConfigOptions, throwOnError: false })
  return {
    experience,
    review,
    ready: experience.isSuccess && review.isSuccess,
    failed: experience.isError || review.isError,
    retrying: experience.isFetching || review.isFetching,
    retry: () => {
      void experience.refetch()
      void review.refetch()
    },
  }
}
