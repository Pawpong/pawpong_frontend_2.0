import { LogoButton } from '@/widgets/gnb'

const SignupLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex w-full items-center bg-white px-[1.25rem] py-[0.5rem] tab:px-[6.25rem]">
        <LogoButton />
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}

export default SignupLayout
