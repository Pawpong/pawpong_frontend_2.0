import { createPageMetadata } from '@/shared/lib/metadata'

import { CommunityPostEditor } from '../_ui/CommunityPostEditor'

export const metadata = createPageMetadata({ title: '게시글 작성', noIndex: true })

const CommunityWritePage = () => {
  return <CommunityPostEditor />
}

export default CommunityWritePage
