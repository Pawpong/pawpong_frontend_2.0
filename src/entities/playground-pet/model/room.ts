import type { PetCatalogItem, PetGameState, PetRoomSlot, PetRoomState } from './types'

export const PET_SLOT_LABELS: Record<PetRoomSlot, string> = {
  wallpaper: '벽지',
  floor: '바닥',
  bed: '침대',
  toy: '장난감',
  plant: '화분',
  decoration: '장식',
}
export const PET_SLOTS = Object.keys(PET_SLOT_LABELS) as PetRoomSlot[]
export const PET_COLLECTION_LABELS: Record<string, string> = {
  cozy: '포근한 방',
  forest: '숲속 방',
  starry: '별빛 방',
  cloud: '구름 방',
}
export const PET_SLOT_POSITIONS = {
  bed: { x: 250, y: 168, width: 64, height: 64 },
  toy: { x: 190, y: 184, width: 40, height: 40 },
  plant: { x: 40, y: 142, width: 48, height: 64 },
  decoration: { x: 280, y: 70, width: 36, height: 36 },
} as const

export function itemAvailability(game: PetGameState, item: PetCatalogItem, level: number) {
  const owned = game.inventory.includes(item.id)
  const equipped = game.room[item.slot] === item.id
  const locked = level < item.minLevel
  const affordable = game.wallet.stars >= item.price
  return { owned, equipped, locked, affordable, purchasable: !owned && !locked && affordable }
}

/** A temporary preview copies one slot. It never changes inventory, money or the saved room. */
export function previewPetRoom(room: PetRoomState, item: PetCatalogItem | null): PetRoomState {
  return item ? { ...room, [item.slot]: item.id } : room
}

/** 320×224 방 좌표의 슬롯 영역. 꾸미기 핫스팟과 미리보기 강조가 같은 값을 쓴다. */
export const PET_SLOT_AREAS: Record<
  PetRoomSlot,
  { x: number; y: number; width: number; height: number }
> = {
  wallpaper: { x: 136, y: 20, width: 96, height: 60 },
  floor: { x: 84, y: 196, width: 96, height: 24 },
  bed: { x: 218, y: 104, width: 64, height: 64 },
  toy: { x: 170, y: 144, width: 40, height: 40 },
  plant: { x: 16, y: 78, width: 48, height: 64 },
  decoration: { x: 262, y: 34, width: 36, height: 36 },
}

/** 화면을 누른 위치(0..1 비율)를 방 좌표로 바꾼다. 방 밖이면 null. */
export function petStagePoint(ratioX: number, ratioY: number): { x: number; y: number } | null {
  if (!(ratioX >= 0 && ratioX <= 1 && ratioY >= 0 && ratioY <= 1)) return null
  return { x: Math.round(ratioX * 320), y: Math.round(ratioY * 224) }
}
