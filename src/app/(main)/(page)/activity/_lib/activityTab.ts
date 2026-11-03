import type { TabBarItem } from '@/shared/ui'

// ActivityContent.tsx는 'use client'라 서버 컴포넌트(page.tsx)에서 그 안의 함수를 직접
// 호출할 수 없다 — 탭 목록·가드는 서버·클라이언트 겸용인 이 파일에 둔다.
// 예전 브리더용 'sent-applications'·'sent-reviews' 링크는 가드에서 걸러져 첫 탭으로 간다.
export type ActivityTab = 'applications' | 'reviews' | 'counsel-profile'
export type ActivityUserRole = 'adopter' | 'breeder'

// 입양자는 보낸 신청/작성한 후기를, 브리더는 받은 신청/받은 후기를 본다.
// 브리더는 입양 신청을 보낼 수 없어(#497, 서버 403) 보낸 신청·보낸 후기 탭은 두지 않는다.
export const TABS_BY_ROLE: Record<
  ActivityUserRole,
  ReadonlyArray<TabBarItem & { value: ActivityTab }>
> = {
  adopter: [
    { value: 'applications', label: '신청 내역' },
    { value: 'reviews', label: '내 후기' },
    // 신청마다 같은 내용을 다시 쓰지 않도록, 가입 때 작성한 공통 신청서를 여기서 고친다
    { value: 'counsel-profile', label: '내 신청서' },
  ],
  breeder: [
    { value: 'applications', label: '받은 신청' },
    { value: 'reviews', label: '받은 후기' },
  ],
}

// 주소로 열 수 있는 탭은 위 목록에서 뽑는다 — 탭을 추가할 때 한 곳만 고친다
const ACTIVITY_TABS = new Set<string>(
  Object.values(TABS_BY_ROLE).flatMap((tabs) => tabs.map((tab) => tab.value)),
)

export const isActivityTab = (value: string): value is ActivityTab => ACTIVITY_TABS.has(value)
