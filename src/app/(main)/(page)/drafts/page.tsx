import { createPageMetadata } from '@/shared/lib/metadata'

import { requireAuth } from '@/features/auth/server'
import { NavigationBar } from '@/shared/ui'
import { AdoptionDraftSection } from './_ui/AdoptionDraftSection'
import { CommunityDraftSection } from './_ui/CommunityDraftSection'

export const metadata = createPageMetadata({ title: '임시저장한 글', noIndex: true })

/** 임시저장한 글 — 분양글(브리더만)과 게시글을 한 화면에서 이어 쓴다. 진입점은 전부 마이홈이다 */
const DraftsPage = async () => {
  const role = await requireAuth('/drafts')

  return (
    <div className="flex w-full flex-col">
      <NavigationBar title="임시저장한 글" backHref="/home" />

      <div>
        <div className="mx-auto flex w-full flex-col gap-10 pc:max-w-[59.25rem]">
          {role === 'breeder' && <AdoptionDraftSection />}
          <CommunityDraftSection />
        </div>
      </div>
    </div>
  )
}

export default DraftsPage
