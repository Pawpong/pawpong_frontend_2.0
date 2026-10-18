import type { PetRoomSlot } from './types'

export type PetCatalogMode = 'inventory' | 'shop'
export type PetCatalogStatus = 'all' | 'available' | 'locked' | 'missing' | 'equipped'
export type PetCatalogSort = 'recommended' | 'price-asc' | 'price-desc'
export type PetCatalogFilters = {
  slot: PetRoomSlot | 'all'
  collection: string
  status: PetCatalogStatus
  sort: PetCatalogSort
  query: string
}
