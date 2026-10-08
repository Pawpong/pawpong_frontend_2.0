import type { OutingPace, OutingSetting, PlayCard, TasteType } from '../model/discovery.types'

export const OUTING_SETTINGS: { id: OutingSetting; label: string; detail: string }[] = [
  { id: 'outside', label: '익숙한 동네에서', detail: '평소 함께 걷던 곳을 새롭게' },
  { id: 'inside', label: '편안한 집에서', detail: '밖에 나가지 않아도 괜찮아요' },
]
export const OUTING_PACES: { id: OutingPace; label: string; detail: string }[] = [
  { id: 'slow', label: '느긋하게 쉬고 싶어', detail: '가만히 바라보는 것도 놀이' },
  { id: 'curious', label: '새로운 걸 발견하고 싶어', detail: '작은 발견을 하나씩' },
]

export const OUTING_DECKS: Record<OutingSetting, Record<OutingPace, readonly PlayCard[]>> = {
  outside: {
    slow: [
      {
        id: 'sunlight-collector',
        label: '느긋한 동네 산책',
        title: '햇살 수집가',
        description: '멀리 가지 않아도, 늘 걷던 길에 작은 장면이 숨어 있어요.',
        moments: [
          '보호자가 마음에 드는 풍경 하나 찾기',
          '아이가 머무는 곳에서 서두르지 않기',
          '오늘의 풍경을 사진 한 장으로 남기기',
        ],
        accent: 'butter',
        memoryMessage: '늘 걷던 길에서 햇살을 모은 날',
      },
      {
        id: 'sound-explorer',
        label: '느긋한 동네 산책',
        title: '동네 소리 탐험대',
        description: '오늘은 눈보다 귀를 조금 더 열어볼까요?',
        moments: [
          '익숙한 길에서 주변 소리에 귀 기울이기',
          '아이가 편안해하는 곳에서 잠깐 쉬기',
          '오늘 들었던 소리를 한 문장으로 남기기',
        ],
        accent: 'green',
        memoryMessage: '함께 귀 기울인 우리 동네의 소리',
      },
      {
        id: 'shadow-studio',
        label: '느긋한 동네 산책',
        title: '그림자 사진관',
        description: '함께 걷는 그림자도 멋진 기념사진이 돼요.',
        moments: [
          '통행을 방해하지 않는 익숙한 길 고르기',
          '보호자와 아이의 그림자 찾아보기',
          '무리한 포즈 없이 함께한 장면 남기기',
        ],
        accent: 'peach',
        memoryMessage: '나란히 걸은 우리 둘의 그림자',
      },
    ],
    curious: [
      {
        id: 'green-explorer',
        label: '동네 발견 놀이',
        title: '초록빛 탐험가',
        description: '매일 보던 동네에서 오늘의 색을 찾아보세요.',
        moments: [
          '보호자가 초록색 풍경 세 가지 찾아보기',
          '아이가 관심 보이는 풍경을 관찰하기',
          '가장 마음에 든 장면을 추억 카드로 만들기',
        ],
        accent: 'green',
        memoryMessage: '오늘 우리가 찾은 초록빛 장면',
      },
      {
        id: 'neighborhood-photographer',
        label: '동네 발견 놀이',
        title: '우리 동네 사진작가',
        description: '아이가 바라보는 방향을 따라 오늘의 사진을 골라요.',
        moments: [
          '안전하게 멈출 수 있는 곳 고르기',
          '아이를 유도하지 않고 바라보는 방향 살펴보기',
          '그 풍경에 나만의 제목 붙이기',
        ],
        accent: 'blue',
        memoryMessage: '네가 바라본 곳을 나도 바라본 날',
      },
      {
        id: 'tiny-scene-collector',
        label: '동네 발견 놀이',
        title: '작은 풍경 수집가',
        description: '특별한 장소 대신, 평소 지나쳤던 한 장면을 찾아요.',
        moments: [
          '평소 걷던 길에서 새로운 무늬 찾아보기',
          '아이의 속도에 맞춰 익숙한 길 걷기',
          '다음에도 기억하고 싶은 풍경 남기기',
        ],
        accent: 'butter',
        memoryMessage: '평소 지나치던 길에서 찾은 작은 풍경',
      },
    ],
  },
  inside: {
    slow: [
      {
        id: 'cozy-room-recorder',
        label: '집에서 보내는 시간',
        title: '포근한 방의 기록가',
        description: '오늘은 아무것도 해내지 않아도 좋은 날이에요.',
        moments: [
          '아이가 평소 쉬는 자리 바라보기',
          '쉬는 아이를 깨우지 않고 한 장면 기억하기',
          '오늘의 편안함을 한 문장으로 적기',
        ],
        accent: 'peach',
        memoryMessage: '아무것도 하지 않아도 좋았던 포근한 하루',
      },
      {
        id: 'album-traveler',
        label: '집에서 보내는 시간',
        title: '추억 앨범 여행자',
        description: '집에서도 함께했던 순간으로 작은 여행을 떠나요.',
        moments: [
          '보관한 사진 중 좋아하는 장면 고르기',
          '그날 기억나는 작은 이야기 떠올리기',
          '오늘의 추억 카드에 사진 담기',
        ],
        accent: 'butter',
        memoryMessage: '사진 속 그날로 떠난 작은 여행',
      },
      {
        id: 'home-observer',
        label: '집에서 보내는 시간',
        title: '우리 집 관찰 일기',
        description: '평범한 하루의 다정한 순간을 발견해요.',
        moments: [
          '아이가 좋아하는 익숙한 공간 살펴보기',
          '방해하지 않고 편안한 모습 관찰하기',
          '좋아 보였던 순간에 짧은 제목 붙이기',
        ],
        accent: 'green',
        memoryMessage: '평범해서 더 다정했던 우리 집의 하루',
      },
    ],
    curious: [
      {
        id: 'taste-detective',
        label: '집에서 발견 놀이',
        title: '취향 발견 탐정',
        description: '정답을 맞히기보다 우리 아이를 다시 보는 시간이에요.',
        moments: [
          '평소 자주 머무는 자리 떠올리기',
          '좋아하는 익숙한 물건 하나 관찰하기',
          '우리 아이 취향 찾기에서 내 예상 골라보기',
        ],
        accent: 'blue',
        memoryMessage: '너의 취향을 하나 더 알게 된 날',
      },
      {
        id: 'photo-storyteller',
        label: '집에서 발견 놀이',
        title: '사진 속 이야기꾼',
        description: '오래된 사진 한 장에 새로운 제목을 붙여볼까요?',
        moments: [
          '재미있는 표정이 담긴 사진 고르기',
          '그 순간의 마음을 상상해 보기',
          '사진과 짧은 문장을 추억 카드로 남기기',
        ],
        accent: 'peach',
        memoryMessage: '사진 한 장에 붙여 본 우리만의 제목',
      },
      {
        id: 'tiny-exhibition',
        label: '집에서 발견 놀이',
        title: '오늘의 작은 전시회',
        description: '우리 아이의 일상을 한 장의 작품으로 골라요.',
        moments: [
          '갤러리에서 좋아하는 사진 세 장 골라보기',
          '오늘 전시할 한 장 선택하기',
          '카드 색과 문구를 골라 나만의 작품 만들기',
        ],
        accent: 'green',
        memoryMessage: '오늘의 전시작, 우리 아이의 일상',
      },
    ],
  },
}

