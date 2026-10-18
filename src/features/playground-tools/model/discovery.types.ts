export type OutingSetting = 'outside' | 'inside'
export type OutingPace = 'slow' | 'curious'
export type TasteType = 'explorer' | 'observer' | 'companion' | 'dreamer'
export type BtiParts = readonly ['E' | 'I', 'S' | 'N', 'T' | 'F', 'J' | 'P']
export type BtiLetter = BtiParts[number]
export type BtiType = `${BtiParts[0]}${BtiParts[1]}${BtiParts[2]}${BtiParts[3]}`
export type BtiProfile = {
  title: string
  description: string
  // 결과 카드의 '닮은 모습' 한 줄 — 문항에 나온 장면을 다시 불러온다
  trait: string
  play: string
  memoryMessage: string
}
export type PlayAccent = 'green' | 'peach' | 'blue' | 'butter'
export type PlayCard = {
  // 추억 카드로 넘길 때 쓰는 고정 식별자. 주소에는 이 값만 싣고 문구는 상수에서 다시 찾는다.
  id: string
  label: string
  title: string
  description: string
  moments: readonly string[]
  accent: PlayAccent
  // 추억 카드 한 줄 문구(44자 이하)
  memoryMessage: string
}
