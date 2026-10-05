'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { PetGameHandle, PetStageSnapshot } from '../lib/petGameEngine'
import styles from './PetRoom.module.css'

export function PetStage({
  snapshot,
  name,
  onReady,
  children,
}: {
  snapshot: PetStageSnapshot
  name: string
  onReady: (ready: boolean) => void
  children?: ReactNode
}) {
  const host = useRef<HTMLDivElement>(null)
  const latest = useRef(snapshot)
  const readiness = useRef(onReady)
  const engine = useRef<PetGameHandle | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    readiness.current = onReady
  }, [onReady])
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
    }
  }, [attempt])
  return (
    <>
      <div className={styles.stage}>
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
