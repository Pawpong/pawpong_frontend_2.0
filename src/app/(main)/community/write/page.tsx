import { createPageMetadata } from '@/shared/lib/metadata'

import { CommunityPostEditor } from '../_ui/CommunityPostEditor'

export const metadata = createPageMetadata({ title: '게시글 작성', noIndex: true })

const CommunityWritePage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    experience?: string | string[]
    source?: string | string[]
    returnTo?: string | string[]
  }>
}) => {
  const { experience, source, returnTo } = await searchParams
  return (
    <CommunityPostEditor
      initialRecord={typeof experience === 'string' ? experience : undefined}
      photoSource={source === 'memory-card' || source === 'ai-photo' ? source : undefined}
      returnTo={typeof returnTo === 'string' ? returnTo : undefined}
    />
  )
}

export default CommunityWritePage
