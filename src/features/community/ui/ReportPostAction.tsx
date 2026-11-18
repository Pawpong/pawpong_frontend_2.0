'use client'

import type { CommunityReportReason } from '@/shared/types'
import { useReportFlow } from '@/shared/ui'
import { useReportCommunityPost } from '../api/community.mutations'

const REPORT_REASON_OPTIONS = [
  { value: 'spam', label: '스팸·광고' },
  { value: 'inappropriate_content', label: '부적절한 콘텐츠' },
  { value: 'false_info', label: '거짓 정보' },
  { value: 'hateful_content', label: '혐오·괴롭힘' },
  { value: 'other', label: '기타' },
] satisfies { value: CommunityReportReason; label: string }[]

/** 게시글 ⋮ 메뉴의 신고 항목에 request 를 걸고, dialogs 는 메뉴 바깥에 렌더한다. */
export const useReportPost = (postId: string) => {
  const reportPost = useReportCommunityPost(postId)
  return useReportFlow({
    targetLabel: '게시글',
    options: REPORT_REASON_OPTIONS,
    onSubmit: async (data) => {
      const { reported } = await reportPost.mutateAsync(data)
      return reported ? '신고를 접수했어요.' : '이미 접수된 신고예요. 검토를 기다려 주세요.'
    },
  })
}
