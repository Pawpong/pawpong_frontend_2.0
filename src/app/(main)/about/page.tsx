import { AsyncState, NavigationBar } from '@/shared/ui'

/** 서비스 소개 (Figma 전체 메뉴 3555:416834) — 확정된 소개 문안이 나오기 전까지 자리만 잡아둔다. */
const AboutPage = () => (
  <div className="flex w-full flex-1 flex-col bg-white pb-16">
    <NavigationBar title="서비스 소개" backHref="/" />
    <AsyncState status="empty" message="서비스 소개는 준비 중입니다." />
  </div>
)

export default AboutPage
