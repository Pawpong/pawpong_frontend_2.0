import Link from 'next/link'
import { ArrowRightIcon, PawPrintIcon } from '@/shared/assets/icons'

// Figma 2752-266394 — 배경은 bg/interactive/secondary-color/secondary-bg.
// globals.css 에도 dtoken.tokens.json 에도 없는 색이라 사용처가 한 곳뿐인 지금은 여기서만 쓴다.
// 다른 화면에도 나오면 그때 토큰으로 승격할 것.
const BANNER_BG = 'bg-[#fbe8be]'

/** 우측 발자국 장식 — 시안은 45도 회전한 발바닥 4개가 배너 위아래로 잘려 나간다 */
const PAW_DECORATIONS = [
  'right-[6.5rem] -top-2 size-14 rotate-45',
  'right-[3.5rem] top-5 size-14 rotate-45',
  '-right-2 -top-1 size-14 rotate-45',
] as const

/** 브리더 마이홈 -> 분양 페이지 이동 배너 (Figma 2752-266394) */
const AdoptionPageBanner = () => (
  <Link
    href="/adoption"
    className={`relative flex items-center overflow-hidden rounded-xl px-5 py-3 tab:px-8 ${BANNER_BG}`}
  >
    <span className="flex items-center gap-[0.4375rem]">
      <span className="font-cafe24 text-sm leading-[1.5] text-primary-600">
        분양 페이지 바로가기
      </span>
      <ArrowRightIcon className="size-5 shrink-0 text-primary-600" />
    </span>

    <span
      aria-hidden
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-52 tab:block"
    >
      {PAW_DECORATIONS.map((position) => (
        <PawPrintIcon key={position} className={`absolute text-white/50 ${position}`} />
      ))}
    </span>
  </Link>
)

export { AdoptionPageBanner }
