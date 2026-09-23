import type { Metadata } from 'next'
import Link from 'next/link'
import { ReviewLoginForm } from '@/features/auth'
import { RESPONSIVE_SHELL_CLASS } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { cafe24Proup } from '@/shared/lib/fonts'
import { normalizeReturnUrl } from '@/shared/lib/normalizeReturnUrl'
import { LogoButton } from '@/widgets/gnb'

export const metadata: Metadata = {
  title: '심사용 계정 로그인 | 포퐁',
  robots: { index: false, follow: false },
}

export default async function ReviewLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnUrl?: string }>
}) {
  const returnUrl = normalizeReturnUrl((await searchParams).returnUrl)
  const loginHref =
    returnUrl === '/' ? '/login' : `/login?returnUrl=${encodeURIComponent(returnUrl)}`

  return (
    <div className="flex min-h-dvh flex-col bg-base-white">
      <header className="h-12 shrink-0 bg-white pc:h-16">
        <div
          className={cn(RESPONSIVE_SHELL_CLASS, 'flex h-full items-center px-4 tab:px-12 pc:px-20')}
        >
          <LogoButton />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-[31.25rem] flex-1 flex-col px-4 py-8 tab:py-12">
        <div className="mb-8 rounded-xl border border-secondary-200 bg-secondary-50 px-5 py-6 text-center">
          <h1 className={cn(cafe24Proup.className, 'text-xl leading-relaxed text-neutral-850')}>
            심사용 계정 로그인
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-neutral-700">
            앱 심사를 위해 전달받은 계정으로 로그인해 주세요.
            <br />
            일반 회원은 소셜 로그인을 이용해 주세요.
          </p>
        </div>
        <ReviewLoginForm returnUrl={returnUrl} />
        <Link
          href={loginHref}
          className="mx-auto mt-6 rounded px-2 py-2 text-sm text-neutral-700 underline underline-offset-4 hover:text-neutral-850 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          소셜 로그인으로 돌아가기
        </Link>
      </main>
    </div>
  )
}
