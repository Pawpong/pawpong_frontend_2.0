// 놀이터 소개 카드와 키우기 첫 화면이 같은 예시·단계를 보여주도록 한 곳에 둔다.
// 방에 실제로 놓이는 도트 소품으로 키우기 화면을 미리 보여준다.
export const PET_ROOM_PREVIEWS = [
  { key: 'bed', src: '/playground/pet/v2/bed_basket.png', caption: '포근한 바구니 침대' },
  { key: 'toy', src: '/playground/pet/v2/toy_ball.png', caption: '함께 노는 공' },
  { key: 'plant', src: '/playground/pet/v2/plant_flower.png', caption: '방을 채우는 꽃 화분' },
].map((item) => ({ ...item, alt: `${item.caption} 소품`, pixelated: true }))

export const PET_STEPS = [
  '우리 아이 사진 올리기',
  '도트 친구 고르고 이름 짓기',
  '매일 돌보고 방 꾸미기',
]
