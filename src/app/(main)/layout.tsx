import { Gnb } from '@/widgets/gnb'
import { BottomNav } from '@/widgets/bottom-nav'
import { SiteFooter } from '@/widgets/site-footer'
import { AppContentRightsNotice } from './account/content-rights/_ui/AppContentRightsNotice'

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Gnb />
      <AppContentRightsNotice />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
      <BottomNav />
    </div>
  )
}

export default MainLayout
