import { AsyncState, NavigationBar } from '@/shared/ui'

/** 공지사항 (Figma 전체 메뉴 3555:416834) — 공지 API 가 없어 목록 없이 빈 상태만 보여준다. */
const NoticesPage = () => (
  <div className="flex w-full flex-1 flex-col bg-white pb-16">
    <NavigationBar title="공지사항" backHref="/" />
    <AsyncState status="empty" message="등록된 공지사항이 없습니다." />
  </div>
)

export default NoticesPage
