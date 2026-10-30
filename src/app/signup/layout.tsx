import { createPageMetadata } from '@/shared/lib/metadata'

import { PageFrame } from '@/shared/ui'
import { SignupLogoLink } from './_ui/SignupLogoLink'

export const metadata = createPageMetadata({ title: '회원가입', noIndex: true })

const SignupLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-dvh flex-col bg-base-white">
      <header className="sticky top-0 z-sticky flex h-16 w-full shrink-0 items-center justify-center border-b border-neutral-100 bg-base-white py-2">
        <div className="page-shell flex items-center justify-between">
          <SignupLogoLink />
          <span className="text-body-md text-neutral-700">포퐁과 함께하는 첫걸음</span>
        </div>
      </header>
      {/* 가입 단계는 폼처럼 한 줄로 읽는 화면이라 좁은 페이지 틀을 쓴다 */}
      <main className="flex flex-1 flex-col">
        <PageFrame narrow>{children}</PageFrame>
      </main>
    </div>
  )
}

export default SignupLayout
