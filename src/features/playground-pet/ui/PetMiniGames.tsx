'use client'

import { createPortal } from 'react-dom'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import type {
  PetCommand,
  PetGameKind,
  PetGameOutcome,
  PetGameState,
  PetGameSession,
  PetMemorySession,
  SnackInput,
  SnackLane,
} from '@/entities/playground-pet'
import type { PetCommandResult } from '@/entities/playground-pet/model/commandQueue'
import {
  nextSnackInput,
  previewSnack,
  snackTapDirection,
} from '@/entities/playground-pet/model/snack'
import { petRequestKey } from '../lib/useServerClock'
import { usePetStartIntent } from '../lib/usePetStartIntent'
import type { PetStageSnapshot } from '../lib/petGameEngine'
import { PetGlyph } from './PetGlyph'
import styles from './PetRoom.module.css'

type SnackRun = {
  sessionId: string
  inputs: SnackInput[]
  lane: SnackLane
  origin: number
  submitted: boolean
}
const GAME_LABELS = { memory: '도트 짝 맞추기', snack: '간식 받기' } as const
const SYMBOL_LABELS = { paw: '발바닥', bone: '뼈다귀', heart: '하트', star: '별' } as const

export function PetMemoryBoard({
  session,
  now,
  disabled,
  pending = null,
  onFlip,
}: {
  session: PetMemorySession
  now: number
  disabled: boolean
  /** 서버 응답을 기다리는 카드. 그림은 서버가 공개한 뒤에만 보인다. */
  pending?: number | null
  onFlip: (index: number) => void
}) {
  const locked = Boolean(session.lockUntil && now < Date.parse(session.lockUntil))
  return (
    <div className={styles.memoryBoard} role="group" aria-label="네 쌍의 도트 카드">
      {Array.from({ length: 8 }, (_, index) => {
        const symbol = session.revealed.find((card) => card.index === index)?.symbol
        const matched = session.matchedIndices.includes(index)
        return (
          <button
            key={index}
            className={`${styles.memoryCard} ${matched ? styles.matchedCard : ''} ${symbol ? styles.revealedCard : ''} ${locked && symbol && !matched ? styles.mismatchCard : ''}`}
            data-pending={pending === index && !symbol}
            aria-busy={pending === index && !symbol}
            disabled={
              disabled || locked || matched || Boolean(symbol) || session.status !== 'active'
            }
            aria-label={`${index + 1}번 카드${symbol ? `, ${SYMBOL_LABELS[symbol]}` : ', 뒤집기'}${matched ? ', 짝 완성' : ''}`}
            onClick={() => onFlip(index)}
          >
            {symbol ? (
              <PetGlyph kind={symbol} />
            ) : (
              <>
                <PetGlyph kind="paw" />
                <span>{index + 1}</span>
              </>
            )}
            {matched && <span className={styles.matchedText}>완성</span>}
          </button>
        )
      })}
    </div>
  )
}

