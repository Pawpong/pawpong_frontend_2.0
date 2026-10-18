import { parseCommunityReviewConfig } from '../model/communityReview'

export const communityReviewConfigOptions = {
  queryKey: ['community', 'review-config'] as const,
  queryFn: async ({ signal }: { signal: AbortSignal }) => {
    const response = await fetch('/api/community/review', { signal, cache: 'no-store' })
    if (!response.ok) throw new Error('심사 설정을 불러오지 못했어요.')
    return parseCommunityReviewConfig(await response.json())
  },
  staleTime: 30_000,
  retry: false,
  throwOnError: false,
}
