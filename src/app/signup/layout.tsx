import Image from 'next/image'
import Link from 'next/link'

const SignupLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex w-full items-center justify-center bg-white px-5 py-2 tab:px-20">
        <div className="flex w-full max-w-[80rem] items-center justify-between">
          <Link href="/" aria-label="홈으로 이동">
            <Image src="/images/logo/logo.svg" alt="Pawpong" width={96} height={32} priority />
          </Link>
          <div className="hidden h-12 w-[22.375rem] tab:flex" />
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  )
}

export default SignupLayout
