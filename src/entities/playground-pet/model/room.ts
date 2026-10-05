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
