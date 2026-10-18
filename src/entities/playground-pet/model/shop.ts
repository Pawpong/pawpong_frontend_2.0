import { itemAvailability, PET_COLLECTION_LABELS, PET_SLOT_LABELS } from './room'
import type { PetCatalogFilters, PetCatalogMode } from './shop.types'
import type { PetGameState } from './types'

const searchable = (value: string) => value.normalize('NFC').toLocaleLowerCase('ko-KR').trim()

export function filterPetCatalog(
  game: PetGameState,
  level: number,
  mode: PetCatalogMode,
  filters: PetCatalogFilters,
) {
  const query = searchable(filters.query)
  return game.catalog
    .filter((item) => {
      const state = itemAvailability(game, item, level)
      if (mode === 'inventory' && !state.owned) return false
      if (filters.slot !== 'all' && item.slot !== filters.slot) return false
      if (filters.collection && item.collection !== filters.collection) return false
      if (filters.status === 'available' && !state.purchasable) return false
      if (filters.status === 'locked' && !state.locked) return false
      if (filters.status === 'missing' && state.owned) return false
      if (filters.status === 'equipped' && !state.equipped) return false
      return (
        !query ||
        searchable(
          `${item.name} ${item.description} ${PET_SLOT_LABELS[item.slot]} ${PET_COLLECTION_LABELS[item.collection] ?? item.collection}`,
        ).includes(query)
      )
    })
    .sort((a, b) => {
      if (filters.sort === 'price-asc') return a.price - b.price || a.id.localeCompare(b.id)
      if (filters.sort === 'price-desc') return b.price - a.price || a.id.localeCompare(b.id)
      const rank = (item: typeof a) => {
        const state = itemAvailability(game, item, level)
        return mode === 'inventory'
          ? state.equipped
            ? 0
            : 1
          : state.purchasable
            ? 0
            : state.owned
              ? 2
              : state.locked
                ? 3
                : 1
      }
      return (
        rank(a) - rank(b) ||
        a.minLevel - b.minLevel ||
        a.price - b.price ||
        a.id.localeCompare(b.id)
      )
    })
}

/** 레벨이 from에서 to로 오르며 새로 고를 수 있게 된 미보유 소품. 가격이 낮은 순. */
export function newlyAvailablePetItems(game: PetGameState, from: number, to: number) {
  return game.catalog
    .filter(
      (item) => item.minLevel > from && item.minLevel <= to && !game.inventory.includes(item.id),
    )
    .sort((a, b) => a.price - b.price || a.id.localeCompare(b.id))
}

/** 아직 다 모으지 못한 모음 중 남은 별사탕이 가장 적은 것. 모두 모았으면 null. */
export function nextPetCollection(game: PetGameState) {
  return (
    petCollectionProgress(game)
      .filter((collection) => collection.owned < collection.total)
      .sort((a, b) => a.remainingPrice - b.remainingPrice || a.id.localeCompare(b.id))[0] ?? null
  )
}

export function petCollectionProgress(game: PetGameState) {
  return Object.entries(PET_COLLECTION_LABELS)
    .map(([id, label]) => {
      const items = game.catalog.filter((item) => item.collection === id)
      const missing = items.filter((item) => !game.inventory.includes(item.id))
      return {
        id,
        label,
        total: items.length,
        owned: items.length - missing.length,
        remainingPrice: missing.reduce((total, item) => total + item.price, 0),
      }
    })
    .filter((collection) => collection.total > 0)
}
