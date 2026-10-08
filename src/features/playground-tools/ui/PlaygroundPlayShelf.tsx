import Link from 'next/link'
import { PawPrintIcon, PixelArrowRightIcon, ProfileStarIcon } from '@/shared/assets'
import styles from './Discovery.module.css'

const PLAYS = [
  {
    href: '/playground/walk-card',
    eyebrow: '두 가지만 고르면 끝',
    title: '오늘의 산책 뽑기',
    body: '동네에서도 집에서도, 오늘의 분위기에 맞는 놀이 카드를 한 장 뽑아요.',
    cta: '카드 뽑으러 가기',
    accent: 'butter',
    Icon: PawPrintIcon,
  },
  {
    href: '/playground/taste',
    eyebrow: '질문 네 개, 정답은 없어요',
    title: '우리 아이 취향 찾기',
    body: '보호자가 떠올린 모습으로 오늘의 취향 카드를 완성해요.',
    cta: '취향 카드 만들기',
    accent: 'blue',
    Icon: ProfileStarIcon,
  },
] as const

const LOOP = ['카드 뽑기', '사진으로 남기기', '방에서 함께 놀기']

export function PlaygroundPlayShelf() {
  return (
    <section aria-labelledby="playground-play">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-primary-600">매일 들르고 싶은 놀이터</p>
          <h2 id="playground-play" className="mt-1 font-cafe24 text-2xl text-neutral-850">
            오늘은 무엇을 하고 놀까요?
          </h2>
        </div>
        <ol
          aria-label="놀이 순서"
          className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-700"
        >
          {LOOP.map((step, index) => (
            <li key={step} className="flex items-center gap-1.5">
              <span className="rounded-full bg-point-200 px-2.5 py-1 font-semibold text-neutral-850">
                {step}
              </span>
              {index < LOOP.length - 1 && <PixelArrowRightIcon aria-hidden className="size-2.5" />}
            </li>
          ))}
        </ol>
      </div>
      <ul className="mt-5 grid gap-4 tab:grid-cols-2">
        {PLAYS.map(({ href, eyebrow, title, body, cta, accent, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              data-accent={accent}
              className={`${styles.ticket} group flex h-full flex-col focus-ring transition-transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
            >
              <span className={styles.ticketTop}>
                <span>PLAY CARD</span>
                <Icon aria-hidden className="size-5" />
              </span>
              <span className="flex flex-1 flex-col p-5 tab:p-6">
                <span className="text-xs font-semibold text-primary-600">{eyebrow}</span>
                <span className="mt-1 font-cafe24 text-xl text-neutral-850 tab:text-2xl">
                  {title}
                </span>
                <span className="mt-2 text-sm leading-6 break-keep text-neutral-700">{body}</span>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600">
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
