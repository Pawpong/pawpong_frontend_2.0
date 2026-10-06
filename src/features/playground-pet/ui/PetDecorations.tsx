'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type {
  PetCatalogItem,
  PetCommand,
  PetGameState,
  PetRoomSlot,
} from '@/entities/playground-pet'
import type { PetCommandResult } from '@/entities/playground-pet/model/commandQueue'
import {
  itemAvailability,
  PET_COLLECTION_LABELS,
  PET_SLOT_LABELS,
  PET_SLOTS,
} from '@/entities/playground-pet/model/room'
import { filterPetCatalog, petCollectionProgress } from '@/entities/playground-pet/model/shop'
import type {
  PetCatalogFilters as Filters,
  PetCatalogMode,
} from '@/entities/playground-pet/model/shop.types'
import { PET_CATALOG_DEFAULT_FILTERS } from '../constants/pet-shop'
import { petRequestKey } from '../lib/useServerClock'
import { petAsset, type PetAssetManifest } from '../lib/gameAssets'
import { PetGlyph } from './PetGlyph'
import { PetCatalogFilters } from './PetCatalogFilters'
import { PetPurchaseDialog } from './PetPurchaseDialog'
import styles from './PetRoom.module.css'

export function PetAssetThumbnail({
  item,
  manifest,
}: {
  item: PetCatalogItem
  manifest: PetAssetManifest | null
}) {
  const asset = petAsset(manifest, item.assetKey)
  return (
    <div className={`${styles.itemArt} ${item.slot === 'floor' ? styles.floorArt : ''}`}>
      {asset ? (
        <Image src={asset.url} alt="" width={asset.width} height={asset.height} unoptimized />
      ) : (
        <span className={styles.artUnavailable}>그림 준비 중</span>
      )}
    </div>
  )
}

