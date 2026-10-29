import { Gnb } from '@/widgets/gnb'
import { BottomNav } from '@/widgets/bottom-nav'
import { SiteFooter } from '@/widgets/site-footer'
import { AppContentRightsNotice } from './account/content-rights/_ui/AppContentRightsNotice'
import { PlaygroundPayments } from './_ui/PlaygroundPayments'

// min-h-screen(100vh) 은 주소창이 보이거나 키보드가 올라와도 줄지 않아, 모바일에서 화면보다
// 긴 문서가 된다. 채팅처럼 한 화면을 꽉 채우는 쪽은 그만큼이 통째로 빈 자리로 남으므로
// 보이는 높이를 따라가는 dvh 를 쓴다.
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-dvh flex-col">
      <Gnb />
      <AppContentRightsNotice />
      <main className="flex flex-1 flex-col">
        <PlaygroundPayments>{children}</PlaygroundPayments>
      </main>
      <SiteFooter />
      <BottomNav />
    </div>
  )
}

export default MainLayout
