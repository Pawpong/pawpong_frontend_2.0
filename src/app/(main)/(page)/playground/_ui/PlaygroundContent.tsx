'use client'

import { useQuery } from '@tanstack/react-query'
import { PlaygroundBilling } from '@/features/in-app-purchase'
import { petConfigOptions } from '@/entities/playground-pet'
import { PLAYGROUND_BILLING_ENABLED } from '@/shared/config/playground'
import { PlaygroundFeatureRail, type PlaygroundFeature } from './PlaygroundFeatureRail'

export const PLAY_FEATURES: PlaygroundFeature[] = [
  {
    key: 'ai-photo',
    href: '/ai-filter',
    label: 'AI 사진 만들기',
    title: '우리 아이의\n새로운 모습',
    description: '도트부터 수채화까지, 사진 한 장으로.',
  },
  {
    key: 'memory',
    href: '/playground/memory-card',
    label: '추억 카드',
    title: '함께한 순간을\n한 장에 담아요',
    description: '사진과 이야기로 꾸미는 우리만의 카드.',
  },
  {
    key: 'pet',
    href: '/playground/pet',
    label: '내 반려동물 키우기',
    title: '작은 방에서\n매일 만나요',
    description: '나만의 도트 반려동물과 함께하는 일상.',
  },
  {
    key: 'walk',
    href: '/playground/walk-card',
    label: '오늘의 산책 뽑기',
    title: '오늘은 어떤\n산책을 할까요?',
    description: '오늘의 기분에 맞는 놀이 카드 한 장.',
  },
  {
    key: 'taste',
    href: '/playground/taste',
    label: '우리 아이 취향 찾기',
    title: '좋아하는 마음을\n발견해요',
    description: '네 가지 질문으로 알아보는 작은 취향.',
  },
  {
    key: 'bti',
    href: '/playground/bti',
    label: '우리 아이 성향 검사',
    title: '우리 아이는\n어떤 성향일까?',
    description: '열두 가지 질문, 열여섯 가지 성향.',
  },
]
export const CARE_FEATURES: PlaygroundFeature[] = [
  {
    key: 'walk-photo',
    href: '/community/write?experience=walk',
    label: '산책 사진 나누기',
    title: '같이 걷던 길을\n기억해요',
    description: '사진과 함께 남기는 오늘의 산책.',
  },
  {
    key: 'outing',
    href: '/playground/outing',
    label: '외출 준비함',
    title: '나가기 전에\n하나씩 챙겨요',
    description: '우리 아이와의 외출, 빠뜨리는 것 없이.',
  },
  {
    key: 'clinic',
    href: '/community/write?experience=clinic',
    label: '병원 방문 기록',
    title: '작은 변화도\n놓치지 않도록',
    description: '진료 내용과 다음 일정을 기록해요.',
  },
]

/** 놀이 기능 목록. 키우기는 서버에서 켜졌을 때만 보인다 (놀이터·홈 공통). */
export const usePlayFeatures = () => {
  const petConfig = useQuery(petConfigOptions)
  return PLAY_FEATURES.filter(
    (item) => item.key !== 'pet' || (petConfig.data?.enabled && !petConfig.isError),
  )
}

export function PlaygroundContent() {
  const features = usePlayFeatures()
  return (
    <div className="space-y-10 tab:space-y-12">
      <header>
        <h1 className="font-cafe24 text-2xl text-neutral-850 tab:text-3xl">포퐁 놀이터</h1>
        <p className="mt-2 text-body-md text-neutral-700 tab:text-body-lg">
          우리 아이와 함께할 작은 즐거움을 골라보세요.
        </p>
      </header>
      <PlaygroundFeatureRail
        title="오늘은 이렇게 놀아요"
        description="사진도, 취향도, 우리 아이만의 이야기로."
        items={features}
        moreHref="/playground/cards"
      />
      <PlaygroundFeatureRail
        title="함께하는 하루를 챙겨요"
        description="산책부터 병원까지, 소중한 일상을 차곡차곡."
        items={CARE_FEATURES}
      />
      {PLAYGROUND_BILLING_ENABLED && <PlaygroundBilling />}
    </div>
  )
}
