'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import {
  PET_ACTION_LABELS,
  petActionHint,
  petDaysTogether,
  petLevelProgress,
  petWaitShort,
  remainingSeconds,
  formatPetWait,
  formatPetCountdown,
  petMood,
  petLevelUp,
  PET_ROOM_TABS,
  type PetTab,
  type PetAction,
  type PetCatalogItem,
  type PetCommand,
  type PetView,
  type PetGameOutcome,
  type PetGameKind,
  type PetRoomSlot,
} from '@/entities/playground-pet'
import type { PetCommandResult } from '@/entities/playground-pet/model/commandQueue'
import {
  PET_SLOT_AREAS,
  PET_SLOT_LABELS,
  PET_SLOTS,
  previewPetRoom,
} from '@/entities/playground-pet/model/room'
import { useServerClock } from '../lib/useServerClock'
import { usePetCharacter } from '../lib/usePetCharacter'
import { usePetAssets } from '../lib/usePetAssets'
import { usePetSound } from '../lib/usePetSound'
import type { PetSession } from '../lib/usePetSession'
import type { PetGameHandle, PetStageSnapshot } from '../lib/petGameEngine'
import { PetImage } from './PetImage'
import { PetStage } from './PetStage'
import { PetDecorations } from './PetDecorations'
import { usePetDeviceViewport } from '../lib/usePetDeviceViewport'
import { PetMiniGames } from './PetMiniGames'
import { PetGlyph } from './PetGlyph'
import { PetAdoption } from './PetAdoption'
import { usePetNavigation } from '../lib/usePetNavigation'
import styles from './PetRoom.module.css'

