// ActivityContent.tsx는 'use client'라 서버 컴포넌트(page.tsx)에서 그 안의 함수를 직접
// 호출할 수 없다 — 순수 타입/가드만 별도 서버·클라이언트 겸용 파일로 뺀다.
export type ActivityTab = 'applications' | 'reviews' | 'sent-applications' | 'sent-reviews'

const ACTIVITY_TABS: ActivityTab[] = [
  'applications',
  'reviews',
  'sent-applications',
  'sent-reviews',
]

export const isActivityTab = (value: string): value is ActivityTab =>
  (ACTIVITY_TABS as string[]).includes(value)
