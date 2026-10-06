import type {
  PetCatalogFilters,
  PetCatalogStatus,
} from '@/entities/playground-pet/model/shop.types'

export const PET_CATALOG_DEFAULT_FILTERS: PetCatalogFilters = {
  slot: 'all',
  collection: '',
  status: 'all',
  sort: 'recommended',
  query: '',
}

export const PET_SHOP_STATUSES: { id: PetCatalogStatus; label: string }[] = [
  { id: 'all', label: '모든 소품' },
  { id: 'available', label: '지금 구매 가능' },
  { id: 'missing', label: '아직 없는 소품' },
  { id: 'locked', label: '성장하면 열려요' },
]

export const PET_INVENTORY_STATUSES: { id: PetCatalogStatus; label: string }[] = [
  { id: 'all', label: '내 소품 전체' },
  { id: 'equipped', label: '방에 적용 중' },
]
