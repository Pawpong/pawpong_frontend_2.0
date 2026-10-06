import {
  PET_COLLECTION_LABELS,
  PET_SLOT_LABELS,
  PET_SLOTS,
} from '@/entities/playground-pet/model/room'
import type {
  PetCatalogFilters as Filters,
  PetCatalogMode,
} from '@/entities/playground-pet/model/shop.types'
import { PET_INVENTORY_STATUSES, PET_SHOP_STATUSES } from '../constants/pet-shop'
import styles from './PetRoom.module.css'

export function PetCatalogFilters({
  mode,
  filters,
  disabled,
  onChange,
}: {
  mode: PetCatalogMode
  filters: Filters
  disabled: boolean
  onChange: (patch: Partial<Filters>) => void
}) {
  const prefix = `pet-${mode}`
  return (
    <div className={styles.catalogFilters}>
      <label className={styles.catalogSearch} htmlFor={`${prefix}-search`}>
        <span>소품 찾기</span>
        <input
          id={`${prefix}-search`}
          type="search"
          value={filters.query}
          maxLength={80}
          placeholder="소품 이름이나 테마"
          disabled={disabled}
          onChange={(event) => onChange({ query: event.target.value })}
        />
      </label>
      <div className={styles.slots} aria-label="가구 종류">
        {(['all', ...PET_SLOTS] as const).map((id) => (
          <button
            key={id}
            className={styles.slotButton}
            aria-pressed={filters.slot === id}
            disabled={disabled}
            onClick={() => onChange({ slot: id })}
          >
            {id === 'all' ? '전체' : PET_SLOT_LABELS[id]}
          </button>
        ))}
      </div>
      <div className={styles.catalogSelects}>
        <label htmlFor={`${prefix}-theme`}>
          <span>방 테마</span>
          <select
            id={`${prefix}-theme`}
            value={filters.collection}
            disabled={disabled}
            onChange={(event) => onChange({ collection: event.target.value })}
          >
            <option value="">모든 테마</option>
            {Object.entries(PET_COLLECTION_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor={`${prefix}-status`}>
          <span>보유 상태</span>
          <select
            id={`${prefix}-status`}
            value={filters.status}
            disabled={disabled}
            onChange={(event) => onChange({ status: event.target.value as Filters['status'] })}
          >
            {(mode === 'shop' ? PET_SHOP_STATUSES : PET_INVENTORY_STATUSES).map(({ id, label }) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor={`${prefix}-sort`}>
          <span>정렬</span>
          <select
            id={`${prefix}-sort`}
            value={filters.sort}
            disabled={disabled}
            onChange={(event) => onChange({ sort: event.target.value as Filters['sort'] })}
          >
            <option value="recommended">{mode === 'shop' ? '추천 순' : '적용 중 먼저'}</option>
            <option value="price-asc">별사탕 적은 순</option>
            <option value="price-desc">별사탕 많은 순</option>
          </select>
        </label>
      </div>
    </div>
  )
}
