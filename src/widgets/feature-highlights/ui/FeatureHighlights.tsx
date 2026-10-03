'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  getFeatureHighlights,
  visibleHighlights,
  type FeatureHighlight,
  type HighlightPlacement,
} from '@/entities/feature-highlight'
import { Container } from '@/shared/ui'
import { PixelArrowRightIcon } from '@/shared/assets'
import { cafe24Proup } from '@/shared/lib/fonts'
import styles from './FeatureHighlights.module.css'

export function FeatureHighlights({
  placement,
  renderMap,
  className,
}: {
  placement: HighlightPlacement
  className?: string
  renderMap: (card: FeatureHighlight) => ReactNode
}) {
  const query = useQuery({
    queryKey: ['feature-highlights', placement],
    queryFn: ({ signal }) => getFeatureHighlights(placement, signal),
    staleTime: 0,
    gcTime: 0,
    retry: 1,
    // 선택적 소개 영역의 잘못된 응답이 전체 페이지 오류 경계로 전파되지 않게 한다.
    throwOnError: false,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })
  // 미설정 기본값은 서버가 반환한다. 정상 빈 설정이나 오류에 기본 카드를 되살리지 않는다.
  if (query.isError || !query.data) return null
  const cards = visibleHighlights(query.data, placement)
  if (cards.length === 0) return null

  return (
    <Container className={`py-4 tab:py-6 ${className ?? ''}`}>
      <div className={styles.list} aria-label="포퐁의 새로운 기능">
        {cards.map((card) =>
          card.icon === 'map' ? (
            <div key={card.id}>{renderMap(card)}</div>
          ) : (
            <section key={card.id} aria-label={card.title} className={styles.card}>
              <div className={styles.intro}>
                <svg
                  viewBox="0 0 32 32"
                  className={styles.icon}
                  aria-hidden="true"
                  focusable="false"
                  shapeRendering="crispEdges"
                >
                  <path
                    fill="currentColor"
                    d={
                      card.icon === 'heart'
                        ? 'M4 4h8v4h8V4h8v4h4v12h-4v4h-4v4h-4v4h-8v-4H8v-4H4v-4H0V8h4Z'
                        : 'M12 0h8v8h4v4h8v8h-8v4h-4v8h-8v-8H8v-4H0v-8h8V8h4Z'
                    }
                  />
                  <path
                    fill="var(--color-point-500)"
                    d={
                      card.icon === 'heart'
                        ? 'M4 8h8v4h8V8h8v12h-4v4h-4v4h-8v-4H8v-4H4Z'
                        : 'M12 8h8v4h4v8h-4v4h-8v-4H8v-8h4Z'
                    }
                  />
                </svg>
                <div className={styles.copy}>
                  {card.eyebrow && <p className={styles.eyebrow}>{card.eyebrow}</p>}
                  <h2 className={`${cafe24Proup.className} ${styles.title}`}>{card.title}</h2>
                  {card.description && <p className={styles.description}>{card.description}</p>}
                </div>
              </div>
              <div className={styles.actions}>
                {card.actions.map((action, index) => (
                  <Link
                    key={`${action.href}-${index}`}
                    href={action.href}
                    className={`${cafe24Proup.className} ${styles.action}`}
                    data-primary={index === 0}
                  >
                    <span>{action.label}</span>
                    <PixelArrowRightIcon
                      className={styles.arrow}
                      aria-hidden="true"
                      focusable="false"
                    />
                  </Link>
                ))}
              </div>
            </section>
          ),
        )}
      </div>
    </Container>
  )
}
