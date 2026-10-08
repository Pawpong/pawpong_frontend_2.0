import Link from 'next/link'
import {
  LocationPinIcon,
  PixelCheckIcon,
  PixelArrowRightIcon,
  PixelPencilIcon,
} from '@/shared/assets'

// 놀이와 분리한 돌봄 도구. 병원·준비물은 필요할 때 찾는 기능이라 게임처럼 꾸미지 않는다.
const CARE_TOOLS = [
  {
    href: '/community/write?experience=walk',
    title: '산책 사진으로 다녀온 곳 나누기',
    body: '사진의 촬영 위치는 확인한 장소만 공개돼요.',
    Icon: LocationPinIcon,
  },
  {
    href: '/playground/outing',
    title: '외출 준비함',
    body: '산책·카페·여행·병원 준비물을 기기에 체크해 둬요.',
    Icon: PixelCheckIcon,
  },
  {
    href: '/community/write?experience=clinic',
    title: '병원 방문 기록',
    body: '진료 내용과 다음 일정을 기록으로 남겨요.',
    Icon: PixelPencilIcon,
  },
] as const

export function PlaygroundCareShelf() {
  return (
    <section
      aria-labelledby="playground-care"
      className="rounded-2xl border border-secondary-200 bg-base-white p-5 tab:p-6"
    >
      <h2 id="playground-care" className="font-cafe24 text-lg text-neutral-850">
        필요할 때 꺼내 쓰는 기록·돌봄 도구
      </h2>
      <ul className="mt-4 grid gap-2 lap:grid-cols-3">
        {CARE_TOOLS.map(({ href, title, body, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex h-full min-h-16 items-center gap-3 rounded-xl border border-secondary-200 bg-secondary-50 px-4 py-3 focus-ring transition-colors hover:bg-point-100"
            >
              <Icon aria-hidden className="size-6 shrink-0 text-primary-500" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-neutral-850">{title}</span>
                <span className="mt-0.5 block text-xs leading-5 break-keep text-neutral-700">
                  {body}
                </span>
              </span>
              <PixelArrowRightIcon aria-hidden className="size-3 shrink-0 text-primary-500" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
