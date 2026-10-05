'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import {
  PET_ACTION_LABELS,
  petActionHint,
  petLevelProgress,
  remainingSeconds,
  formatPetWait,
  type PetAction,
  type PetCatalogItem,
  type PetCommand,
  type PetView,
  type PetGameOutcome,
} from '@/entities/playground-pet'
import type { PetCommandResult } from '@/entities/playground-pet/model/commandQueue'
import { PET_SLOT_LABELS, PET_SLOTS, previewPetRoom } from '@/entities/playground-pet/model/room'
import { useServerClock } from '../lib/useServerClock'
import { usePetCharacter } from '../lib/usePetCharacter'
import { usePetAssets } from '../lib/usePetAssets'
import { usePetSound } from '../lib/usePetSound'
import type { PetSession } from '../lib/usePetSession'
import type { PetStageSnapshot } from '../lib/petGameEngine'
import { PetImage } from './PetImage'
import { PetStage } from './PetStage'
import { PetDecorations } from './PetDecorations'
import { PetMiniGames } from './PetMiniGames'
import { PetGlyph } from './PetGlyph'
import styles from './PetRoom.module.css'

const STATS = [
  { id: 'fullness', label: '배부름', icon: 'bone' },
  { id: 'mood', label: '기분', icon: 'heart' },
  { id: 'energy', label: '에너지', icon: 'rest' },
] as const
const ACTION_ICONS = { greet: 'paw', feed: 'bone', play: 'play', rest: 'rest' } as const
const TABS = [
  { id: 'room', label: '내 방' },
  { id: 'decorate', label: '꾸미기' },
  { id: 'games', label: '미니게임' },
  { id: 'records', label: '기록' },
] as const
type PetTab = (typeof TABS)[number]['id']
const RECORD_LABELS = {
  adopted: '처음 만난 날',
  first_meal: '첫 식사를 함께했어요',
  level_up: '우리 아이가 자랐어요',
  unlock: '새로운 추억이 열렸어요',
  seven_days: '일곱 날을 함께했어요',
}
const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'long',
    day: 'numeric',
  }).format(new Date(iso))

