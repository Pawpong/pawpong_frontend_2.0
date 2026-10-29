'use client'

import { useEffect, useId, useRef, useState, type Ref } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { PixelArrowRightIcon } from '@/shared/assets'

export interface PlaygroundFeature {
  key: string
  href: string
  label: string
  title: string
  description: string
}

/** Portrait editorial covers, with touch scrolling and keyboard-accessible paging. */
export function PlaygroundFeatureRail({
  title,
  description,
  items,
  moreHref,
}: {
  title: string
  description: string
  items: PlaygroundFeature[]
  moreHref?: string
}) {
  const id = useId()
  const rail = useRef<HTMLUListElement>(null)
  const [edges, setEdges] = useState({ start: true, end: false })
  useEffect(() => {
    const node = rail.current
    if (!node) return
    const update = () =>
      setEdges({
        start: node.scrollLeft < 2,
        end: node.scrollLeft + node.clientWidth >= node.scrollWidth - 2,
      })
    update()
    node.addEventListener('scroll', update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => {
      node.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [items.length])
  const move = (direction: number) => {
    const node = rail.current
    if (!node) return
    node.scrollBy({
      left: direction * node.clientWidth * 0.85,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }
  return (
    <section aria-labelledby={`${id}-title`} className="min-w-0">
      <header className="mb-4 flex items-end justify-between gap-3 tab:mb-5">
        <div className="min-w-0">
          <h2 id={`${id}-title`} className="font-cafe24 text-xl text-neutral-850 tab:text-2xl">
            {title}
          </h2>
          <p className="mt-1 text-body-sm text-neutral-700 tab:text-body-md">{description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {moreHref && (
            <Link
              href={moreHref}
              className="mr-2 inline-flex min-h-11 items-center text-body-sm text-neutral-700 focus-ring tab:text-body-md"
            >
              모아보기
            </Link>
          )}
          <button
            type="button"
            aria-label={`${title} 이전 카드`}
            aria-controls={`${id}-rail`}
            disabled={edges.start}
            onClick={() => move(-1)}
            className="hidden size-11 items-center justify-center rounded-lg text-primary-700 focus-ring hover:bg-secondary-50 disabled:text-neutral-300 tab:flex"
          >
            <PixelArrowRightIcon aria-hidden className="size-4 rotate-180" />
          </button>
          <button
            type="button"
            aria-label={`${title} 다음 카드`}
            aria-controls={`${id}-rail`}
            disabled={edges.end}
            onClick={() => move(1)}
            className="hidden size-11 items-center justify-center rounded-lg text-primary-700 focus-ring hover:bg-secondary-50 disabled:text-neutral-300 tab:flex"
          >
            <PixelArrowRightIcon aria-hidden className="size-4" />
          </button>
        </div>
      </header>
      <PlaygroundFeatureCards ref={rail} id={`${id}-rail`} items={items} />
    </section>
  )
}

/** 세로 표지 카드 줄. 손가락·트랙패드로 좌우 스크롤한다 (홈 놀이터 줄도 같이 쓴다). */
export function PlaygroundFeatureCards({
  items,
  ref,
  id,
  cover = 'v1',
}: {
  items: PlaygroundFeature[]
  ref?: Ref<HTMLUListElement>
  id?: string
  /** 표지 그림 — v1 놀이터 일러스트 / v4 배너 캐릭터 (홈) */
  cover?: 'v1' | 'v4'
}) {
  return (
    <ul
      ref={ref}
      id={id}
      className="flex snap-x snap-mandatory [scrollbar-width:thin] gap-3 overflow-x-auto overscroll-x-contain pb-3 tab:gap-4"
    >
      {items.map((item, index) => (
        <li
          key={item.key}
          className="w-[56%] max-w-52 shrink-0 snap-start tab:w-[calc((100%-2rem)/3.25)] tab:max-w-none pc:w-[calc((100%-4rem)/4.5)]"
        >
          <Link
            href={item.href}
            className="group relative block aspect-[3/4] overflow-hidden rounded-lg bg-primary-800 focus-ring-inset"
          >
            <Image
              src={`/images/playground/covers/${item.key}-${cover}.png`}
              alt=""
              fill
              sizes="(max-width: 767px) 56vw, (max-width: 1439px) 30vw, 22vw"
              loading={index === 0 ? 'eager' : 'lazy'}
              className="object-cover transition-transform duration-300 group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
            />
            <span
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-primary-900/95 via-primary-900/15 to-transparent"
            />
            <div className="absolute inset-x-0 bottom-0 flex flex-col p-3 text-white tab:p-6">
              <span className="mb-1 text-xs font-medium text-secondary-200 tab:mb-2 tab:text-body-sm">
                {item.label}
              </span>
              <h3 className="font-cafe24 text-xl leading-snug whitespace-pre-line tab:text-2xl">
                {item.title}
              </h3>
              <p className="mt-3 hidden text-body-sm text-white/90 tab:block">{item.description}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
