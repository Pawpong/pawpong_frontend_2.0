import { BOTTOM_NAV } from '@/shared/config'
import { NAV_ICON_DATA } from '@/shared/assets'
import { NATIVE_MESSAGE } from '@/shared/lib/nativeBridge'

/**
 * 선택 알약이 한 칸보다 양옆으로 넓은 정도(px). 웹 하단바가 쓰고 앱 탭 바에도 그대로 보낸다.
 * iOS 26 탭 바처럼 알약은 칸에 꼭 맞는다(0) — 넓히면 양 끝 칸(홈·마이)에서 캡슐 안으로 밀려 아이콘과 어긋난다.
 */
export const PILL_OVERHANG = 0

/**
 * 앱 탭 바의 구성 — 탭 목록·순서·라벨·아이콘 그림의 원본은 웹(BOTTOM_NAV, NAV_ICON_DATA)이다.
 * 앱은 이 메시지대로 그리므로 탭을 바꾸거나 아이콘을 고칠 때 웹 배포만 하면 된다.
 * 마이홈은 프로필 사진 칸이라 avatar 로 표시하고, 사진이 없을 때의 발바닥 그림을 함께 보낸다.
 */
export const buildTabConfig = () => ({
  type: NATIVE_MESSAGE.TAB_CONFIG,
  pillOverhang: PILL_OVERHANG,
  // 아이콘 아래 라벨을 보인다 (웹 하단바와 같다)
  showLabels: true,
  tabs: BOTTOM_NAV.map(({ href, label, bottomLabel, glyphs }) =>
    glyphs === 'avatar'
      ? {
          href,
          label: bottomLabel ?? label,
          avatar: true,
          badge: false,
          icon: NAV_ICON_DATA.paw,
          activeIcon: NAV_ICON_DATA.paw,
        }
      : {
          href,
          label: bottomLabel ?? label,
          avatar: false,
          // 채팅 안 읽은 수 배지는 웹 하단바와 같이 채팅 칸에만 단다
          badge: href === '/chat',
          icon: glyphs.icon,
          activeIcon: glyphs.active,
        },
  ),
})
