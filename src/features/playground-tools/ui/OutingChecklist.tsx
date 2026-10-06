'use client'

import { useEffect, useState, useSyncExternalStore, type FormEvent } from 'react'
import Link from 'next/link'
import { Button, buttonVariants } from '@/shared/ui/Button'
import {
  PixelCheckIcon,
  PixelArrowRightIcon,
  LocationPinIcon,
  PlusIcon,
  CloseIcon,
} from '@/shared/assets'
import {
  OUTING_TEMPLATES,
  MAX_CUSTOM_ITEMS,
  MAX_ITEM_LENGTH,
  checklistItems,
  checklistText,
  normalizeItemLabel,
  createChecklistItemId,
  type ChecklistAction,
} from '../model/checklist'
import { createChecklistStore } from '../model/checklistStore'
import { currentToolOwner, useToolOwner } from '../model/useToolOwner'
import { ToolPage } from './ToolPage'
import styles from './Tools.module.css'

function Checklist({ owner }: { owner: string }) {
  const [store] = useState(() => {
    let storage: Storage | null = null
    try {
      storage = window.localStorage
    } catch {
      /* private mode */
    }
    return createChecklistStore(storage, owner)
  })
  const { data, saved } = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  )
  const [itemLabel, setItemLabel] = useState('')
  const [message, setMessage] = useState('')
  const [confirm, setConfirm] = useState<'uncheck' | 'clear' | null>(null)
  const template = OUTING_TEMPLATES.find((t) => t.id === data.selected)!
  const items = checklistItems(data, data.selected)
  const checked = data.lists[data.selected].checked
  const allDone = checked.length === items.length
  const dispatch = (action: ChecklistAction) => {
    if (currentToolOwner() === owner) store.dispatch(action)
  }
  useEffect(() => {
    const reload = (event: StorageEvent) => {
      if (event.key === store.key || event.key === null) store.reload()
    }
    window.addEventListener('storage', reload)
    return () => window.removeEventListener('storage', reload)
  }, [store])
  function addItem(event: FormEvent) {
    event.preventDefault()
    const label = normalizeItemLabel(itemLabel)
    if (!label) {
      setMessage('추가할 준비물을 적어주세요.')
      return
    }
    if (items.some((i) => i.label === label)) {
      setMessage('이미 준비함에 있는 항목이에요.')
      return
    }
    if (data.lists[data.selected].custom.length >= MAX_CUSTOM_ITEMS) {
      setMessage('직접 추가하는 준비물은 12개까지 보관할 수 있어요.')
      return
    }
    dispatch({ type: 'add', outing: data.selected, label, id: createChecklistItemId() })
    setItemLabel('')
    setMessage('준비물을 추가했어요.')
  }
  async function copyList() {
    try {
      await navigator.clipboard.writeText(checklistText(data))
      if (currentToolOwner() === owner)
        setMessage('준비 목록을 복사했어요. 함께 가는 사람에게 보내보세요.')
    } catch {
      if (currentToolOwner() === owner)
        setMessage('복사를 허용하지 않는 브라우저예요. 아래 목록을 선택해 복사할 수 있어요.')
    }
  }
  return (
    <div className={styles.toolGrid}>
      <section className={styles.panel} aria-labelledby="outing-pick">
        <h2 id="outing-pick" className={styles.sectionTitle}>
          오늘은 어디로 갈까요?
        </h2>
        <div className={styles.purposeGrid} aria-label="외출 목적">
          {OUTING_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={data.selected === t.id}
              className={styles.purpose}
              onClick={() => {
                dispatch({ type: 'select', outing: t.id })
                setConfirm(null)
                setMessage('')
                setItemLabel('')
              }}
            >
              <LocationPinIcon aria-hidden className="size-5" />
              {t.title}
            </button>
          ))}
        </div>
        <div className={styles.listHeading}>
          <div>
            <span className={styles.eyebrow}>우리 아이 외출 준비함</span>
            <h2>{template.title}</h2>
            <p>{template.caption}</p>
          </div>
          <strong aria-label={`${items.length}개 중 ${checked.length}개 준비`}>
            {checked.length}
            <span> / {items.length}</span>
          </strong>
        </div>
        <progress
          max={items.length}
          value={checked.length}
          aria-label="외출 준비 진행률"
          className={styles.progress}
        />
        <ul className={styles.checklist}>
          {items.map((item) => (
            <li key={item.id} className={checked.includes(item.id) ? styles.checkedRow : ''}>
              <label>
                <input
                  type="checkbox"
                  checked={checked.includes(item.id)}
                  onChange={() => dispatch({ type: 'toggle', outing: data.selected, id: item.id })}
                />
                <span>{item.label}</span>
                {item.custom && <small>직접 추가</small>}
              </label>
              {item.custom && (
                <button
                  type="button"
                  className={styles.iconButton}
                  aria-label={`${item.label} 준비물 삭제`}
                  onClick={() => dispatch({ type: 'remove', outing: data.selected, id: item.id })}
                >
                  <CloseIcon aria-hidden className="size-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
        <form onSubmit={addItem} className={styles.addForm}>
          <label htmlFor="outing-new" className="sr-only">
            나만의 준비물
          </label>
          <input
            id="outing-new"
            value={itemLabel}
            onChange={(e) => setItemLabel(e.target.value)}
            maxLength={MAX_ITEM_LENGTH}
            placeholder="우리 아이에게 필요한 준비물"
            autoComplete="off"
          />
          <Button type="submit" intent="secondary">
            <PlusIcon aria-hidden className="size-4" />
            추가
          </Button>
        </form>
        {allDone && (
          <p className={styles.success}>
            <PixelCheckIcon aria-hidden className="size-5" />
            준비 끝! 우리 아이와 좋은 하루 보내세요.
          </p>
        )}
        <div className={styles.actions}>
          <Button intent="secondary" onClick={copyList}>
            목록 복사
          </Button>
          <button type="button" className={styles.textButton} onClick={() => setConfirm('uncheck')}>
            체크만 비우기
          </button>
        </div>
        {confirm && (
          <div className={styles.confirm} role="group" aria-label="준비함 초기화 확인">
            <p>
              {confirm === 'clear'
                ? '이 계정의 모든 외출 준비함과 직접 추가한 항목을 지울까요?'
                : '이 준비함의 체크를 모두 해제할까요? 직접 추가한 항목은 보관돼요.'}
            </p>
            <div className={styles.actions}>
              <Button intent="secondary" size="md" onClick={() => setConfirm(null)}>
                취소
              </Button>
              <Button
                size="md"
                onClick={() => {
                  dispatch(
                    confirm === 'clear'
                      ? { type: 'clear' }
                      : { type: 'uncheck', outing: data.selected },
                  )
                  setConfirm(null)
                  setMessage('준비함을 비웠어요.')
                }}
              >
                비우기
              </Button>
            </div>
          </div>
        )}
        <p className={styles.status} role="status">
          {message}
        </p>
        <details className={styles.plainList}>
          <summary>텍스트 목록 보기</summary>
          <pre>{checklistText(data)}</pre>
        </details>
        <p className={styles.storageNote}>
          {saved
            ? '이 브라우저에 자동 저장돼요. 다른 기기에는 이어지지 않아요.'
            : '브라우저 저장이 차단되어 지금 화면에서만 사용할 수 있어요.'}
          {owner === 'guest' && ' 로그인 전 준비함은 이 브라우저를 쓰는 사람과 공유돼요.'}
        </p>
        <button type="button" className={styles.textButton} onClick={() => setConfirm('clear')}>
          모든 준비함 지우기
        </button>
      </section>
      <aside className={styles.sideStack}>
        <section className={styles.noteCard}>
          <span className={styles.eyebrow}>돌아온 뒤에도 함께</span>
          <h2>
            오늘의 순간을
            <br />
            이야기로 남겨요
          </h2>
          <p>
            어디를 다녀왔는지, 우리 아이가 무엇을 좋아했는지. 작은 기록이 다음 나들이의 힌트가 돼요.
          </p>
          <Link href={template.nextUrl} className={buttonVariants()}>
            {template.nextLabel}
            <PixelArrowRightIcon aria-hidden className="size-4" />
          </Link>
        </section>
        <section className={styles.smallCard}>
          <LocationPinIcon aria-hidden className="size-8 text-brand" />
          <h2>방문할 곳 확인하기</h2>
          <p>주변 동물병원과 보호시설을 지도에서 살펴보세요. 방문 전 운영 여부도 확인해 주세요.</p>
          <Link href="/care-map" className={styles.inlineLink}>
            돌봄 지도 열기 <PixelArrowRightIcon aria-hidden className="size-3" />
          </Link>
        </section>
        <Link href="/playground/memory-card" className={styles.smallCard}>
          <span className={styles.eyebrow}>사진 한 장의 기념품</span>
          <h2>오늘의 추억 카드 만들기 ↗</h2>
          <p>좋아하는 사진을 골라 따뜻한 카드로 남겨보세요.</p>
        </Link>
      </aside>
    </div>
  )
}

export function OutingChecklist() {
  const owner = useToolOwner()
  return (
    <ToolPage title="외출 준비함" description="챙기는 건 가볍게, 함께하는 시간은 더 즐겁게.">
      {owner === null ? (
        <p role="status">준비함을 열고 있어요.</p>
      ) : (
        <Checklist key={owner} owner={owner} />
      )}
    </ToolPage>
  )
}
