import type { ComponentProps } from 'react'
import { NavigationBar } from './NavigationBar'

type RootHeaderProps = Pick<
  ComponentProps<typeof NavigationBar>,
  'title' | 'right' | 'onBack' | 'className'
>

/**
 * 하단 탭 루트 화면 머리 — 브랜드 서체 제목 + 오른쪽 24px 아이콘 버튼(edge="both").
 * 웹은 가운데 제목(뒤로가기 있으면 보임), 앱은 52px 높이·왼쪽 제목·뒤로가기 숨김.
 */
export const RootHeader = (props: RootHeaderProps) => (
  <NavigationBar {...props} titleVariant="page" appRoot />
)
