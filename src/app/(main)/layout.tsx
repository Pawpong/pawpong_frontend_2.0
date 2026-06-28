import { Gnb } from '@/widgets/gnb'

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Gnb />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  )
}

export default MainLayout
