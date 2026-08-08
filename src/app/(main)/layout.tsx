import { Gnb } from '@/widgets/gnb'
// import { BottomNav } from '@/widgets/bottom-nav'

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Gnb />
      {/* BottomNav 재도입 시 콘텐츠가 가리지 않도록 pb-[5rem] pc:pb-0 을 다시 넣어야 한다 */}
      <main className="flex flex-1 flex-col">{children}</main>
      {/* <BottomNav /> */}
    </div>
  )
}

export default MainLayout
