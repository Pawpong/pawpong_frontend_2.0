import { createPageMetadata } from '@/shared/lib/metadata'

import { CommunityPostEditor } from '../_ui/CommunityPostEditor'

export const metadata = createPageMetadata({ title: '게시글 작성', noIndex: true })

const CommunityWritePage = async ({
  searchParams,
}: {
  searchParams: Promise<{ experience?: string | string[] }>
}) => {
  const { experience } = await searchParams
  return (
    <CommunityPostEditor initialRecord={typeof experience === 'string' ? experience : undefined} />
  )
}

export default CommunityWritePage
