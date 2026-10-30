'use client'

import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  getFeatureHighlights,
  visibleHighlights,
  type FeatureHighlight,
  type HighlightPlacement,
} from '@/entities/feature-highlight'
import { TicketActionCard } from '@/shared/ui/TicketActionCard'

export function FeatureHighlights({
  placement,
  renderMap,
}: {
  placement: HighlightPlacement
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
    <div className="py-4 tab:py-6">
      <div className="grid gap-5" aria-label="포퐁의 새로운 기능">
        {cards.map((card) =>
          card.icon === 'map' ? (
            <div key={card.id}>{renderMap(card)}</div>
          ) : (
            // 놀이터 티켓과 같은 틀. 하트는 복숭아, 반짝임은 버터 색 띠를 쓴다.
            <TicketActionCard
              key={card.id}
              label="NEW"
              accent={card.icon === 'heart' ? 'peach' : 'butter'}
              icon={
                <svg
                  viewBox="0 0 32 32"
                  className="size-11 flex-none text-primary-500 tab:size-14"
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
              }
              eyebrow={card.eyebrow}
              title={card.title}
              description={card.description}
              actions={card.actions}
            />
          ),
        )}
      </div>
    </div>
  )
}
