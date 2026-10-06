'use client'

import { useId, useState, type ReactNode } from 'react'
import {
  CLINIC_REASON_LABELS,
  CommunityPixelIcon,
  LIFE_ACTIVITY_LABELS,
  LIFE_CONDITION_LABELS,
  WALK_AMENITY_LABELS,
  WALK_DIFFICULTY_LABELS,
  communityToday,
  type CommunityPixelIconName,
} from '@/entities/community'
import { cn } from '@/shared/lib/cn'
import type {
  CommunityClinicRecord,
  CommunityLifeRecord,
  CommunityWalkRecord,
} from '@/shared/types'

const INPUT =
  'min-h-11 w-full min-w-0 rounded-lg border border-neutral-200 bg-white px-3 text-base text-neutral-850 focus-ring disabled:bg-neutral-50 tab:text-sm'

function RecordSection({
  icon,
  title,
  note,
  children,
}: {
  icon: CommunityPixelIconName
  title: string
  note: string
  children: ReactNode
}) {
  return (
    <section
      aria-label={title}
      className="rounded-xl border border-primary-200 bg-white p-4 tab:p-5"
    >
      <h4 className="flex items-center gap-2 font-cafe24 text-base text-primary-700">
        <CommunityPixelIcon name={icon} className="text-primary-500" />
        {title}
      </h4>
      <p className="mt-1 text-xs leading-relaxed text-neutral-700">{note}</p>
      <div className="mt-4 grid grid-cols-1 gap-4 tab:grid-cols-2">{children}</div>
    </section>
  )
}

function Field({
  label,
  required,
  wide,
  children,
}: {
  label: string
  required?: boolean
  wide?: boolean
  children: (id: string) => ReactNode
}) {
  const id = useId()
  return (
    <div className={cn('min-w-0', wide && 'tab:col-span-2')}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold text-neutral-850">
        {label}
        {required ? (
          <span className="ml-1 font-medium text-primary-600">필수</span>
        ) : (
          <span className="ml-1 font-medium text-neutral-500">선택</span>
        )}
      </label>
      {children(id)}
    </div>
  )
}

function DateInput({
  id,
  value,
  min,
  max,
  onChange,
}: {
  id: string
  value: string
  min?: string
  max?: string
  onChange: (value: string) => void
}) {
  return (
    <input
      id={id}
      type="date"
      value={value}
      min={min}
      max={max}
      onChange={(event) => onChange(event.target.value)}
      className={INPUT}
    />
  )
}

/** 정수만 받는 칸 — 비우면 값 자체를 지운다. */
function IntegerInput({
  id,
  value,
  max,
  unit,
  placeholder,
  onChange,
}: {
  id: string
  value: number | undefined
  max: number
  unit: string
  placeholder?: string
  onChange: (value: number | undefined) => void
}) {
  return (
    <div className="relative">
      <input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        value={value === undefined ? '' : String(value)}
        placeholder={placeholder}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, '').slice(0, 9)
          onChange(digits ? Math.min(Number(digits), max) : undefined)
        }}
        className={cn(INPUT, 'pr-12')}
      />
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-medium text-neutral-600">
        {unit}
      </span>
    </div>
  )
}

/** 거리는 km로 받고 m 정수로 저장한다. 입력 중인 소수점을 지키려고 글자를 따로 든다. */
function DistanceInput({
  id,
  value,
  onChange,
}: {
  id: string
  value: number | undefined
  onChange: (value: number | undefined) => void
}) {
  const [text, setText] = useState(value === undefined ? '' : String(value / 1000))
  return (
    <div className="relative">
      <input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        value={text}
        placeholder="예: 2.5"
        onChange={(event) => {
          const next = event.target.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')
          setText(next.slice(0, 6))
          const km = Number(next)
          onChange(
            next && Number.isFinite(km) ? Math.min(Math.round(km * 1000), 100000) : undefined,
          )
        }}
        className={cn(INPUT, 'pr-12')}
      />
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-medium text-neutral-600">
        km
      </span>
    </div>
  )
}