export const TASTE_QUESTIONS = [
  {
    title: '익숙한 공간에서 새로운 물건을 발견하면?',
    options: [
      '먼저 가까이 가서 살펴봐요',
      '조금 떨어져 찬찬히 봐요',
      '내가 뭘 하는지 먼저 봐요',
      '좋아하는 자리에서 쉬어요',
    ],
  },
  {
    title: '사진첩에 가장 자주 담기는 순간은?',
    options: [
      '무언가를 구경하는 순간',
      '한곳을 집중해서 보는 순간',
      '나와 함께 있는 순간',
      '편안하게 쉬는 순간',
    ],
  },
  {
    title: '우리 아이의 하루에 제목을 붙인다면?',
    options: [
      '오늘도 새로운 발견',
      '작은 것도 놓치지 않아',
      '너와 함께라서 좋아',
      '내 자리가 제일 좋아',
    ],
  },
  {
    title: '오늘 함께 남기고 싶은 장면은?',
    options: [
      '익숙한 곳의 새로운 풍경',
      '아이의 눈길이 머문 풍경',
      '함께 나온 다정한 사진',
      '집에서 보낸 포근한 시간',
    ],
  },
] as const

// 선택지 순서(A~D)와 취향 유형의 대응. 질문마다 같은 순서를 유지해야 점수가 맞는다.
export const TASTE_ORDER: readonly TasteType[] = ['explorer', 'observer', 'companion', 'dreamer']

export const TASTE_CARDS: Record<TasteType, PlayCard> = {
  explorer: {
    id: 'taste-explorer',
    label: '오늘의 취향 카드',
    title: '호기심 탐험가',
    description:
      '새로운 장면을 찾아보는 시간을 골랐어요. 익숙한 일상도 다시 보면 작은 모험이 돼요.',
    moments: [
      '함께하는 키워드: 발견',
      '어울리는 놀이: 오늘의 산책 뽑기',
      '기념사진 제목: 오늘은 무엇을 발견했을까?',
    ],
    accent: 'green',
    memoryMessage: '오늘은 무엇을 발견했을까?',
  },
  observer: {
    id: 'taste-observer',
    label: '오늘의 취향 카드',
    title: '차분한 관찰자',
    description: '서두르지 않고 바라보는 시간을 골랐어요. 작은 표정과 눈길에도 이야기가 담겨 있죠.',
    moments: [
      '함께하는 키워드: 관찰',
      '어울리는 놀이: 오늘의 추억 카드',
      '기념사진 제목: 너의 시선이 머무는 곳',
    ],
    accent: 'blue',
    memoryMessage: '너의 시선이 머무는 곳',
  },
  companion: {
    id: 'taste-companion',
    label: '오늘의 취향 카드',
    title: '다정한 짝꿍',
    description:
      '함께 있는 순간을 골랐어요. 특별한 일 없이 같은 하루를 보내는 것만으로도 충분해요.',
    moments: [
      '함께하는 키워드: 다정함',
      '어울리는 놀이: AI 사진 만들기',
      '기념사진 제목: 너와 나, 우리의 하루',
    ],
    accent: 'peach',
    memoryMessage: '너와 나, 우리의 하루',
  },
  dreamer: {
    id: 'taste-dreamer',
    label: '오늘의 취향 카드',
    title: '포근한 몽상가',
    description:
      '익숙하고 편안한 시간을 골랐어요. 바쁜 하루보다 느긋한 장면이 어울리는 오늘이에요.',
    moments: [
      '함께하는 키워드: 편안함',
      '어울리는 놀이: 반려동물 방 꾸미기',
      '기념사진 제목: 오늘은 여기서 쉬어가요',
    ],
    accent: 'butter',
    memoryMessage: '오늘은 여기서 쉬어가요',
  },
}

// 결과 카드 아래에 항상 붙이는 안내. 고정 규칙 놀이임을 숨기지 않는다.
export const PLAY_CARD_NOTICE =
  '가볍게 즐기는 놀이 카드예요. AI 분석이나 성격·건강 진단, 실제 경로 추천이 아니에요.'
