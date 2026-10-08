'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CtaModal } from '@/shared/ui'
import { LEVEL_FAMILIES, LEVEL_NOTICE, type BreederLevel } from '../model/levels'
const ATLAS = { url: '/gamification/levels-v1.png', width: 1145, height: 1374 }
// 아틀라스 칸(220×240 등)은 정사각형이 아니고 그림이 칸 아래쪽에 치우쳐 있다. 칸을 통째로 쓰면
// 아래로 처지고 옆으로 늘어나서, 레벨별 실제 그림 영역 [x, y, w, h] 만 잘라 쓴다 (알파 기준 실측).
const LEVEL_BOXES = [
  [59, 107, 127, 122],
  [271, 77, 149, 162],
  [467, 76, 195, 163],
  [687, 76, 212, 163],
  [922, 35, 199, 204],
  [52, 307, 142, 142],
  [266, 283, 159, 179],
  [459, 283, 212, 181],
  [675, 282, 227, 182],
  [919, 249, 204, 215],
  [54, 536, 137, 147],
  [269, 508, 153, 176],
  [461, 504, 206, 184],
  [683, 507, 213, 181],
  [922, 470, 199, 212],
  [43, 772, 159, 133],
  [260, 731, 172, 178],
  [456, 730, 219, 182],
  [684, 731, 213, 181],
  [914, 692, 217, 220],
  [51, 976, 141, 137],
  [266, 944, 156, 175],
  [463, 949, 201, 170],
  [682, 949, 217, 170],
  [918, 922, 207, 202],
  [51, 1206, 144, 127],
  [269, 1151, 151, 187],
  [464, 1149, 200, 189],
  [680, 1149, 220, 190],
  [918, 1126, 207, 215],
] as const
// 단계가 오를수록 장식이 붙어 그림이 커지는 디자인이라, 가장 큰 그림 기준 하나의 배율로 그려 크기 차이를 지킨다.
const LARGEST = 227

export function LevelIcon({ value, size = 24 }: { value: number; size?: number }) {
  if (!Number.isInteger(value) || value < 1 || value > 30) return null
  const [x, y, width, height] = LEVEL_BOXES[value - 1]
  const scale = size / LARGEST
  // 그림 크기 그대로 그린다. 세로 가운데는 감싸는 줄(items-center)이 맞추고 옆 글자와 간격도 일정하다
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0"
      style={{
        width: width * scale,
        height: height * scale,
        backgroundImage: `url(${ATLAS.url})`,
        backgroundSize: `${ATLAS.width * scale}px ${ATLAS.height * scale}px`,
        backgroundPosition: `${-x * scale}px ${-y * scale}px`,
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
  iconOnly = false,
}: {
  level?: BreederLevel | null
  showFamily?: boolean
  interactive?: boolean
  /** 배지 그림만 보인다. 'Lv.n' 문구는 화면 낭독기용으로만 남는다 */
  iconOnly?: boolean
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  if (!level || !Number.isInteger(level.value) || level.value < 1 || level.value > 30) return null
  const name = LEVEL_FAMILIES.find((family) => family.key === level.family)?.name
  if (!name) return null
  const label = `Lv.${level.value}${showFamily ? ` ${name}` : ''}`
  const content = (
    <>
      {/* 그림만 보일 때는 글자 대신 그림이 뜻을 전하므로 크게 그린다 (아틀라스 칸에 여백이 있다) */}
      <LevelIcon value={level.value} size={iconOnly ? 38 : 24} />
      <span className={iconOnly ? 'sr-only' : undefined}>{label}</span>
    </>
  )
  // 이름 옆에 붙으므로 긴 이름 옆에서도 줄어들거나 줄바꿈되지 않는다
  const className =
    'inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-semibold text-primary-700'
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
          { label: '레벨 안내 보기', onClick: () => router.push('/level') },
          { label: '닫기', intent: 'secondary', onClick: () => setOpen(false) },
        ]}
      />
    </>
  )
}
