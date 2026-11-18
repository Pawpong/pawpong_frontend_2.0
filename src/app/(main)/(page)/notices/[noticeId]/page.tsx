import { noticeQueries } from '@/entities/notice'
import { getNoticeMetadata } from '@/app/_lib/contentMetadata'
import { ServerPrefetch } from '@/app/_lib/ServerPrefetch'
import { NoticeDetailContent } from './_ui/NoticeDetailContent'

interface NoticeDetailPageProps {
  params: Promise<{ noticeId: string }>
}

export const generateMetadata = async ({ params }: NoticeDetailPageProps) =>
  getNoticeMetadata((await params).noticeId)

const NoticeDetailPage = async ({ params }: NoticeDetailPageProps) => {
  const { noticeId } = await params
  return (
    <ServerPrefetch queries={[noticeQueries.detail(noticeId)]}>
      <NoticeDetailContent noticeId={noticeId} />
    </ServerPrefetch>
  )
}

export default NoticeDetailPage
