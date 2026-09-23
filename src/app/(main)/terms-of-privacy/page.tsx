import type { Metadata } from 'next'
import Link from 'next/link'
import { TermsArticle } from '../_ui/TermsArticle'
import { TERMS_OF_PRIVACY_INTRO, TERMS_OF_PRIVACY_SECTIONS } from './_lib/constants'

export const metadata: Metadata = { title: '개인정보처리방침 | Pawpong' }

const TermsOfPrivacyPage = () => (
  <>
    <aside className="mx-auto mt-5 w-full max-w-168 px-4 text-sm leading-relaxed text-neutral-700">
      포퐁 계정과 서비스 데이터의 영구삭제는{' '}
      <Link href="/account/delete" className="underline underline-offset-4">
        계정 영구삭제 안내
      </Link>
      에서 요청하고 처리 상태를 확인할 수 있습니다. 기존의 복구 가능한 탈퇴와 별도의 절차입니다.
    </aside>
    <TermsArticle
      title="개인정보처리방침"
      intro={TERMS_OF_PRIVACY_INTRO}
      sections={TERMS_OF_PRIVACY_SECTIONS}
    />
  </>
)

export default TermsOfPrivacyPage
