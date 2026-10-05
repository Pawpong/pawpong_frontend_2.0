'use client'

import { useEffect, useRef } from 'react'
import {
  PET_ACTION_LABELS,
  PET_UNLOCK_LABELS,
  petActionHint,
  petLevelProgress,
  remainingSeconds,
  formatPetWait,
  type PetAction,
  type PetView,
} from '@/entities/playground-pet'
import { PixelCheckIcon, ProfileStarIcon } from '@/shared/assets'
import { Button } from '@/shared/ui/Button'
import { cn } from '@/shared/lib/cn'
import { useServerClock } from '../lib/useServerClock'
import { PetImage } from './PetImage'
import styles from './PetRoom.module.css'

const STAT_LABELS = { fullness: '배부름', mood: '기분', energy: '에너지' } as const
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
  disabled,
  reaction,
  onAction,
  onRefresh,
}: {
  view: PetView
  disabled: boolean
  reaction: number
  onAction: (action: PetAction) => void
  onRefresh: () => void
}) {
  const now = useServerClock(view.serverTime)
  const lastRefresh = useRef('')
  const deadlines = Object.values(view.actions ?? {}).flatMap((action) =>
    action.nextAvailableAt ? [Date.parse(action.nextAvailableAt)] : [],
  )
  const deadline = deadlines.length ? Math.min(...deadlines) : null
  useEffect(() => {
    const key = `${view.serverTime}:${deadline}`
    if (deadline !== null && now >= deadline && !disabled && lastRefresh.current !== key) {
      lastRefresh.current = key
      onRefresh()
    }
  }, [now, deadline, disabled, onRefresh, view.serverTime])
  const pet = view.pet
  if (!pet || !view.actions) return null
  const background = view.unlocks.includes('background_starry')
    ? 'background_starry'
    : view.unlocks.includes('background_meadow')
      ? 'background_meadow'
      : 'room_basic'
  const progress = petLevelProgress(pet)
  const primaryAction =
    (Object.keys(PET_ACTION_LABELS) as PetAction[]).find(
      (action) => view.actions![action].allowed && view.actions![action].rewardAvailable,
    ) ?? 'greet'
  return (
    <div className="space-y-6">
      <section
        aria-labelledby="pet-room-heading"
        className="overflow-hidden rounded-2xl border border-secondary-200 bg-base-white"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 tab:px-8 tab:pt-7">
          <div>
            <p className="text-xs font-semibold text-brand">
              함께한 마음 · 친밀도 {pet.stats.affinity}
            </p>
            <h2 id="pet-room-heading" className="mt-1 font-cafe24 text-2xl text-neutral-850">
              {pet.name}의 방
            </h2>
          </div>
          <span className="rounded-lg bg-action-primary px-3 py-2 font-cafe24 text-lg text-brand">
            레벨 {pet.level}
          </span>
        </div>
        <div className="px-5 pt-4 tab:px-8">
          <div className="flex justify-between gap-3 text-xs text-neutral-700">
            <span>
              {pet.xpForNextLevel === null
                ? '최고 레벨까지 함께 자랐어요!'
                : `다음 레벨까지 ${Math.max(0, pet.xpForNextLevel - pet.totalXp)} EXP`}
            </span>
            <span>{pet.totalXp} EXP</span>
          </div>
          <div
            role="progressbar"
            aria-label="반려동물 성장 경험치"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            className="mt-2 h-3 overflow-hidden rounded-sm bg-secondary-100"
          >
            <div className="h-full bg-brand" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="grid gap-6 p-5 tab:p-8 pc:grid-cols-[1.2fr_1fr] pc:gap-8">
          <div>
            <div
              className={cn(
                styles.room,
                background === 'background_meadow' && styles.meadow,
                background === 'background_starry' && styles.starry,
                'flex min-h-72 items-center justify-center px-8 pt-8 pb-5 tab:min-h-80',
              )}
            >
              <div
                key={reaction}
                className={cn(
                  'relative z-10 aspect-square w-full max-w-64',
                  reaction > 0 && styles.reaction,
                )}
              >
                <PetImage
                  key={pet.imageUrl}
                  src={pet.imageUrl}
                  alt={`${pet.name}, 내가 키우는 도트 반려동물`}
                />
              </div>
              {view.unlocks.includes('pixel_decoration') && (
                <ProfileStarIcon
                  filled
                  aria-hidden
                  className="absolute top-5 right-5 size-8 text-brand"
                />
              )}
            </div>
            <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-neutral-700">
              <span>{PET_UNLOCK_LABELS[background]}</span>
              <span>
                {pet.restEndsAt
                  ? `쉬는 중 · ${formatPetWait(remainingSeconds(pet.restEndsAt, now))}`
                  : '언제 돌아와도 여기서 기다릴게요'}
              </span>
            </div>
          </div>
          <div>
            <dl className="grid grid-cols-3 gap-3">
              {Object.entries(STAT_LABELS).map(([key, label]) => {
                const value = pet.stats[key as keyof typeof STAT_LABELS]
                return (
                  <div key={key} className="rounded-xl bg-point-50 p-3 text-center">
                    <dt className="text-xs text-neutral-700">{label}</dt>
                    <dd className="mt-1 text-lg font-semibold text-neutral-850">
                      {value}
                      <span className="ml-0.5 text-xs font-normal text-neutral-700">/100</span>
                    </dd>
                  </div>
                )
              })}
            </dl>
            <h3 className="mt-6 text-base font-semibold text-neutral-850">
              오늘도 우리 아이를 돌봐 주세요
            </h3>
            <div
              className="mt-3 grid grid-cols-2 gap-x-3 gap-y-5"
              aria-label="반려동물 돌보기"
              aria-busy={disabled}
            >
              {(Object.keys(PET_ACTION_LABELS) as PetAction[]).map((action) => (
                <div key={action}>
                  <Button
                    width="full"
                    intent={action === primaryAction ? 'primary' : 'secondary'}
                    disabled={disabled || !view.actions![action].allowed}
                    onClick={() => onAction(action)}
                    aria-describedby={`pet-${action}-hint`}
                  >
                    {PET_ACTION_LABELS[action]}
                  </Button>
                  <p
                    id={`pet-${action}-hint`}
                    className="mt-2 min-h-10 text-xs leading-5 text-neutral-700"
                  >
                    {action === 'rest' && view.actions![action].allowed
                      ? '15분 쉬면 에너지가 차올라요'
                      : petActionHint(view.actions![action], now)}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-neutral-700">
              오래 쉬었다 돌아와도 우리 아이는 사라지지 않아요.
              <br />
              반려동물의 성장 경험치는 계정 등급이나 AI 이용 횟수와 별개예요.
            </p>
          </div>
        </div>
      </section>
      <section
        aria-labelledby="pet-daily-heading"
        className="rounded-2xl border border-secondary-200 bg-point-50 p-5 tab:p-7"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="pet-daily-heading" className="font-cafe24 text-xl text-neutral-850">
            오늘의 작은 약속
          </h2>
          <span className="text-sm text-brand">
            오늘 {view.daily.xp}/{view.daily.maxXp} EXP
          </span>
        </div>
        <ul className="mt-4 grid gap-3 tab:grid-cols-3">
          {view.daily.quests.map((quest) => (
            <li key={quest.id} className="flex items-center gap-3 rounded-xl bg-base-white p-4">
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-point-100 text-brand"
                aria-hidden
              >
                {quest.completed ? (
                  <PixelCheckIcon className="size-4" />
                ) : (
                  <ProfileStarIcon className="size-4" />
                )}
              </span>
              <div>
                <p className="text-sm font-semibold text-neutral-850">
                  {PET_ACTION_LABELS[quest.id]} 한 번
                </p>
                <p className="mt-1 text-xs text-neutral-700">
                  {quest.completed ? '완료했어요' : `함께하면 ${quest.rewardXp} EXP`}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-5 text-neutral-700">
          이번 주 함께한 날 {view.week.daysTogether}/{view.week.totalDays} · 한국 시간 자정에 새
          약속을 만나요.
        </p>
      </section>
      <details className="rounded-2xl border border-secondary-200 bg-base-white px-5 tab:px-7">
        <summary className="min-h-12 cursor-pointer py-4 font-cafe24 text-lg text-neutral-850 focus-ring">
          우리의 성장 기록 · {view.records.length}
        </summary>
        <div className="border-t border-secondary-100 pt-4 pb-6">
          <p className="text-sm text-neutral-700">레벨이 오르면 새로운 방과 추억이 열려요.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {view.unlocks.map((unlock) => (
              <span
                key={unlock}
                className="rounded-full bg-point-100 px-3 py-1.5 text-xs text-brand"
              >
                {PET_UNLOCK_LABELS[unlock] ?? '새로운 추억'}
              </span>
            ))}
          </div>
          <ol className="mt-5 space-y-4">
            {[...view.records].reverse().map((record) => (
              <li key={record.id} className="flex items-start gap-3 text-sm">
                <ProfileStarIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-brand" />
                <div>
                  <p className="text-neutral-850">
                    {record.type === 'level_up'
                      ? `레벨 ${record.level}로 자랐어요`
                      : record.type === 'unlock'
                        ? `${PET_UNLOCK_LABELS[record.unlock ?? ''] ?? '새로운 추억'} 해금`
                        : RECORD_LABELS[record.type]}
                  </p>
                  <time dateTime={record.at} className="mt-1 block text-xs text-neutral-700">
                    {formatDate(record.at)}
                  </time>
                </div>
              </li>
            ))}
          </ol>
          {view.unlocks.includes('max_level_card') && (
            <p className="mt-5 rounded-xl bg-point-50 p-4 font-cafe24 text-brand">
              레벨 10, {pet.name}와 함께한 모든 순간을 기념해요!
            </p>
          )}
        </div>
      </details>
    </div>
  )
}