const STATS = [
  { id: 'fullness', label: '배부름', icon: 'bone' },
  { id: 'mood', label: '기분', icon: 'heart' },
  { id: 'energy', label: '에너지', icon: 'rest' },
] as const
const ACTION_ICONS = { greet: 'paw', feed: 'bone', play: 'play', rest: 'rest' } as const
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
  initialCharacterSourceId,
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
  initialCharacterSourceId?: string
}) {
  const pet = view.pet!
  const viewport = usePetDeviceViewport()
  const game = view.game
  const fullBody = pet.character?.format === 'pet-sprite-v1'
  const requestedSourceId = initialCharacterSourceId?.toLowerCase()
  const replaceCharacter =
    fullBody && requestedSourceId && requestedSourceId !== pet.character?.sourceJobId
  const showCharacterSelection = !fullBody || Boolean(replaceCharacter)
  const active = game?.games.active
  const availableTabs = game
    ? PET_ROOM_TABS
    : PET_ROOM_TABS.filter(({ id }) => id === 'room' || id === 'records')
  const navigation = usePetNavigation(active?.sessionId)
  function setTab(tab: PetTab) {
    navigation.selectTab(tab)
    setItem(null)
  }
  const [canvasReady, setCanvasReady] = useState(false)
  const gameHandle = useRef<PetGameHandle | null>(null)
  const setGameHandle = useCallback((handle: PetGameHandle | null) => {
    gameHandle.current = handle
  }, [])
  const prepareGame = useCallback(
    (kind: PetGameKind) => gameHandle.current?.prepareGame(kind) ?? Promise.resolve(false),
    [],
  )
  const cancelGamePreparation = useCallback(() => {
    gameHandle.current?.cancelPreparation()
  }, [])
  const [gameSurface, setGameSurface] = useState<HTMLDivElement | null>(null)
  const [stageOverlay, setStageOverlay] = useState<HTMLDivElement | null>(null)
  const [slotRequest, setSlotRequest] = useState<{ slot: PetRoomSlot; serial: number } | null>(null)
  const [pokeNotice, setPokeNotice] = useState('')
  const [popDone, setPopDone] = useState(reaction)
  const [online, setOnline] = useState(
    () => typeof navigator === 'undefined' || navigator.onLine !== false,
  )
  const [growth, setGrowth] = useState<{ id: string; level: number; banner: number | null }>({
    id: pet.id,
    level: pet.level,
    banner: null,
  })
  if (growth.id !== pet.id || growth.level !== pet.level)
    setGrowth({ id: pet.id, level: pet.level, banner: petLevelUp(growth, pet) })
  const [selectedItem, setItem] = useState<PetCatalogItem | null>(null)
  const [snack, setSnack] = useState<PetStageSnapshot['snack']>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const character = usePetCharacter(
    session,
    pet.id,
    pet.character?.sourceJobId ?? pet.sourceJobId,
    Boolean(game) && fullBody,
  )
  const assets = usePetAssets()
  const sound = usePetSound()
  const lastSound = useRef(reaction)
  useEffect(() => {
    if (lastSound.current !== reaction) {
      lastSound.current = reaction
      sound.play(feedback.stars > 0)
    }
  }, [reaction, sound, feedback.stars])
  // 캐릭터를 연결하면 포커스를 갖고 있던 연결 안내가 사라지므로 방 화면으로 포커스를 옮긴다.
  useEffect(() => {
    if (gameOutcome?.kind !== 'character') return
    document.getElementById('pet-game-screen')?.focus({ preventScroll: false })
  }, [gameOutcome])
  const now = useServerClock(view.serverTime)
  const resting = Boolean(pet.restEndsAt && now < Date.parse(pet.restEndsAt))
  const mood = petMood(pet.stats, resting)
  // 지금 할 수 없는 돌봄을 계속 권하지 않도록 서버가 알려준 가능 여부를 함께 본다.
  const moodAvailability = mood?.action ? view.actions?.[mood.action] : undefined
  const moodWait = moodAvailability ? petWaitShort(moodAvailability, now) : null
  const moodPossible = !mood?.action || Boolean(moodAvailability?.allowed)
  const daysTogether = petDaysTogether(pet.createdAt, view.serverTime)
  const rewardPop = reaction !== popDone && (feedback.xp > 0 || feedback.stars > 0)
  useEffect(() => {
    if (reaction === popDone) return
    const timer = window.setTimeout(() => setPopDone(reaction), 1800)
    return () => window.clearTimeout(timer)
  }, [reaction, popDone])
  useEffect(() => {
    if (growth.banner === null) return
    const timer = window.setTimeout(
      () => setGrowth((current) => ({ ...current, banner: null })),
      5000,
    )
    return () => window.clearTimeout(timer)
  }, [growth.banner])
  useEffect(() => {
    if (!pokeNotice) return
    const timer = window.setTimeout(() => setPokeNotice(''), 2500)
    return () => window.clearTimeout(timer)
  }, [pokeNotice])
  const lastRefresh = useRef('')
  const refresh = useCallback(() => onRefresh(), [onRefresh])
  const tab = availableTabs.some(({ id }) => id === navigation.tab) ? navigation.tab : 'room'
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
    // 연결이 돌아오면 저장된 화면을 믿지 않고 서버 상태를 다시 읽는다.
    const update = () => {
      setOnline(navigator.onLine)
      if (navigator.onLine) refresh()
    }
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [refresh])
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  const previewing = tab === 'decorate' || tab === 'shop'
  const room = game ? previewPetRoom(game.room, previewing ? selectedItem : null) : null
  const snapshot = useMemo<PetStageSnapshot>(
    () => ({
      room,
      manifest: assets.manifest,
      characterUrl: fullBody ? character.url : null,
      resting,
      mood: moodPossible ? (mood?.kind ?? null) : null,
      highlight: previewing && selectedItem ? selectedItem.slot : null,
      reaction,
      feedback,
      reducedMotion,
      snack,
    }),
    [
      room,
      assets.manifest,
      character.url,
      fullBody,
      resting,
      mood?.kind,
      moodPossible,
      previewing,
      selectedItem,
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
  const stageReady = fullBody && Boolean(canvasReady && character.url && assets.manifest)
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
    <div
      ref={viewport}
      className={styles.gameLayout}
      data-active-game={Boolean(active)}
      data-compact={previewing && !active}
    >
      <section
        data-pet-device
        id="pet-game-screen"
        tabIndex={-1}
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
            <PetStage
              snapshot={snapshot}
              name={pet.name}
              onReady={setCanvasReady}
              onGame={setGameHandle}
              onPoke={(result) =>
                setPokeNotice(
                  result === 'pet'
                    ? `쓰다듬어 줬어요. ${pet.name} 기분이 좋아 보여요!`
                    : `${pet.name}, 이리 와!`,
                )
              }
            >
              <div ref={setStageOverlay} className={styles.stageOverlay} />
              {previewing &&
                !active &&
                PET_SLOTS.map((slot) => {
                  const area = PET_SLOT_AREAS[slot]
                  return (
                    <button
                      key={slot}
                      className={styles.hotspot}
                      style={{
                        left: `${((area.x + area.width / 2) / 320) * 100}%`,
                        top: `${((area.y + area.height / 2) / 224) * 100}%`,
                      }}
                      aria-pressed={slotRequest?.slot === slot}
                      aria-label={`${PET_SLOT_LABELS[slot]} 소품 고르기`}
                      onClick={() => {
                        setItem(null)
                        setSlotRequest((current) => ({ slot, serial: (current?.serial ?? 0) + 1 }))
                      }}
                    >
                      {PET_SLOT_LABELS[slot]}
                    </button>
                  )
                })}
              {rewardPop && !active && (
                <p className={styles.rewardPop} aria-hidden="true">
                  {feedback.xp > 0 && <span>+{feedback.xp} EXP</span>}
                  {feedback.stars > 0 && (
                    <span>
                      <PetGlyph kind="star" /> +{feedback.stars}
                    </span>
                  )}
                </p>
              )}
              {growth.banner !== null && !active && (
                <p className={styles.levelUp} role="status">
                  <PetGlyph kind="star" /> Lv.{growth.banner} 달성! {pet.name} 한 뼘 자랐어요
                </p>
              )}
            </PetStage>
          ) : (
            <div className={styles.carePortrait}>
              <PetImage src={pet.imageUrl} alt={`${pet.name}의 도트 초상화`} />
            </div>
          )}
          {game && !fullBody && !active && (
            <div className={styles.stageStatus}>
              <p>우리 아이의 캐릭터를 연결하면 이 방에서 함께 놀 수 있어요.</p>
              <a className={styles.smallButton} href="#pet-character-connection">
                캐릭터 연결하기
              </a>
            </div>
          )}
          {!active && operationNotice}
          {game && (character.error || assets.error) && (
            <div className={styles.characterError} role="alert">
              <p>{character.error || assets.error}</p>
              <p>원래 그림은 성장 기록에서 볼 수 있어요. 게임 캐릭터는 다시 준비할 수 있어요.</p>
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
          {previewing && selectedItem && (
            <p className={styles.previewLabel}>미리보기 · {selectedItem.name}</p>
          )}
          {resting && !active && (
            <p className={styles.restLabel}>
              쉬는 중 · {formatPetCountdown(remainingSeconds(pet.restEndsAt, now))}
            </p>
          )}
        </div>
        {active && operationNotice}
        {!online && (
          <p className={styles.offline} role="alert">
            인터넷 연결이 끊겼어요. 연결되면 최신 상태를 다시 불러올게요.
          </p>
        )}
        {!active && fullBody && (
          <p className={styles.moodLine} role="status" aria-live="polite">
            {pokeNotice ||
              (mood
                ? `${pet.name} · ${mood.label}${
                    !mood.action
                      ? ''
                      : moodPossible
                        ? ` → ${PET_ACTION_LABELS[mood.action]}`
                        : ` · ${PET_ACTION_LABELS[mood.action]}는 ${moodWait ?? '조금 뒤'} 할 수 있어요`
                  }`
                : `방을 눌러 ${pet.name} 불러 보세요. 쓰다듬어 줄 수도 있어요.`)}
          </p>
        )}
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
                data-suggested={mood?.action === action && Boolean(availability?.allowed)}
                disabled={disabled || Boolean(active) || !availability?.allowed}
                title={hint}
                aria-label={`${PET_ACTION_LABELS[action]}, ${hint}`}
                onClick={() => onAction(action)}
              >
                <PetGlyph kind={ACTION_ICONS[action]} />
                <span>{PET_ACTION_LABELS[action]}</span>
                {availability && petWaitShort(availability, now) && (
                  <small>{petWaitShort(availability, now)}</small>
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
              onClick={() => setTab(id)}
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
        {showCharacterSelection && (
          <section
            id="pet-character-connection"
            className={styles.panel}
            aria-label="캐릭터 연결 안내"
          >
            <h2>우리 아이의 게임 캐릭터를 연결해요</h2>
            <p className={styles.hint}>
              {fullBody
                ? '새 캐릭터를 확인하고 직접 연결해 주세요.'
                : '기존 그림은 사진용 초상화예요.'}{' '}
              돌봄·이름·성장 기록·별사탕은 그대로 유지돼요. 자동으로 새 그림을 만들거나 이용 횟수를
              쓰지 않아요.
            </p>
            <PetAdoption
              key={requestedSourceId ?? pet.character?.sourceJobId ?? pet.sourceJobId}
              session={session}
              initialSourceJobId={requestedSourceId}
              connectRevision={pet.revision}
              disabled={disabled || Boolean(active)}
              onAdopt={(command) => void onCommand(command)}
            />
            {replaceCharacter && (
              <button
                className={styles.smallButton}
                disabled={disabled || Boolean(active)}
                onClick={navigation.clearSource}
              >
                지금 캐릭터 유지하기
              </button>
            )}
          </section>
        )}
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
              {daysTogether !== null && `${pet.name}와 함께한 지 ${daysTogether}일째예요. `}
              {view.week.daysTogether > 0 && `이번 주에는 ${view.week.daysTogether}일 만났어요. `}
              돌봄으로 자라고, 별사탕으로 방을 꾸며요.
            </p>
            <div className={styles.questProgress}>
              <span>
                오늘의 돌봄 {view.daily.quests.filter((quest) => quest.completed).length} /{' '}
                {view.daily.quests.length}
              </span>
              <progress
                value={view.daily.quests.filter((quest) => quest.completed).length}
                max={Math.max(1, view.daily.quests.length)}
                aria-label={`오늘의 돌봄 ${view.daily.quests.filter((quest) => quest.completed).length} / ${view.daily.quests.length}`}
              />
            </div>
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
                  <button className={styles.smallButton} onClick={() => setTab('shop')}>
                    별사탕 상점
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
          {game && tab === 'decorate' && (
            <PetDecorations
              mode="inventory"
              game={game}
              level={pet.level}
              revision={pet.revision}
              disabled={disabled}
              manifest={assets.manifest}
              selected={selectedItem}
              onSelect={setItem}
              slotRequest={slotRequest}
              onCommand={onCommand}
              onOpenShop={() => setTab('shop')}
              onReloadImages={assets.retry}
              loadingImages={!assets.manifest && !assets.error}
            />
          )}
        </div>
        <div
          id="pet-panel-shop"
          role="tabpanel"
          aria-labelledby="pet-tab-shop"
          hidden={tab !== 'shop'}
        >
          {game && tab === 'shop' && (
            <PetDecorations
              mode="shop"
              game={game}
              level={pet.level}
              revision={pet.revision}
              disabled={disabled}
              manifest={assets.manifest}
              selected={selectedItem}
              onSelect={setItem}
              slotRequest={slotRequest}
              onCommand={onCommand}
              onReloadImages={assets.retry}
              loadingImages={!assets.manifest && !assets.error}
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
              key={pet.id}
              game={game}
              gameOutcome={gameOutcome}
              revision={pet.revision}
              serverTime={view.serverTime}
              now={now}
              disabled={disabled}
              selected={tab === 'games'}
              characterReady={stageReady}
              onPrepareGame={prepareGame}
              onCancelPreparation={cancelGamePreparation}
              gameSurface={gameSurface}
              stageOverlay={stageOverlay}
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
              {/* 레벨이 오를 때 서버가 남기는 unlock 기록은 실제로 열리는 콘텐츠가 없어 보여주지 않는다. */}
              {view.records
                .filter((record) => record.type !== 'unlock')
                .map((record) => (
                  <li key={record.id}>
                    <time dateTime={record.at}>{formatDate(record.at)}</time>
                    <span>
                      {RECORD_LABELS[record.type]}
                      {record.level ? ` · Lv.${record.level}` : ''}
                    </span>
                  </li>
                ))}
            </ul>
            <details className={styles.hint}>
              <summary>처음 함께한 그림 보기</summary>
              <div className={styles.portrait}>
                <PetImage src={pet.imageUrl} alt={`${pet.name}의 처음 함께한 그림`} />
              </div>
            </details>
          </section>
        </div>
      </div>
    </div>
  )
}
