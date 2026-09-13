'use client'

import type { CommunityReportReason } from '@/shared/types'
import { ReportAction } from '@/shared/ui'
import { useReportCommunityPost } from '../api/community.mutations'

const REPORT_REASON_OPTIONS = [
  { value: 'spam', label: '스팸·광고' },
  { value: 'inappropriate_content', label: '부적절한 콘텐츠' },
  { value: 'false_info', label: '거짓 정보' },
  { value: 'hateful_content', label: '혐오·괴롭힘' },
  { value: 'other', label: '기타' },
] satisfies { value: CommunityReportReason; label: string }[]

export const ReportPostAction = ({ postId }: { postId: string }) => {
  const reportPost = useReportCommunityPost(postId)
  return (
    <ReportAction
      targetLabel="게시글"
      options={REPORT_REASON_OPTIONS}
      onSubmit={async (data) => {
        const { reported } = await reportPost.mutateAsync(data)
        return reported ? '신고가 접수되었습니다.' : '이미 접수된 신고입니다. 검토를 기다려주세요.'
      }}
    />
  )
}
