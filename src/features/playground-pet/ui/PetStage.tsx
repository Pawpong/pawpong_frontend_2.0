'use client'

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { petStagePoint } from '@/entities/playground-pet/model/room'
import type { PetGameHandle, PetStageSnapshot } from '../lib/petGameEngine'
import styles from './PetRoom.module.css'

export function PetStage({
  snapshot,
  name,
  onReady,
  onGame,
  onPoke,
  children,
}: {
  snapshot: PetStageSnapshot
  name: string
  onReady: (ready: boolean) => void
  onGame?: (game: PetGameHandle | null) => void
  /** 방을 직접 누른 결과. 버튼·핫스팟 등 자식 조작은 제외한다. */
  onPoke?: (result: 'pet' | 'call') => void
  children?: ReactNode
}) {
  const host = useRef<HTMLDivElement>(null)
  const latest = useRef(snapshot)
  const readiness = useRef(onReady)
  const gameListener = useRef(onGame)
  const engine = useRef<PetGameHandle | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    readiness.current = onReady
  }, [onReady])
  useEffect(() => {
    gameListener.current = onGame
  }, [onGame])
  useEffect(() => {
    latest.current = snapshot
    engine.current?.sync(snapshot)
  }, [snapshot])
  useEffect(() => {
    let alive = true
    void import('../lib/petGameEngine')
      .then(({ createPetGame }) => {
        if (!alive || !host.current) return
        engine.current = createPetGame(host.current, latest.current, (next) => {
          if (alive) {
            setState(next)
            readiness.current(next === 'ready')
          }
        })
        gameListener.current?.(engine.current)
      })
      .catch(() => {
        if (alive) {
          setState('error')
          readiness.current(false)
        }
      })
    return () => {
      alive = false
      engine.current?.destroy()
      engine.current = null
      gameListener.current?.(null)
    }
  }, [attempt])
  function point(event: PointerEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget && !host.current?.contains(event.target as Node))
      return
    const box = event.currentTarget.getBoundingClientRect()
    if (!box.width || !box.height) return
    const at = petStagePoint(
      (event.clientX - box.left) / box.width,
      (event.clientY - box.top) / box.height,
    )
    const result = at && engine.current?.poke(at.x, at.y)
    if (result) onPoke?.(result)
  }
  return (
    <>
      <div className={styles.stage} onPointerDown={point}>
        <div ref={host} className={styles.canvasHost} aria-hidden="true" />
        <span className="sr-only">
          {name}의 도트 캐릭터와 저장된 가구가 있는 방. 게임은 아래 버튼과 방향키로 조작할 수
          있어요.
        </span>
        {children}
      </div>
      {state !== 'ready' && (
        <div className={styles.stageStatus} role={state === 'error' ? 'alert' : 'status'}>
          <p>
            {state === 'error'
              ? '게임 화면을 불러오지 못했어요.'
              : '우리 아이의 방을 준비하고 있어요…'}
          </p>
          {state === 'error' && (
            <button
              className={styles.smallButton}
              onClick={() => {
                if (engine.current) engine.current.retry()
                else setAttempt((value) => value + 1)
              }}
            >
              화면 다시 준비
            </button>
          )}
        </div>
      )}
    </>
  )
}