export function PetMiniGames({
  game,
  gameOutcome,
  revision,
  serverTime,
  now,
  disabled,
  selected = true,
  characterReady,
  onPrepareGame,
  onCancelPreparation,
  gameSurface,
  stageOverlay = null,
  onCommand,
  onRefresh,
  onSnack,
}: {
  game: PetGameState
  gameOutcome: PetGameOutcome | null
  revision: number
  serverTime: string
  now: number
  disabled: boolean
  selected?: boolean
  characterReady: boolean
  onPrepareGame: (kind: PetGameKind) => Promise<boolean>
  onCancelPreparation?: () => void
  gameSurface: HTMLElement | null
  /** 방 화면 위 투명 조작층. 간식 게임의 좌/우 터치에 쓴다. */
  stageOverlay?: HTMLElement | null
  onCommand: (command: PetCommand) => Promise<PetCommandResult | undefined>
  onRefresh: () => void
  onSnack: (snack: PetStageSnapshot['snack']) => void
}) {
  const active = game.games.active
  const [run, setRun] = useState<SnackRun | null>(null)
  const [tick, setTick] = useState(0)
  const [interrupted, setInterrupted] = useState<string | null>(null)
  const [localTerminal, setTerminal] = useState<PetGameOutcome | null>(null)
  const [dismissedResult, setDismissedResult] = useState<string | null>(null)
  const terminal =
    localTerminal ??
    (gameOutcome?.kind === 'finish' && gameOutcome.sessionId !== dismissedResult
      ? gameOutcome
      : null)
  const [cancelConfirm, setCancelConfirm] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [pendingCard, setPendingCard] = useState<number | null>(null)
  const finishLocked = useRef(false)
  const [preparationFailed, setPreparationFailed] = useState(false)
  const hiddenGeneration = useRef(0)
  const lastLockRefresh = useRef('')
  const panel = useRef<HTMLElement>(null)
  const activePanel = useRef<HTMLDivElement>(null)
  const activeId = active?.sessionId ?? ''
  const {
    intent: startIntent,
    phase: startPhase,
    cancelled: preparationCancelled,
    cancelPreparation,
  } = usePetStartIntent({ selected, disabled, revision, activeId }, onCancelPreparation)
  const starting = startPhase !== null
  const runningHere = active?.game === 'snack' && run?.sessionId === activeId
  const snackRun = runningHere ? run : null
  const elapsed = snackRun ? Math.min(30_000, Math.max(0, tick - snackRun.origin)) : 0
  const interruptedHere = interrupted === activeId
  const expired = Boolean(active && now >= Date.parse(active.expiresAt))
  const activeMemory = active?.game === 'memory' ? active : null
  const terminalMemory = terminal?.session?.game === 'memory' ? terminal.session : null
  const memory = activeMemory ?? terminalMemory
  const practice =
    game.games.rewardedToday >= game.games.dailyRewardLimit ||
    game.wallet.dailyEarned >= game.wallet.dailyLimit ||
    game.wallet.stars >= 9999

  useEffect(() => {
    if (!runningHere || interruptedHere) return
    // 낙하물은 엔진이 프레임마다 그린다. 여기서는 남은 시간·점수 표시만 갱신한다.
    const timer = window.setInterval(() => setTick(performance.now()), 100)
    return () => window.clearInterval(timer)
  }, [runningHere, interruptedHere, activeId])

  useEffect(() => {
    const visibility = () => {
      if (document.hidden) {
        hiddenGeneration.current++
        if (active?.game === 'snack') setInterrupted(active.sessionId)
      }
      if (!document.hidden && active) onRefresh()
    }
    document.addEventListener('visibilitychange', visibility)
    return () => document.removeEventListener('visibilitychange', visibility)
  }, [active, onRefresh])

  useEffect(() => {
    if (!activeMemory?.lockUntil || disabled) return
    const key = `${activeMemory.sessionId}:${activeMemory.lockUntil}`
    if (now >= Date.parse(activeMemory.lockUntil) && lastLockRefresh.current !== key) {
      lastLockRefresh.current = key
      onRefresh()
    }
  }, [activeMemory, disabled, now, onRefresh])

  useEffect(() => {
    if (!activeId) return
    const frame = requestAnimationFrame(() => {
      activePanel.current?.focus({ preventScroll: true })
      activePanel.current?.closest('[data-pet-device]')?.scrollIntoView({ block: 'start' })
    })
    return () => cancelAnimationFrame(frame)
  }, [activeId, gameSurface])

  const snackSnapshot = useMemo<PetStageSnapshot['snack']>(() => {
    if (active?.game !== 'snack' || !snackRun || interruptedHere || expired) return null
    return { session: active, elapsed: 0, origin: snackRun.origin, lane: snackRun.lane }
  }, [active, snackRun, interruptedHere, expired])
  useEffect(() => {
    onSnack(snackSnapshot)
  }, [onSnack, snackSnapshot])

  async function send(command: PetCommand) {
    const result = await onCommand(command)
    if (result?.type === 'success' && result.data.gameOutcome) {
      const outcome = result.data.gameOutcome
      if (outcome.kind === 'finish') {
        setTerminal(outcome)
        setRun(null)
      }
      if (outcome.kind === 'cancel') {
        setTerminal(null)
        setRun(null)
        setCancelConfirm(false)
      }
    }
    return result
  }

  async function start(kind: PetGameKind) {
    if (!characterReady || document.hidden) return
    const attempt = startIntent.begin()
    if (!attempt) return
    setPreparationFailed(false)
    const visibilityAtStart = hiddenGeneration.current
    const startedHidden = document.hidden
    try {
      // Prepare the chosen game's textures before starting the server's timed session.
      let prepared = false
      try {
        prepared = await onPrepareGame(kind)
      } catch {
        prepared = false
      }
      if (!startIntent.isCurrent(attempt)) return
      if (!prepared) {
        setPreparationFailed(true)
        return
      }
      if (startedHidden || document.hidden || hiddenGeneration.current !== visibilityAtStart) return
      if (!startIntent.markSending(attempt)) return
      const result = await send({
        kind: 'games/start',
        body: { game: kind, expectedRevision: attempt.revision, idempotencyKey: petRequestKey() },
      })
      if (!startIntent.isCurrent(attempt) || result?.type !== 'success') return
      setTerminal(null)
      setDismissedResult(gameOutcome?.sessionId ?? null)
      const session = result.data.game?.games.active
      setInterrupted((current) =>
        session?.game === 'snack' &&
        (startedHidden ||
          document.hidden ||
          hiddenGeneration.current !== visibilityAtStart ||
          current === session.sessionId)
          ? session.sessionId
          : null,
      )
      if (session?.game === 'snack') {
        const received = performance.now()
        setRun({
          sessionId: session.sessionId,
          inputs: [],
          lane: 1,
          origin:
            received -
            Math.max(0, Date.parse(result.data.serverTime) - Date.parse(session.startedAt)),
          submitted: false,
        })
        setTick(received)
      }
      activePanel.current?.focus({ preventScroll: true })
    } finally {
      startIntent.finish(attempt)
    }
  }

  function move(direction: -1 | 1) {
    if (
      disabled ||
      !snackRun ||
      interruptedHere ||
      expired ||
      snackRun.submitted ||
      elapsed >= 30_000
    )
      return
    const at = performance.now() - snackRun.origin
    setRun((current) => {
      if (!current || current.sessionId !== activeId || current.submitted) return current
      const input = nextSnackInput(current.inputs, current.lane, direction, at)
      return input ? { ...current, inputs: [...current.inputs, input], lane: input.lane } : current
    })
    setTick(performance.now())
  }
  function keydown(event: KeyboardEvent<HTMLElement>) {
    if (active?.game !== 'snack' || event.repeat || event.altKey || event.ctrlKey || event.metaKey)
      return
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      move(event.key === 'ArrowLeft' ? -1 : 1)
    }
  }
  async function finishSnack() {
    if (
      active?.game !== 'snack' ||
      !snackRun ||
      disabled ||
      expired ||
      finishLocked.current ||
      elapsed < 30_000 ||
      interruptedHere
    )
      return
    finishLocked.current = true
    setFinishing(true)
    setRun((current) => (current ? { ...current, submitted: true } : null))
    try {
      const result = await send({
        kind: 'games/snack/finish',
        body: {
          sessionId: active.sessionId,
          inputs: snackRun.inputs,
          expectedRevision: revision,
          idempotencyKey: petRequestKey(),
        },
      })
      // Uncertain retries belong to the owner's queue. A rejected explicit retry can leave
      // this session active, so only an in-flight call locks another deliberate finish.
      if (result?.type === 'rejected')
        setRun((current) => (current ? { ...current, submitted: false } : null))
    } finally {
      finishLocked.current = false
      setFinishing(false)
    }
  }
  const preview =
    active?.game === 'snack' && snackRun ? previewSnack(active, snackRun.inputs, elapsed) : null
  const flip = (session: PetGameSession, index: number) => {
    setPendingCard(index)
    void send({
      kind: 'games/memory/flip',
      body: {
        sessionId: session.sessionId,
        index,
        expectedRevision: revision,
        idempotencyKey: petRequestKey(),
      },
    }).finally(() => setPendingCard(null))
  }
  const snackPlaying =
    active?.game === 'snack' &&
    Boolean(snackRun) &&
    !interruptedHere &&
    !expired &&
    elapsed < 30_000
  const snackTouch = snackPlaying ? (
    <div
      className={styles.snackTouch}
      aria-hidden="true"
      onPointerDown={(event) => {
        const box = event.currentTarget.getBoundingClientRect()
        if (!box.width) return
        event.preventDefault()
        move(snackTapDirection((event.clientX - box.left) / box.width))
      }}
    >
      {elapsed < 2000 && <span className={styles.snackReady}>준비! 화면 좌우를 눌러 이동해요</span>}
      <i data-side="left">←</i>
      <i data-side="right">→</i>
    </div>
  ) : null

  const activeContent = active ? (
    <div
      ref={activePanel}
      tabIndex={-1}
      onKeyDown={keydown}
      aria-label={GAME_LABELS[active.game]}
      className={styles.activeGame}
    >
      <h3>{GAME_LABELS[active.game]}</h3>
      {!active.rewardEligible && (
        <p className={styles.practiceNotice}>연습 모드 · 이 판의 별사탕 보상은 0개예요.</p>
      )}
      {expired ? (
        <p role="alert">게임 시간이 만료됐어요. 상태를 새로 불러오고 새 게임을 시작해 주세요.</p>
      ) : active.game === 'memory' ? (
        <>
          <p className={styles.hint}>
            {active.matchedIndices.length / 2} / 4쌍 · {active.turns}번 시도 · 뒤집기 {active.flips}{' '}
            / {active.maxFlips}
          </p>
          <PetMemoryBoard
            session={active}
            now={now}
            disabled={disabled}
            pending={pendingCard}
            onFlip={(index) => flip(active, index)}
          />
          <p role="status" className={styles.hint}>
            {active.lockUntil && now < Date.parse(active.lockUntil)
              ? '두 그림을 기억해 주세요…'
              : '카드를 골라 뒤집어 주세요.'}
          </p>
        </>
      ) : !runningHere || interruptedHere ? (
        <p role="alert">
          {interruptedHere
            ? '화면이 숨겨져 게임을 멈췄어요.'
            : '이 판의 이동 기록이 이 화면에 없어요.'}{' '}
          보상 없이 종료한 뒤 새 판을 시작해 주세요.
        </p>
      ) : (
        <>
          <div className={styles.snackReadout}>
            <strong>{Math.max(0, Math.ceil((30_000 - elapsed) / 1000))}초</strong>
            <span>현재 {preview?.score ?? 0}점</span>
            <span>
              간식 {preview?.catches ?? 0} · 빨간 공 {preview?.hazards ?? 0}
            </span>
          </div>
          <progress
            className={styles.gameProgress}
            value={elapsed}
            max={30_000}
            aria-label="간식 게임 진행 시간"
          />
          <p className={styles.hint}>
            화면 좌우 터치 · ← → 방향키 · 아래 버튼 ·{' '}
            {['왼쪽', '가운데', '오른쪽'][snackRun?.lane ?? 1]} 칸
          </p>
          <div className={styles.snackControls}>
            <button
              className={styles.directionButton}
              aria-label="왼쪽으로 한 칸 이동"
              disabled={disabled || elapsed >= 30_000 || snackRun?.lane === 0}
              onClick={() => move(-1)}
            >
              ←
            </button>
            <button
              className={styles.directionButton}
              aria-label="오른쪽으로 한 칸 이동"
              disabled={disabled || elapsed >= 30_000 || snackRun?.lane === 2}
              onClick={() => move(1)}
            >
              →
            </button>
          </div>
          {elapsed >= 30_000 && (
            <button
              className={styles.primaryButton}
              disabled={disabled || finishing}
              onClick={() => void finishSnack()}
            >
              결과 저장하고 별사탕 확인
            </button>
          )}
          <p className={styles.finePrint}>
            현재 점수는 화면 미리보기예요. 결과와 보상은 저장 후 확정돼요.
          </p>
        </>
      )}
      <div className={styles.buttonRow}>
        <button
          className={styles.smallButton}
          disabled={disabled}
          onClick={() => setCancelConfirm(true)}
        >
          이 판 종료
        </button>
        {expired && (
          <button className={styles.smallButton} disabled={disabled} onClick={onRefresh}>
            최신 상태 확인
          </button>
        )}
      </div>
      {cancelConfirm && (
        <div className={styles.cancelConfirm} role="group" aria-label="게임 종료 확인">
          <p>이 판을 종료하면 별사탕 보상이 없어요. 종료할까요?</p>
          <div className={styles.buttonRow}>
            <button
              className={styles.primaryButton}
              disabled={disabled}
              onClick={() =>
                void send({
                  kind: 'games/cancel',
                  body: {
                    sessionId: active.sessionId,
                    expectedRevision: revision,
                    idempotencyKey: petRequestKey(),
                  },
                })
              }
            >
              보상 없이 종료
            </button>
            <button className={styles.smallButton} onClick={() => setCancelConfirm(false)}>
              계속하기
            </button>
          </div>
        </div>
      )}
    </div>
  ) : null

  return (
    <section
      ref={panel}
      tabIndex={-1}
      hidden={Boolean(active && gameSurface)}
      aria-labelledby="pet-games-title"
      className={styles.panel}
    >
      <div className={styles.panelHeading}>
        <div>
          <p className={styles.eyebrow}>같이 놀며 별사탕 모으기</p>
          <h2 id="pet-games-title">미니게임</h2>
        </div>
        <PetGlyph kind="play" />
      </div>
      <p className={styles.hint}>
        오늘 보상 {game.games.rewardedToday} / {game.games.dailyRewardLimit}판 · 별사탕{' '}
        {game.wallet.dailyEarned} / {game.wallet.dailyLimit}개
      </p>
      {!active && !terminal && (
        <>
          {practice && (
            <p className={styles.practiceNotice}>
              오늘의 보상을 모두 받았어요. 연습은 계속할 수 있고 별사탕 보상은 0개예요.
            </p>
          )}
          <div className={styles.gameChoices}>
            <div className={styles.gameChoice}>
              <PetGlyph kind="heart" />
              <h3>도트 짝 맞추기</h3>
              <p>8장의 카드에서 같은 그림 네 쌍을 찾아요. 실수가 적을수록 높은 점수!</p>
              <p className={styles.hint}>
                최고 {game.games.bestScores.memory}점 · 최대 별사탕 14개
              </p>
              <button
                className={styles.primaryButton}
                disabled={disabled || starting || !characterReady}
                onClick={() => void start('memory')}
              >
                {practice ? '짝 맞추기 연습' : '짝 맞추기 시작'}
              </button>
            </div>
            <div className={styles.gameChoice}>
              <PetGlyph kind="bone" />
              <h3>간식 받기</h3>
              <p>30초 동안 내 반려동물을 움직여 뼈다귀 간식을 받아요. 빨간 공은 피해요!</p>
              <p className={styles.hint}>최고 {game.games.bestScores.snack}점 · 최대 별사탕 18개</p>
              <button
                className={styles.primaryButton}
                disabled={disabled || starting || !characterReady}
                onClick={() => void start('snack')}
              >
                {practice ? '간식 받기 연습' : '간식 받기 시작'}
              </button>
            </div>
          </div>
          {starting && (
            <p role="status" className={styles.hint}>
              {startPhase === 'preparing'
                ? '게임 그림을 준비하고 있어요…'
                : '게임 시작을 확인하고 있어요…'}
            </p>
          )}
          {startPhase === 'preparing' && (
            <button
              type="button"
              className={styles.smallButton}
              onClick={() => {
                cancelPreparation()
                panel.current?.focus({ preventScroll: true })
              }}
            >
              준비 취소
            </button>
          )}
          {preparationCancelled && (
            <p role="status" className={styles.hint}>
              게임 준비를 멈췄어요. 원할 때 다시 시작해 주세요.
            </p>
          )}
          {preparationFailed && !starting && (
            <div role={characterReady ? 'status' : 'alert'} className={styles.hint}>
              <p>
                {characterReady
                  ? '그림을 다시 준비했어요. 시작 버튼을 눌러 새 게임을 시작해 주세요.'
                  : '게임 그림을 준비하지 못했어요. 방 화면에서 다시 준비한 뒤 시작해 주세요.'}
              </p>
              {!characterReady && (
                <button
                  type="button"
                  className={styles.smallButton}
                  onClick={() => {
                    const device = gameSurface?.closest<HTMLElement>('[data-pet-device]')
                    device?.scrollIntoView({ block: 'start' })
                    device?.focus({ preventScroll: true })
                  }}
                >
                  방 화면으로 이동
                </button>
              )}
            </div>
          )}
          {!characterReady && (
            <p className={styles.hint}>우리 아이의 게임 캐릭터를 준비한 뒤 시작할 수 있어요.</p>
          )}
        </>
      )}
      {activeContent && (gameSurface ? createPortal(activeContent, gameSurface) : activeContent)}
      {snackTouch && stageOverlay && createPortal(snackTouch, stageOverlay)}
      {!active && terminal && (
        <div className={styles.gameResult} role="status">
          <PetGlyph kind="star" />
          <h3>{GAME_LABELS[terminal.game ?? 'memory']} 완료!</h3>
          <p>
            <strong>{terminal.score ?? 0}점</strong> · 별사탕{' '}
            <strong>{terminal.starsDelta}개</strong>
          </p>
          {terminal.summary && (
            <p>
              간식 {terminal.summary.catches}개 · 놓침 {terminal.summary.misses}개 · 빨간 공{' '}
              {terminal.summary.hazards}개
            </p>
          )}
          {terminalMemory && memory && (
            <PetMemoryBoard session={memory} now={now} disabled onFlip={() => {}} />
          )}
          <button
            className={styles.smallButton}
            onClick={() => {
              setDismissedResult(terminal.sessionId ?? null)
              setTerminal(null)
            }}
          >
            결과 닫기
          </button>
        </div>
      )}
      <p className={styles.finePrint}>게임을 하면 반려동물 EXP나 계정 경험치는 변하지 않아요.</p>
      <span className="sr-only">상태 기준 시각 {serverTime}</span>
    </section>
  )
}