export function PetDecorations({
  mode,
  game,
  level,
  revision,
  disabled,
  manifest,
  selected,
  onSelect,
  slotRequest,
  onCommand,
  onOpenShop,
}: {
  mode: PetCatalogMode
  game: PetGameState
  level: number
  revision: number
  disabled: boolean
  manifest: PetAssetManifest | null
  selected: PetCatalogItem | null
  onSelect: (item: PetCatalogItem | null) => void
  /** 방 위 핫스팟에서 고른 슬롯. serial이 바뀔 때마다 그 슬롯으로 좁힌다. */
  slotRequest?: { slot: PetRoomSlot; serial: number } | null
  onCommand: (command: PetCommand) => Promise<PetCommandResult | undefined>
  onOpenShop?: () => void
}) {
  const [filters, setFilters] = useState<Filters>({ ...PET_CATALOG_DEFAULT_FILTERS })
  const [appliedRequest, setAppliedRequest] = useState(0)
  if (slotRequest && slotRequest.serial !== appliedRequest) {
    setAppliedRequest(slotRequest.serial)
    setFilters((current) => ({ ...current, slot: slotRequest.slot }))
  }
  const [confirm, setConfirm] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const pending = useRef(false)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  const busy = disabled || saving
  const items = filterPetCatalog(game, level, mode, filters)
  const collections = petCollectionProgress(game)
  const ownedCount = game.catalog.filter((item) => game.inventory.includes(item.id)).length
  const availability = selected ? itemAvailability(game, selected, level) : null
  const select = (item: PetCatalogItem | null) => {
    setConfirm(false)
    onSelect(item)
  }
  const changeFilters = (patch: Partial<Filters>) => {
    setFilters((current) => ({ ...current, ...patch }))
    select(null)
  }
  const mutate = async (kind: 'room' | 'items/purchase', item: PetCatalogItem, unequip = false) => {
    if (disabled || pending.current) return
    const state = itemAvailability(game, item, level)
    if (kind === 'items/purchase' && (mode !== 'shop' || !state.purchasable)) return
    if (kind === 'room' && !state.owned) return
    pending.current = true
    setSaving(true)
    const command: PetCommand =
      kind === 'room'
        ? {
            kind,
            body: {
              slot: item.slot,
              itemId: unequip ? null : item.id,
              expectedRevision: revision,
              idempotencyKey: petRequestKey(),
            },
          }
        : {
            kind,
            body: { itemId: item.id, expectedRevision: revision, idempotencyKey: petRequestKey() },
          }
    try {
      const result = await onCommand(command)
      if (!mounted.current) return
      if (result?.type === 'success') {
        setConfirm(false)
        if (kind === 'room') onSelect(null)
      } else if (result && result.type !== 'busy') setConfirm(false)
    } finally {
      pending.current = false
      if (mounted.current) setSaving(false)
    }
  }
  return (
    <section aria-labelledby={`pet-${mode}-title`} className={styles.panel}>
      <div className={styles.panelHeading}>
        <div>
          <p className={styles.eyebrow}>
            {mode === 'shop' ? '돌봄으로 모은 작은 행복' : '나만의 작은 공간'}
          </p>
          <h2 id={`pet-${mode}-title`}>{mode === 'shop' ? '별사탕 상점' : '방 꾸미기'}</h2>
        </div>
        <span className={styles.count}>
          {ownedCount} / {game.catalog.length} 소품
        </span>
      </div>
      <div className={styles.shopBalance}>
        <span>
          <PetGlyph kind="star" /> 내 별사탕
        </span>
        <strong>{game.wallet.stars.toLocaleString('ko-KR')}개</strong>
        <p>
          {mode === 'shop'
            ? '마음에 드는 소품을 방에서 미리 보고 골라요.'
            : '이미 가진 소품으로 우리 아이의 방을 꾸며요.'}
        </p>
      </div>
      <div className={styles.slots} role="group" aria-label="방의 자리 고르기">
        {PET_SLOTS.map((slot) => {
          const equipped = game.catalog.find((item) => item.id === game.room[slot])
          return (
            <button
              key={slot}
              className={styles.slotButton}
              disabled={busy}
              aria-pressed={filters.slot === slot}
              onClick={() => changeFilters({ slot: filters.slot === slot ? 'all' : slot })}
            >
              <strong>{PET_SLOT_LABELS[slot]}</strong>
              <span>{equipped?.name ?? '비어 있음'}</span>
            </button>
          )
        })}
      </div>
      <p className={styles.catalogCount} role="status">
        {items.length}개 소품
      </p>
      <div className={styles.itemGrid}>
        {items.map((item) => {
          const state = itemAvailability(game, item, level)
          return (
            <button
              key={item.id}
              className={styles.itemButton}
              aria-pressed={selected?.id === item.id}
              disabled={busy}
              onClick={() => select(item)}
            >
              <PetAssetThumbnail item={item} manifest={manifest} />
              <strong>{item.name}</strong>
              <span className={styles.itemCollection}>
                {PET_COLLECTION_LABELS[item.collection]}
              </span>
              <span className={styles.itemBadge}>
                {state.equipped ? (
                  '적용 중'
                ) : state.owned ? (
                  '보유'
                ) : state.locked ? (
                  `Lv.${item.minLevel} 해금`
                ) : (
                  <>
                    <PetGlyph kind="star" /> {item.price}
                  </>
                )}
              </span>
            </button>
          )
        })}
      </div>
      {items.length === 0 && (
        <div className={styles.catalogEmpty}>
          <p>이 조건에 맞는 소품이 없어요.</p>
          <button
            className={styles.smallButton}
            disabled={busy}
            onClick={() => changeFilters({ ...PET_CATALOG_DEFAULT_FILTERS })}
          >
            필터 초기화
          </button>
          {mode === 'inventory' && (
            <button className={styles.smallButton} disabled={busy} onClick={onOpenShop}>
              상점 둘러보기
            </button>
          )}
        </div>
      )}
      {selected && availability ? (
        <div className={styles.itemDetail}>
          <p className={styles.eyebrow}>
            {PET_COLLECTION_LABELS[selected.collection] ?? selected.collection} ·{' '}
            {PET_SLOT_LABELS[selected.slot]}
          </p>
          <h3>{selected.name}</h3>
          <p>{selected.description}</p>
          <ul className={styles.itemFacts}>
            <li data-state={availability.owned ? 'ok' : 'todo'}>
              {availability.equipped
                ? '방에 적용 중'
                : availability.owned
                  ? '보유 중 · 아직 방에 두지 않았어요'
                  : `별사탕 ${selected.price}개`}
            </li>
            {!availability.owned && (
              <li data-state={availability.locked ? 'blocked' : 'ok'}>
                {availability.locked
                  ? `Lv.${selected.minLevel}부터 · 지금 Lv.${level}`
                  : `Lv.${selected.minLevel} 조건 충족`}
              </li>
            )}
            {!availability.owned && (
              <li data-state={availability.affordable ? 'ok' : 'blocked'}>
                {availability.affordable
                  ? `구매 후 별사탕 ${game.wallet.stars - selected.price}개`
                  : `별사탕 ${selected.price - game.wallet.stars}개가 더 필요해요`}
              </li>
            )}
          </ul>
          <p className={styles.hint}>
            {availability.equipped
              ? '지금 방에 저장된 소품이에요.'
              : '위 방은 미리보기예요. 아직 저장되지 않았어요.'}
          </p>
          <div className={styles.buttonRow}>
            {availability.owned ? (
              <button
                className={styles.primaryButton}
                disabled={busy || availability.equipped}
                onClick={() => void mutate('room', selected)}
              >
                {availability.equipped ? '적용 중' : '내 방에 적용'}
              </button>
            ) : mode === 'shop' ? (
              <button
                className={styles.primaryButton}
                disabled={busy || !availability.purchasable}
                onClick={() => setConfirm(true)}
              >
                <PetGlyph kind="star" /> {selected.price}개로 구매
              </button>
            ) : null}
            {availability.equipped && !['wallpaper', 'floor'].includes(selected.slot) && (
              <button
                className={styles.smallButton}
                disabled={busy}
                onClick={() => void mutate('room', selected, true)}
              >
                방에서 해제
              </button>
            )}
            <button className={styles.smallButton} disabled={busy} onClick={() => select(null)}>
              미리보기 닫기
            </button>
          </div>
        </div>
      ) : (
        <p className={styles.hint}>소품을 골라 우리 아이의 방에서 미리 보세요.</p>
      )}
      <details
        className={styles.catalogMore}
        open={moreOpen}
        onToggle={(event) => setMoreOpen(event.currentTarget.open)}
      >
        <summary>테마 모으기 · 검색 · 정렬</summary>
        <div className={styles.collectionGrid} aria-label="테마 소품 수집">
          {collections.map((collection) => (
            <button
              key={collection.id}
              className={styles.collectionButton}
              disabled={busy}
              aria-pressed={filters.collection === collection.id}
              onClick={() =>
                changeFilters({
                  collection: filters.collection === collection.id ? '' : collection.id,
                })
              }
            >
              <strong>{collection.label}</strong>
              <span>
                {collection.owned} / {collection.total} 수집
              </span>
              <progress
                max={collection.total}
                value={collection.owned}
                aria-label={`${collection.label} 수집`}
              />
            </button>
          ))}
        </div>
        <PetCatalogFilters mode={mode} filters={filters} disabled={busy} onChange={changeFilters} />
      </details>
      <p className={styles.finePrint}>별사탕은 돌봄과 게임으로 모아요. 돈으로 살 수 없어요.</p>
      {mode === 'shop' && (
        <PetPurchaseDialog
          item={selected}
          open={confirm}
          stars={game.wallet.stars}
          disabled={busy || !availability?.purchasable}
          onClose={() => setConfirm(false)}
          onConfirm={() => {
            if (selected) void mutate('items/purchase', selected)
          }}
        />
      )}
    </section>
  )
}
