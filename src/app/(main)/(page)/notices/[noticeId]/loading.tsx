import { AsyncState, NavigationBar } from '@/shared/ui'

// 서버가 공지를 받는 동안 먼저 보내는 화면. NoticeDetailContent 의 불러오는 중 화면과 같은 틀이다
const NoticeDetailLoading = () => (
  <div>
    <NavigationBar title="공지사항" backHref="/notices" />
    <div>
      <div className="mx-auto flex w-full max-w-168 flex-col gap-5 pc:max-w-[59.25rem]">
        <AsyncState status="loading" message="공지사항을 불러오는 중이에요." />
      </div>
    </div>
  </div>
)

export default NoticeDetailLoading
