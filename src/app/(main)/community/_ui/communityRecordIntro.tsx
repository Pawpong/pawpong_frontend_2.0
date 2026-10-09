import type { ReactNode } from 'react'
import { LocationPinIcon, PawPrintIcon, PixelPencilIcon } from '@/shared/assets'
import type { TicketAccent } from '@/shared/ui/Ticket'

type RecordIntro = {
  label: string
  accent: TicketAccent
  icon: ReactNode
  title: string
  description: string
}

/**
 * 놀이터 기록·돌봄 도구와 외출 준비함에서 기록 링크로 들어온 새 글의 머리 티켓.
 * 놀이터 티켓과 같은 라벨·색을 써서 어디서 왔는지 이어지게 한다. 모르는 값이면 기본 머리를 쓴다.
 */
const RECORD_INTRO: Record<string, RecordIntro> = {
  walk: {
    label: 'WALK NOTE',
    accent: 'green',
    icon: <LocationPinIcon aria-hidden className="size-4" />,
    title: '산책 기록 남기기',
    description:
      '걸은 길과 우리 아이가 좋아한 곳을 사진으로 남겨요. 사진의 촬영 위치는 확인한 장소만 공개돼요.',
  },
  clinic: {
    label: 'CLINIC NOTE',
    accent: 'green',
    icon: <PixelPencilIcon aria-hidden className="size-4" />,
    title: '병원 방문 기록 남기기',
    description:
      '내가 겪은 방문 경험과 다음에 챙길 점을 기록해요. 진단·처방 내용이나 진료기록 사진은 올리지 말아 주세요.',
  },
  daily: {
    label: 'DAILY NOTE',
    accent: 'butter',
    icon: <PawPrintIcon aria-hidden className="size-4" />,
    title: '오늘 이야기 남기기',
    description: '함께한 하루와 우리 아이가 좋아한 순간을 편하게 남겨요.',
  },
  travel: {
    label: 'TRIP NOTE',
    accent: 'blue',
    icon: <LocationPinIcon aria-hidden className="size-4" />,
    title: '여행 이야기 남기기',
    description: '다녀온 곳의 동반 조건과 이동 방법, 챙기면 좋은 준비물을 나눠요.',
  },
}

export function communityRecordIntro(record: string | undefined): RecordIntro | null {
  return typeof record === 'string' && Object.hasOwn(RECORD_INTRO, record)
    ? RECORD_INTRO[record]
    : null
}
