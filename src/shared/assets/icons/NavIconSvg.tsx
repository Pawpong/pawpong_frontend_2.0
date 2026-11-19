import type { SVGProps } from 'react'
import type { NavIconData } from './navIconData'

/** NAV_ICON_DATA 한 개를 그린다. 앱 탭 바도 같은 데이터를 받아 같은 규칙(fill 없음 = 글자색)으로 그린다. */
const NavIconSvg = ({ data, ...props }: SVGProps<SVGSVGElement> & { data: NavIconData }) => (
  <svg viewBox={data.viewBox} fill="currentColor" aria-hidden {...props}>
    {data.paths.map((path, index) => (
      <path key={index} d={path.d} fill={path.fill} />
    ))}
  </svg>
)

export { NavIconSvg }
