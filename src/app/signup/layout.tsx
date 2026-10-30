import { createPageMetadata } from '@/shared/lib/metadata'

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
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  )
}

export default SignupLayout
