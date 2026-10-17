import Link from 'next/link'
import {
  LocationPinIcon,
  PixelArrowRightIcon,
  PixelCheckIcon,
  PixelPencilIcon,
} from '@/shared/assets'

// 기록 도구는 하나의 목록으로 묶고, 포퐁 공통 도트 아이콘으로 목적을 구분한다.
const CARE_TOOLS = [
  {
    href: '/community/write?experience=walk',
    title: '산책 사진 나누기',
    body: '사진의 촬영 위치는 확인한 장소만 공개돼요.',
    cta: '사진 올리기',
    Icon: LocationPinIcon,
  },
  {
    href: '/playground/outing',
    title: '외출 준비함',
    body: '외출 전 필요한 준비물을 기기에 체크해 둬요.',
    cta: '준비물 챙기기',
    Icon: PixelCheckIcon,
  },
  {
    href: '/community/write?experience=clinic',
    title: '병원 방문 기록',
    body: '진료 내용과 다음 일정을 기록으로 남겨요.',
    cta: '기록 남기기',
    Icon: PixelPencilIcon,
  },
] as const

export function PlaygroundCareShelf() {
  return (
    <section aria-labelledby="playground-care">
      <p className="text-xs font-semibold text-primary-600">놀다가도 꼭 챙길 것</p>
      <h2 id="playground-care" className="mt-1 font-cafe24 text-2xl text-neutral-850">
        기록·돌봄 도구
      </h2>
      <ul className="mt-5 grid divide-y divide-primary-100 rounded-xl border border-primary-100 bg-point-50 lap:grid-cols-3 lap:divide-x lap:divide-y-0">
        {CARE_TOOLS.map(({ href, title, body, cta, Icon }) => (
          <li key={href} className="min-w-0">
            <Link
              href={href}
              className="group flex h-full items-start gap-3 rounded-lg p-4 focus-ring transition-colors hover:bg-point-100 active:bg-point-200 motion-reduce:transition-none tab:gap-4 tab:p-5"
            >
              <span className="grid size-11 shrink-0 place-items-center text-primary-500">
                <Icon aria-hidden className="size-8" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col self-stretch">
                <span className="text-base font-semibold break-keep text-neutral-850">{title}</span>
                <span className="mt-1.5 text-sm leading-6 break-keep text-neutral-700">{body}</span>
                <span className="mt-auto inline-flex items-center gap-2 pt-3 text-sm font-semibold whitespace-nowrap text-primary-700 group-hover:underline group-focus-visible:underline">
                  {cta}
                  <PixelArrowRightIcon aria-hidden className="size-3 shrink-0" />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
