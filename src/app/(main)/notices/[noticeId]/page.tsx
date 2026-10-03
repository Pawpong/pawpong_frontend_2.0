import { getNoticeMetadata } from '@/app/_lib/contentMetadata'

export const generateMetadata = async ({ params }: { params: Promise<{ noticeId: string }> }) =>
  getNoticeMetadata((await params).noticeId)

import { NoticeDetailContent } from './_ui/NoticeDetailContent'

interface NoticeDetailPageProps {
  params: Promise<{ noticeId: string }>
}

const NoticeDetailPage = async ({ params }: NoticeDetailPageProps) => {
  const { noticeId } = await params
  return <NoticeDetailContent noticeId={noticeId} />
}

export default NoticeDetailPage
