import { Gnb } from '@/widgets/gnb'
import { BottomTabBar } from '@/widgets/bottom-tab-bar'

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Gnb />
      <main className="flex-1 pb-[3.5rem] tab:pb-0">{children}</main>
      <BottomTabBar />
    </div>
  )
}

export default MainLayout
