import type { ReactNode } from 'react'
import { AsyncState, NavigationBar } from '@/shared/ui'

/** 공지 상세 화면 틀. 본문과 불러오는 중 화면이 같이 써서 둘의 배치가 어긋나지 않는다 */
export const NoticeDetailFrame = ({ children }: { children: ReactNode }) => (
  <div>
    <NavigationBar title="공지사항" backHref="/notices" />

    <div>
      <div className="mx-auto flex w-full max-w-168 flex-col gap-5 pc:max-w-[59.25rem]">
        {children}
      </div>
    </div>
  </div>
)

/** 불러오는 중 화면. 브라우저가 받는 동안과 서버가 받는 동안(loading.tsx) 같은 화면을 쓴다 */
export const NoticeDetailLoading = () => (
  <NoticeDetailFrame>
    <AsyncState status="loading" message="공지사항을 불러오는 중이에요." />
  </NoticeDetailFrame>
)
