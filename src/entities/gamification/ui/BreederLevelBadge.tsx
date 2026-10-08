'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CtaModal } from '@/shared/ui'
import { LEVEL_FAMILIES, LEVEL_NOTICE, type BreederLevel } from '../model/levels'
const X = [0, 220, 450, 675, 910, 1145]
const Y = [0, 240, 466, 689, 914, 1124, 1374]
export function LevelIcon({ value, size = 24 }: { value: number; size?: number }) {
  if (!Number.isInteger(value) || value < 1 || value > 30) return null
  const col = (value - 1) % 5,
    row = Math.floor((value - 1) / 5)
  const x = X[col],
    y = Y[row],
    width = X[col + 1] - x,
    height = Y[row + 1] - y
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0"
      style={{
        width: size,
        height: size,
        backgroundImage: 'url(/gamification/levels-v1.png)',
        backgroundSize: `${(1145 / width) * 100}% ${(1374 / height) * 100}%`,
        backgroundPosition: `${(x / (1145 - width)) * 100}% ${(y / (1374 - height)) * 100}%`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
      }}
    />
  )
}
export function BreederLevelBadge({
  level,
  showFamily = false,
  interactive = false,
}: {
  level?: BreederLevel | null
  showFamily?: boolean
  interactive?: boolean
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  if (!level || !Number.isInteger(level.value) || level.value < 1 || level.value > 30) return null
  const name = LEVEL_FAMILIES.find((family) => family.key === level.family)?.name
  if (!name) return null
  const label = `Lv.${level.value}${showFamily ? ` ${name}` : ''}`
  const content = (
    <>
      <LevelIcon value={level.value} />
      <span>{label}</span>
    </>
  )
  const className = 'inline-flex items-center gap-1 text-xs font-semibold text-primary-700'
  if (!interactive)
    return (
      <span title={LEVEL_NOTICE} className={className}>
        {content}
      </span>
    )
  return (
    <>
      <button
        type="button"
        className={`${className} rounded focus-ring`}
        onClick={() => setOpen(true)}
        aria-label={`${label} 활동 단계 안내`}
      >
        {content}
      </button>
      <CtaModal
        open={open}
        onOpenChange={setOpen}
        title={`${label} · 포퐁 활동 단계`}
        description={LEVEL_NOTICE}
        icon={<LevelIcon value={level.value} size={96} />}
        iconBare
        actions={[
          { label: '레벨 안내 보기', onClick: () => router.push('/breeder-level') },
          { label: '닫기', intent: 'secondary', onClick: () => setOpen(false) },
        ]}
      />
    </>
  )
}
