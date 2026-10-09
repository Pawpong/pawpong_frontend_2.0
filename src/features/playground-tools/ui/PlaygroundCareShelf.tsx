import Link from 'next/link'
import {
  LocationPinIcon,
  PixelCheckIcon,
  PixelArrowRightIcon,
  PixelPencilIcon,
} from '@/shared/assets'
import styles from './Discovery.module.css'

// 놀이와 분리한 돌봄 도구. 놀이 카드와 같은 티켓 틀을 쓰되, 흔들림 없이 차분한 초록 색으로 구분한다.
const CARE_TOOLS = [
  {
    href: '/community/write?experience=walk',
    label: 'WALK NOTE',
    title: '산책 사진으로 다녀온 곳 나누기',
    body: '사진의 촬영 위치는 확인한 장소만 공개돼요.',
    cta: '사진 올리기',
    Icon: LocationPinIcon,
  },
  {
    href: '/playground/outing',
    label: 'CHECK LIST',
    title: '외출 준비함',
    body: '산책·카페·여행·병원 준비물을 기기에 체크해 둬요.',
    cta: '준비물 챙기기',
    Icon: PixelCheckIcon,
  },
  {
    href: '/community/write?experience=clinic',
    label: 'CLINIC NOTE',
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
        필요할 때 꺼내 쓰는 기록·돌봄 도구
      </h2>
      <ul className="mt-5 grid gap-4 tab:grid-cols-3">
        {CARE_TOOLS.map(({ href, label, title, body, cta, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              data-accent="green"
              className={`${styles.ticket} flex h-full flex-col focus-ring`}
            >
              <span className={styles.ticketTop}>
                <span>{label}</span>
                <Icon aria-hidden className="size-4" />
              </span>
              <span className="flex flex-1 flex-col p-4 tab:p-5">
                <span className="text-base font-semibold break-keep text-neutral-850">{title}</span>
                <span className="mt-1.5 text-xs leading-5 break-keep text-neutral-700">{body}</span>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-primary-600">
                  {cta}
                  <PixelArrowRightIcon aria-hidden className="size-3" />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