function ChoiceGroup<T extends string>({
  label,
  options,
  selected,
  onToggle,
  wide,
  optional = true,
}: {
  label: string
  options: Record<T, string>
  selected: (key: T) => boolean
  onToggle: (key: T) => void
  wide?: boolean
  optional?: boolean
}) {
  return (
    <fieldset className={cn('min-w-0', wide && 'tab:col-span-2')}>
      <legend className="mb-1.5 text-xs font-bold text-neutral-850">
        {label}
        <span
          className={cn('ml-1 font-medium', optional ? 'text-neutral-500' : 'text-primary-600')}
        >
          {optional ? '선택' : '필수'}
        </span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(options) as T[]).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={selected(key)}
            onClick={() => onToggle(key)}
            className={cn(
              'min-h-9 rounded-full border px-3 text-sm focus-ring transition-colors',
              selected(key)
                ? 'border-primary-500 bg-secondary-200 font-bold text-primary-700'
                : 'border-neutral-200 bg-white font-medium text-neutral-700 hover:bg-secondary-50',
            )}
          >
            {options[key]}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

const LEASH_OPTIONS = { required: '꼭 필요해요', free: '자유로운 구간이 있어요' }

export function WalkRecordFields({
  value,
  onChange,
}: {
  value: CommunityWalkRecord
  onChange: (value: CommunityWalkRecord) => void
}) {
  const today = communityToday()
  const patch = (next: Partial<CommunityWalkRecord>) => onChange({ ...value, ...next })
  const amenities = value.amenities ?? []
  return (
    <RecordSection
      icon="walk"
      title="산책 기록"
      note="직접 걸은 만큼만 적어 주세요. 위치를 자동으로 추적하지 않아요."
    >
      <Field label="산책한 날" required>
        {(id) => (
          <DateInput
            id={id}
            value={value.walkedOn}
            max={today}
            onChange={(walkedOn) => patch({ walkedOn })}
          />
        )}
      </Field>
      <Field label="걸은 시간">
        {(id) => (
          <IntegerInput
            id={id}
            value={value.durationMinutes}
            max={1440}
            unit="분"
            placeholder="예: 40"
            onChange={(durationMinutes) => patch({ durationMinutes: durationMinutes || undefined })}
          />
        )}
      </Field>
      <Field label="걸은 거리">
        {(id) => (
          <DistanceInput
            id={id}
            value={value.distanceMeters}
            onChange={(distanceMeters) => patch({ distanceMeters })}
          />
        )}
      </Field>
      <ChoiceGroup
        label="난이도"
        options={WALK_DIFFICULTY_LABELS}
        selected={(key) => value.difficulty === key}
        onToggle={(key) => patch({ difficulty: value.difficulty === key ? undefined : key })}
      />
      <ChoiceGroup
        label="목줄"
        options={LEASH_OPTIONS}
        selected={(key) => value.leashRequired === (key === 'required')}
        onToggle={(key) => {
          const next = key === 'required'
          patch({ leashRequired: value.leashRequired === next ? undefined : next })
        }}
      />
      <ChoiceGroup
        label="있어서 좋았던 것"
        options={WALK_AMENITY_LABELS}
        selected={(key) => amenities.includes(key)}
        onToggle={(key) =>
          patch({
            amenities: amenities.includes(key)
              ? amenities.filter((item) => item !== key)
              : [...amenities, key],
          })
        }
      />
    </RecordSection>
  )
}

export function ClinicRecordFields({
  value,
  onChange,
  search,
}: {
  value: CommunityClinicRecord
  onChange: (value: CommunityClinicRecord) => void
  /** 병원 이름 찾기 — 고른 병원의 공개 상호만 채운다 */
  search?: ReactNode
}) {
  const today = communityToday()
  const patch = (next: Partial<CommunityClinicRecord>) => onChange({ ...value, ...next })
  return (
    <RecordSection
      icon="clinic"
      title="병원 방문"
      note="내가 겪은 방문 경험만 적어요. 진단·처방 내용이나 진료기록 사진은 올리지 마세요."
    >
      <Field label="방문한 날" required>
        {(id) => (
          <DateInput
            id={id}
            value={value.visitedOn}
            max={today}
            onChange={(visitedOn) =>
              patch({
                visitedOn,
                // 방문일을 뒤로 옮기면 그보다 앞선 다음 방문일은 지운다.
                ...(value.followUpOn && value.followUpOn < visitedOn
                  ? { followUpOn: undefined }
                  : {}),
              })
            }
          />
        )}
      </Field>
      <Field label="병원 이름" required>
        {(id) => (
          <input
            id={id}
            value={value.clinicName}
            maxLength={80}
            autoComplete="off"
            placeholder="공개된 병원 상호"
            onChange={(event) => patch({ clinicName: event.target.value })}
            className={INPUT}
          />
        )}
      </Field>
      {search && <div className="min-w-0 tab:col-span-2">{search}</div>}
      <ChoiceGroup
        wide
        optional={false}
        label="방문 목적"
        options={CLINIC_REASON_LABELS}
        selected={(key) => value.visitReason === key}
        onToggle={(visitReason) => patch({ visitReason })}
      />
      <Field label="대기 시간">
        {(id) => (
          <IntegerInput
            id={id}
            value={value.waitMinutes}
            max={1440}
            unit="분"
            placeholder="바로 진료면 0"
            onChange={(waitMinutes) => patch({ waitMinutes })}
          />
        )}
      </Field>
      <Field label="낸 비용">
        {(id) => (
          <IntegerInput
            id={id}
            value={value.costKrw}
            max={100000000}
            unit="원"
            placeholder="예: 55000"
            onChange={(costKrw) => patch({ costKrw })}
          />
        )}
      </Field>
      <Field label="다음 방문 예정일">
        {(id) => (
          <DateInput
            id={id}
            value={value.followUpOn ?? ''}
            min={value.visitedOn}
            onChange={(followUpOn) => patch({ followUpOn: followUpOn || undefined })}
          />
        )}
      </Field>
    </RecordSection>
  )
}

export function LifeRecordFields({
  value,
  onChange,
}: {
  value: CommunityLifeRecord
  onChange: (value: CommunityLifeRecord) => void
}) {
  const today = communityToday()
  const patch = (next: Partial<CommunityLifeRecord>) => onChange({ ...value, ...next })
  return (
    <RecordSection
      icon="life"
      title="일상·돌봄 기록"
      note="오늘 무엇을 했는지 남겨 두면 나중에 다시 찾아보기 쉬워요."
    >
      <Field label="기록한 날" required>
        {(id) => (
          <DateInput
            id={id}
            value={value.recordedOn}
            max={today}
            onChange={(recordedOn) => patch({ recordedOn })}
          />
        )}
      </Field>
      <Field label="아이 이름">
        {(id) => (
          <input
            id={id}
            value={value.petName ?? ''}
            maxLength={40}
            autoComplete="off"
            placeholder="예: 보리"
            onChange={(event) => patch({ petName: event.target.value || undefined })}
            className={INPUT}
          />
        )}
      </Field>
      <ChoiceGroup
        wide
        optional={false}
        label="무엇을 했나요"
        options={LIFE_ACTIVITY_LABELS}
        selected={(key) => value.activity === key}
        onToggle={(activity) => patch({ activity })}
      />
      <ChoiceGroup
        wide
        label="아이 상태"
        options={LIFE_CONDITION_LABELS}
        selected={(key) => value.condition === key}
        onToggle={(key) => patch({ condition: value.condition === key ? undefined : key })}
      />
    </RecordSection>
  )
}
