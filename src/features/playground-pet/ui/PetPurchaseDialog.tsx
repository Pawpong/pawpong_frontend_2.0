import { useEffect, useRef } from 'react'
import type { PetCatalogItem } from '@/entities/playground-pet'
import styles from './PetRoom.module.css'

export function PetPurchaseDialog({
  item,
  open,
  stars,
  disabled,
  pending,
  onClose,
  onConfirm,
}: {
  item: PetCatalogItem | null
  open: boolean
  stars: number
  disabled: boolean
  pending: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (open && item) {
      if (!dialog.current?.open) {
        dialog.current?.showModal()
        closeButton.current?.focus()
      }
    } else dialog.current?.close()
  }, [open, item])
  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby="pet-purchase-title"
      aria-describedby="pet-purchase-description"
      aria-busy={pending}
      onCancel={(event) => {
        if (pending) event.preventDefault()
        else onClose()
      }}
      onClose={onClose}
    >
      {item && (
        <>
          <p className={styles.eyebrow}>별사탕 상점</p>
          <h3 id="pet-purchase-title">{item.name} 구매할까요?</h3>
          <p id="pet-purchase-description">
            별사탕 {item.price}개를 사용해요. 구매한 소품은 내 인벤토리에 저장돼요.
          </p>
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
          {pending && (
            <p className={styles.purchaseStatus} role="status">
              구매 결과를 확인하고 있어요. 잠시만 기다려 주세요.
            </p>
          )}
          <div className={styles.buttonRow}>
            <button
              className={styles.primaryButton}
              disabled={disabled || pending}
              onClick={onConfirm}
            >
              {pending ? '구매 확인 중…' : '별사탕으로 구매'}
            </button>
            <button
              ref={closeButton}
              autoFocus
              className={styles.smallButton}
              disabled={pending}
              onClick={onClose}
            >
              닫기
            </button>
          </div>
        </>
      )}
    </dialog>
  )
}
