import type { SVGProps } from 'react'
import { NavIconSvg } from './NavIconSvg'
import { NAV_ICON_DATA } from './navIconData'

/** 발바닥 — 빈 프로필 아바타 등. 그림은 NAV_ICON_DATA(앱 탭 바와 공유)에서 가져온다. */
const PawPrintIcon = (props: SVGProps<SVGSVGElement>) => (
  <NavIconSvg data={NAV_ICON_DATA.paw} width="34" height="28" {...props} />
)

export { PawPrintIcon }
