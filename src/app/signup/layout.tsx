import { SignupLogoLink } from './_ui/SignupLogoLink'

const SignupLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex w-full items-center justify-center bg-white px-5 py-2 tab:px-20">
        <div className="flex w-full max-w-[80rem] items-center justify-between">
          <SignupLogoLink />
          <div className="hidden h-12 w-[22.375rem] tab:flex" />
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  )
}

export default SignupLayout
