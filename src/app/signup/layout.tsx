import { createPageMetadata } from '@/shared/lib/metadata'

import { SignupLogoLink } from './_ui/SignupLogoLink'

export const metadata = createPageMetadata({ title: '회원가입', noIndex: true })

const SignupLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-sticky flex h-12 w-full shrink-0 items-center justify-center bg-white px-4 py-2 tab:px-12 pc:h-16 pc:px-20">
        <div className="flex w-full max-w-[80rem] items-center justify-between">
          <SignupLogoLink />
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  )
}

export default SignupLayout
