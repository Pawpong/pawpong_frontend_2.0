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
import { petRequestKey } from '../lib/useServerClock'
import { petAsset, type PetAssetManifest } from '../lib/gameAssets'
import { PetGlyph } from './PetGlyph'
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
  game,
  level,
  revision,
  disabled,
  manifest,
  selected,
  onSelect,
  onCommand,
}: {
  game: PetGameState
  level: number
  revision: number
  disabled: boolean
  manifest: PetAssetManifest | null
  selected: PetCatalogItem | null
  onSelect: (item: PetCatalogItem | null) => void
  onCommand: (command: PetCommand) => Promise<PetCommandResult | undefined>
}) {
  const [slot, setSlot] = useState<PetRoomSlot>('wallpaper')
  const [ownedOnly, setOwnedOnly] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (confirm) dialog.current?.showModal()
    else dialog.current?.close()
  }, [confirm])
  const items = game.catalog.filter(
    (item) => item.slot === slot && (!ownedOnly || game.inventory.includes(item.id)),
  )
  const availability = selected ? itemAvailability(game, selected, level) : null
  const mutate = async (kind: 'room' | 'items/purchase', item: PetCatalogItem, unequip = false) => {
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
    const result = await onCommand(command)
    if (result?.type === 'success') {
      setConfirm(false)
      onSelect(null)
    } else if (result && result.type !== 'busy') setConfirm(false)
  }
  return (
    <section aria-labelledby="pet-decoration-title" className={styles.panel}>
      <div className={styles.panelHeading}>
        <div>
          <p className={styles.eyebrow}>나만의 작은 공간</p>
          <h2 id="pet-decoration-title">방 꾸미기</h2>
        </div>
        <span className={styles.count}>
          {game.inventory.length} / {game.catalog.length} 소품
        </span>
      </div>
      <div className={styles.shopModes} aria-label="소품 목록">
        <button
          className={styles.smallButton}
          aria-pressed={!ownedOnly}
          onClick={() => setOwnedOnly(false)}
        >
          모든 소품
        </button>
        <button
          className={styles.smallButton}
          aria-pressed={ownedOnly}
          onClick={() => setOwnedOnly(true)}
        >
          내 인벤토리
        </button>
      </div>
      <div className={styles.slots} aria-label="가구 종류">
        {PET_SLOTS.map((id) => (
          <button
            key={id}
            className={styles.slotButton}
            aria-pressed={slot === id}
            onClick={() => {
              setSlot(id)
              onSelect(null)
            }}
          >
            {PET_SLOT_LABELS[id]}
          </button>
        ))}
      </div>
      <div className={styles.itemGrid}>
        {items.map((item) => {
          const state = itemAvailability(game, item, level)
          return (
            <button
              key={item.id}
              className={styles.itemButton}
              aria-pressed={selected?.id === item.id}
              onClick={() => onSelect(item)}
            >
              <PetAssetThumbnail item={item} manifest={manifest} />
              <strong>{item.name}</strong>
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
        <p className={styles.hint}>아직 이 종류의 소품이 없어요. 모든 소품에서 둘러보세요.</p>
      )}
      {selected && availability ? (
        <div className={styles.itemDetail}>
          <p className={styles.eyebrow}>
            {PET_COLLECTION_LABELS[selected.collection] ?? selected.collection} ·{' '}
            {PET_SLOT_LABELS[selected.slot]}
          </p>
          <h3>{selected.name}</h3>
          <p>{selected.description}</p>
          <p className={styles.hint}>위 방은 미리보기예요. 적용 버튼을 누르면 저장돼요.</p>
          {availability.locked && (
            <p className={styles.hint}>Lv.{selected.minLevel}이 되면 사용할 수 있어요.</p>
          )}
          {!availability.owned && !availability.affordable && (
            <p className={styles.hint}>
              별사탕 {selected.price - game.wallet.stars}개가 더 필요해요.
            </p>
          )}
          <div className={styles.buttonRow}>
            {availability.owned ? (
              <button
                className={styles.primaryButton}
                disabled={disabled || availability.equipped}
                onClick={() => void mutate('room', selected)}
              >
                {availability.equipped ? '적용 중' : '내 방에 적용'}
              </button>
            ) : (
              <button
                className={styles.primaryButton}
                disabled={disabled || !availability.purchasable}
                onClick={() => setConfirm(true)}
              >
                <PetGlyph kind="star" /> {selected.price}개로 받기
              </button>
            )}
            {availability.equipped && !['wallpaper', 'floor'].includes(selected.slot) && (
              <button
                className={styles.smallButton}
                disabled={disabled}
                onClick={() => void mutate('room', selected, true)}
              >
                방에서 해제
              </button>
            )}
            <button className={styles.smallButton} onClick={() => onSelect(null)}>
              미리보기 닫기
            </button>
          </div>
        </div>
      ) : (
        <p className={styles.hint}>소품을 골라 우리 아이의 방에서 미리 보세요.</p>
      )}
      <p className={styles.finePrint}>별사탕은 돌봄과 게임으로 모아요. 돈으로 살 수 없어요.</p>
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby="pet-purchase-title"
        onCancel={() => setConfirm(false)}
        onClose={() => setConfirm(false)}
      >
        {selected && (
          <>
            <h3 id="pet-purchase-title">{selected.name} 받을까요?</h3>
            <p>
              별사탕 {selected.price}개를 사용해요. 소품은 인벤토리에 저장되고 직접 적용할 수
              있어요.
            </p>
            <p>현재 별사탕 {game.wallet.stars}개</p>
            <div className={styles.buttonRow}>
              <button
                autoFocus
                className={styles.primaryButton}
                disabled={disabled || !availability?.purchasable}
                onClick={() => void mutate('items/purchase', selected)}
              >
                별사탕으로 받기
              </button>
              <button
                className={styles.smallButton}
                disabled={disabled}
                onClick={() => setConfirm(false)}
              >
                닫기
              </button>
            </div>
          </>
        )}
      </dialog>
    </section>
  )
}
