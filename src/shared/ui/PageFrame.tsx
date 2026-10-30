import { cn } from '@/shared/lib/cn'

/**
 * 페이지 틀(폭·좌우 여백·위아래 여백) — 라우트 레이아웃 (page)·(narrow) 와 회원가입 레이아웃만 쓴다.
 * narrow 는 폼·약관·계정처럼 한 줄로 읽는 화면의 좁은 폭. 값은 globals.css 의 page-frame 한 곳에서 정한다.
 */
const PageFrame = ({
  narrow = false,
  children,
}: {
  narrow?: boolean
  children: React.ReactNode
}) => (
  <div className={cn('page-frame', narrow && '[--frame-max-width:var(--page-narrow-width)]')}>
    {children}
  </div>
)

export { PageFrame }
