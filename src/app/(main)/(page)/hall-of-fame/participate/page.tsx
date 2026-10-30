import { createPageMetadata } from '@/shared/lib/metadata'

import { ContestEntryContent } from './_ui/ContestEntryContent'

export const metadata = createPageMetadata({ title: '명예의 전당 참여', noIndex: true })

const ContestEntryPage = () => {
  return <ContestEntryContent />
}

export default ContestEntryPage