export function PetRoom({
  view,
  session,
  disabled,
  reaction,
  gameOutcome,
  feedback,
  operation,
  onAction,
  onRefresh,
  onCommand,
}: {
  view: PetView
  session: PetSession
  disabled: boolean
  reaction: number
  gameOutcome: PetGameOutcome | null
  operation: { busy: boolean; uncertain: boolean; notice: string; onRetry: () => void }
  feedback: { action: PetAction | 'adopt' | null; stars: number; xp: number }
  onAction: (action: PetAction) => void
  onRefresh: () => void
  onCommand: (command: PetCommand) => Promise<PetCommandResult | undefined>
}) {
  const pet = view.pet!
  const game = view.game
  const active = game?.games.active
  const availableTabs = game ? TABS : TABS.filter(({ id }) => id === 'room' || id === 'records')
  const [menu, setMenu] = useState<{ tab: PetTab; sessionId: string | null }>(() => ({
    tab: active ? 'games' : 'room',
    sessionId: active?.sessionId ?? null,
  }))
  if (active && menu.sessionId !== active.sessionId)
    setMenu({ tab: 'games', sessionId: active.sessionId })
  function setTab(tab: PetTab) {
    setMenu((current) => ({ ...current, tab }))
  }
  const [canvasReady, setCanvasReady] = useState(false)
  const [gameSurface, setGameSurface] = useState<HTMLDivElement | null>(null)
  const [selectedItem, setItem] = useState<PetCatalogItem | null>(null)
  const [snack, setSnack] = useState<PetStageSnapshot['snack']>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const character = usePetCharacter(session, pet.id, pet.sourceJobId, Boolean(game))
  const assets = usePetAssets()
  const sound = usePetSound()
  const lastSound = useRef(reaction)
  useEffect(() => {
    if (lastSound.current !== reaction) {
      lastSound.current = reaction
      sound.play(feedback.stars > 0)
    }
  }, [reaction, sound, feedback.stars])
  const now = useServerClock(view.serverTime)
  const lastRefresh = useRef('')
  const refresh = useCallback(() => onRefresh(), [onRefresh])
  const tab = active ? 'games' : availableTabs.some(({ id }) => id === menu.tab) ? menu.tab : 'room'
  const deadlines = Object.values(view.actions ?? {}).flatMap((action) =>
    action.nextAvailableAt ? [Date.parse(action.nextAvailableAt)] : [],
  )
  const deadline = deadlines.length ? Math.min(...deadlines) : null
  useEffect(() => {
    const key = `${view.serverTime}:${deadline}`
    if (deadline !== null && now >= deadline && !disabled && lastRefresh.current !== key) {
      lastRefresh.current = key
      refresh()
    }
  }, [deadline, disabled, now, refresh, view.serverTime])
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  const room = game ? previewPetRoom(game.room, tab === 'decorate' ? selectedItem : null) : null
  const snapshot = useMemo<PetStageSnapshot>(
    () => ({
      room,
      manifest: assets.manifest,
      characterUrl: character.url,
      resting: Boolean(pet.restEndsAt && now < Date.parse(pet.restEndsAt)),
      reaction,
      feedback,
      reducedMotion,
      snack,
    }),
    [
      room,
      assets.manifest,
      character.url,
      pet.restEndsAt,
      now,
      reaction,
      feedback,
      reducedMotion,
      snack,
    ],
  )
  function tabKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) || active) return
    const index = availableTabs.findIndex((entry) => entry.id === tab)
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? availableTabs.length - 1
          : (index + (event.key === 'ArrowRight' ? 1 : -1) + availableTabs.length) %
            availableTabs.length
    event.preventDefault()
    setTab(availableTabs[next].id)
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
  }
  const stageReady = Boolean(canvasReady && character.url && assets.manifest)
  const operationNotice = (operation.busy || operation.notice) && (
    <div
      className={active ? styles.activeOperation : styles.operationLabel}
      role={operation.uncertain ? 'alert' : 'status'}
      aria-live="polite"
    >
      <p>{operation.busy ? '저장하는 중…' : operation.notice}</p>
      {operation.uncertain && (
        <button
          className={styles.smallButton}
          disabled={operation.busy}
          onClick={operation.onRetry}
        >
          요청 결과 다시 확인
        </button>
      )}
    </div>
  )
  return (
    <div className={styles.gameLayout} data-active-game={Boolean(active)}>
      <section
        data-pet-device
        className={styles.device}
        aria-label={`${pet.name}의 휴대형 반려동물 게임`}
      >
        <div className={styles.deviceBrand}>
          <span>PAWPONG</span>
          <span>내 반려동물 키우기</span>
          <span className={styles.powerDot} aria-hidden="true" />
        </div>
        <button
          className={styles.soundToggle}
          aria-pressed={sound.enabled}
          onClick={() => void sound.toggle()}
        >
          {sound.unavailable ? '소리 사용 불가' : sound.enabled ? '소리 켜짐 ♪' : '소리 꺼짐'}
        </button>
        <div className={styles.deviceHeader}>
          <div>
            <h2>{pet.name}</h2>
            <span className={styles.level}>Lv.{pet.level}</span>
          </div>
          <span className={styles.wallet} aria-label={`별사탕 ${game?.wallet.stars ?? 0}개`}>
            <PetGlyph kind="star" /> {game ? game.wallet.stars.toLocaleString('ko-KR') : '—'}
          </span>
        </div>
        <div className={styles.screenFrame}>
          {game ? (
            <PetStage snapshot={snapshot} name={pet.name} onReady={setCanvasReady} />
          ) : (
            <div className={styles.carePortrait}>
              <PetImage src={pet.imageUrl} alt={`${pet.name}의 도트 초상화`} />
            </div>
          )}
          {!active && operationNotice}
          {game && (character.error || assets.error) && (
            <div className={styles.characterError} role="alert">
              <p>{character.error || assets.error}</p>
              <p>아래는 원본 초상화예요. 게임 캐릭터는 다시 준비할 수 있어요.</p>
              <div className={styles.portrait}>
                <PetImage src={pet.imageUrl} alt={`${pet.name}의 원본 도트 초상화`} />
              </div>
              <div className={styles.buttonRow}>
                {character.error && (
                  <button className={styles.smallButton} onClick={character.retry}>
                    내 캐릭터 다시 준비
                  </button>
                )}
                {assets.error && (
                  <button className={styles.smallButton} onClick={assets.retry}>
                    방 그림 다시 준비
                  </button>
                )}
              </div>
            </div>
          )}
          {tab === 'decorate' && selectedItem && (
            <p className={styles.previewLabel}>미리보기 · {selectedItem.name}</p>
          )}
          {pet.restEndsAt && now < Date.parse(pet.restEndsAt) && !active && (
            <p className={styles.restLabel}>
              쉬는 중 · {Math.ceil(remainingSeconds(pet.restEndsAt, now) / 60)}분
            </p>
          )}
        </div>
        {active && operationNotice}
        <div ref={setGameSurface} className={styles.deviceGameSurface} hidden={!active} />
        <div className={styles.stats} aria-label="우리 아이 상태">
          {STATS.map(({ id, label, icon }) => (
            <div key={id} className={styles.stat}>
              <div>
                <PetGlyph kind={icon} />
                <span>{label}</span>
                <strong>{pet.stats[id]}</strong>
              </div>
              <progress value={pet.stats[id]} max={100} aria-label={`${label} ${pet.stats[id]}`} />
            </div>
          ))}
        </div>
        <div className={styles.growth}>
          <div>
            <span>성장 EXP</span>
            <span>
              {pet.totalXp} / {pet.xpForNextLevel ?? 'MAX'}
            </span>
          </div>
          <progress value={petLevelProgress(pet)} max={100} aria-label="다음 레벨까지 성장" />
        </div>
        <div className={styles.careButtons}>
          {(Object.keys(PET_ACTION_LABELS) as PetAction[]).map((action) => {
            const availability = view.actions?.[action]
            const hint = availability ? petActionHint(availability, now) : '상태를 불러오는 중'
            return (
              <button
                key={action}
                className={styles.careButton}
                disabled={disabled || Boolean(active) || !availability?.allowed}
                title={hint}
                aria-label={`${PET_ACTION_LABELS[action]}, ${hint}`}
                onClick={() => onAction(action)}
              >
                <PetGlyph kind={ACTION_ICONS[action]} />
                <span>{PET_ACTION_LABELS[action]}</span>
                {!availability?.allowed && availability?.nextAvailableAt && (
                  <small>
                    {Math.max(
                      1,
                      Math.ceil(remainingSeconds(availability.nextAvailableAt, now) / 60),
                    )}
                    분
                  </small>
                )}
              </button>
            )
          })}
        </div>
        <div className={styles.tabs} role="tablist" aria-label="게임 메뉴" onKeyDown={tabKeys}>
          {availableTabs.map(({ id, label }) => (
            <button
              key={id}
              id={`pet-tab-${id}`}
              role="tab"
              aria-selected={tab === id}
              aria-controls={`pet-panel-${id}`}
              tabIndex={tab === id ? 0 : -1}
              disabled={Boolean(active) && id !== 'games'}
              onClick={() => {
                setTab(id)
                setItem(null)
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className={styles.deviceFooter} aria-hidden="true">
          <span>●</span>
          <i />
          <i />
          <i />
          <span>●</span>
        </div>
      </section>
      <div className={styles.contentPanels}>
        <div
          id="pet-panel-room"
          role="tabpanel"
          aria-labelledby="pet-tab-room"
          hidden={tab !== 'room'}
        >
          <section className={styles.panel}>
            <div className={styles.panelHeading}>
              <div>
                <p className={styles.eyebrow}>오늘도 함께하는 작은 일상</p>
                <h2>우리 아이의 방</h2>
              </div>
              <PetGlyph kind="paw" />
            </div>
            <p className={styles.hint}>
              {pet.name}와 {view.week.daysTogether}일째 함께하고 있어요. 돌봄으로 자라고, 별사탕으로
              방을 꾸며요.
            </p>
            <div className={styles.questList}>
              {view.daily.quests.map((quest) => (
                <div key={quest.id}>
                  <span>
                    <PetGlyph kind={ACTION_ICONS[quest.id]} /> {PET_ACTION_LABELS[quest.id]}
                  </span>
                  <strong>{quest.completed ? '완료 ✓' : `+${quest.rewardXp} EXP`}</strong>
                </div>
              ))}
            </div>
            <p className={styles.finePrint}>
              오늘 성장 EXP {view.daily.xp} / {view.daily.maxXp} · 친밀도 {pet.stats.affinity}
            </p>
            {game ? (
              <>
                <div className={styles.roomInventory}>
                  {PET_SLOTS.map((slot) => (
                    <div key={slot}>
                      <span>{PET_SLOT_LABELS[slot]}</span>
                      <strong>
                        {game.catalog.find((item) => item.id === game.room[slot])?.name ??
                          '비어 있음'}
                      </strong>
                    </div>
                  ))}
                </div>
                <div className={styles.buttonRow}>
                  <button className={styles.primaryButton} onClick={() => setTab('decorate')}>
                    우리 아이 방 꾸미기
                  </button>
                  <button className={styles.smallButton} onClick={() => setTab('games')}>
                    미니게임 하기
                  </button>
                </div>
              </>
            ) : (
              <p role="status" className={styles.hint}>
                새 게임 기능을 준비하고 있어요. 돌봄은 계속할 수 있어요.
              </p>
            )}
            {pet.restEndsAt && (
              <p className={styles.hint}>
                휴식 {formatPetWait(remainingSeconds(pet.restEndsAt, now))}
              </p>
            )}
          </section>
        </div>
        <div
          id="pet-panel-decorate"
          role="tabpanel"
          aria-labelledby="pet-tab-decorate"
          hidden={tab !== 'decorate'}
        >
          {game && (
            <PetDecorations
              game={game}
              level={pet.level}
              revision={pet.revision}
              disabled={disabled}
              manifest={assets.manifest}
              selected={selectedItem}
              onSelect={setItem}
              onCommand={onCommand}
            />
          )}
        </div>
        <div
          id="pet-panel-games"
          role="tabpanel"
          aria-labelledby="pet-tab-games"
          hidden={tab !== 'games'}
        >
          {game && (
            <PetMiniGames
              game={game}
              gameOutcome={gameOutcome}
              revision={pet.revision}
              serverTime={view.serverTime}
              now={now}
              disabled={disabled}
              characterReady={stageReady}
              gameSurface={gameSurface}
              onCommand={onCommand}
              onRefresh={refresh}
              onSnack={setSnack}
            />
          )}
        </div>
        <div
          id="pet-panel-records"
          role="tabpanel"
          aria-labelledby="pet-tab-records"
          hidden={tab !== 'records'}
        >
          <section className={styles.panel}>
            <div className={styles.panelHeading}>
              <div>
                <p className={styles.eyebrow}>같이 쌓은 작은 추억</p>
                <h2>성장 기록</h2>
              </div>
              <PetGlyph kind="star" />
            </div>
            {game && (
              <ul className={styles.achievements}>
                {game.achievements.map((achievement) => (
                  <li
                    key={achievement.id}
                    className={achievement.completed ? styles.achievementDone : undefined}
                  >
                    <PetGlyph kind={achievement.completed ? 'star' : 'paw'} />
                    <div>
                      <strong>{achievement.label}</strong>
                      <progress
                        max={achievement.target}
                        value={achievement.progress}
                        aria-label={`${achievement.label} 진행`}
                      />
                    </div>
                    <span>
                      {achievement.completed
                        ? '완료'
                        : `${achievement.progress}/${achievement.target}`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <ul className={styles.records}>
              {view.records.map((record) => (
                <li key={record.id}>
                  <time dateTime={record.at}>{formatDate(record.at)}</time>
                  <span>
                    {RECORD_LABELS[record.type]}
                    {record.level ? ` · Lv.${record.level}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
