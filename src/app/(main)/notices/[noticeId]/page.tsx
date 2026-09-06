import { NoticeDetailContent } from './_ui/NoticeDetailContent'

interface NoticeDetailPageProps {
  params: Promise<{ noticeId: string }>
}

const NoticeDetailPage = async ({ params }: NoticeDetailPageProps) => {
  const { noticeId } = await params
  return <NoticeDetailContent noticeId={noticeId} />
}

export default NoticeDetailPage
