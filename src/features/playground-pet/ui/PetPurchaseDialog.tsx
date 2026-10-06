import { useEffect, useRef } from 'react'
import type { PetCatalogItem } from '@/entities/playground-pet'
import styles from './PetRoom.module.css'

export function PetPurchaseDialog({
  item,
  open,
  stars,
  disabled,
  onClose,
  onConfirm,
}: {
  item: PetCatalogItem | null
  open: boolean
  stars: number
  disabled: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (open && item) dialog.current?.showModal()
    else dialog.current?.close()
  }, [open, item])
  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby="pet-purchase-title"
      onCancel={onClose}
      onClose={onClose}
    >
      {item && (
        <>
          <p className={styles.eyebrow}>별사탕 상점</p>
          <h3 id="pet-purchase-title">{item.name} 구매할까요?</h3>
          <p>별사탕 {item.price}개를 사용해요. 구매한 소품은 내 인벤토리에 저장돼요.</p>
          <div className={styles.purchaseReceipt}>
            <span>
              지금 가진 별사탕 <strong>{stars}개</strong>
            </span>
            <span>
              구매 후 별사탕 <strong>{Math.max(0, stars - item.price)}개</strong>
            </span>
          </div>
          <p className={styles.finePrint}>
            방은 자동으로 바뀌지 않아요. 구매 후 직접 적용해 주세요.
          </p>
          <div className={styles.buttonRow}>
            <button
              autoFocus
              className={styles.primaryButton}
              disabled={disabled}
              onClick={onConfirm}
            >
              별사탕으로 구매
            </button>
            <button className={styles.smallButton} disabled={disabled} onClick={onClose}>
              닫기
            </button>
          </div>
        </>
      )}
    </dialog>
  )
}
