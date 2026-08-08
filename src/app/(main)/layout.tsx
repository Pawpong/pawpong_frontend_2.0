import { Gnb } from '@/widgets/gnb'
// import { BottomNav } from '@/widgets/bottom-nav'

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Gnb />
      {/* 하단 고정 BottomNav(모바일·탭)에 콘텐츠가 가리지 않도록 pb 확보 */}
      <main className="flex flex-1 flex-col">{children}</main>
      {/* <BottomNav /> */}
    </div>
  )
}

export default MainLayout
