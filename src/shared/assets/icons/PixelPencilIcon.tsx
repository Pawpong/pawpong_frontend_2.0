import type { SVGProps } from 'react'
import { NavIconSvg } from './NavIconSvg'
import { NAV_ICON_DATA } from './navIconData'

/**
 * 픽셀 연필 — 커뮤니티 내비 아이콘(Figma 1019:38520)과 같은 그림.
 * 헤더·하단 내비의 커뮤니티 아이콘과 편집 진입(분양글 수정 등)이 함께 쓴다.
 * 그림은 NAV_ICON_DATA 한 곳에서 가져온다 — 앱 탭 바도 같은 데이터를 쓴다.
 */
const PixelPencilIcon = (props: SVGProps<SVGSVGElement>) => (
  <NavIconSvg data={NAV_ICON_DATA.community} {...props} />
)

export { PixelPencilIcon }
