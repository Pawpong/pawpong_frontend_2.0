import type { ReactNode } from 'react'
import { GenderIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import { CATEGORY_LABEL, GENDER_LABEL } from '@/shared/types'
import type { AdoptionDetailDto } from '@/shared/types'
import { DETAIL_TYPE } from '../_lib/detailTypography'
import { DetailSection } from './DetailSection'

/** 라벨 ↔ 값 한 줄. 건강 정보 표와 같은 리듬으로 읽히도록 괘선을 공유한다. */
const Row = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="flex items-start justify-between gap-4 border-b border-neutral-150 py-3 last:border-0">
    <span className={cn(DETAIL_TYPE.sub, 'shrink-0')}>{label}</span>
    <span className={cn(DETAIL_TYPE.body, 'text-right')}>{value}</span>
  </div>
)

/**
 * 개체 스펙 — 히어로에서 내려온 품종·태어난 날·성별과 소개글.
 * 이 셋은 결정 정보가 아니라 확인 정보라, 이름·분양가와 같은 크기로 둘 이유가 없다.
 */
const AboutSection = ({ detail }: { detail: AdoptionDetailDto }) => (
  <DetailSection title="이 아이에 대해">
    <div className="flex flex-col">
      <Row label="품종" value={CATEGORY_LABEL[detail.category]} />
      <Row label="태어난 날" value={detail.birthDate} />
      <Row
        label="성별"
        value={
          <span className="inline-flex items-center gap-1">
            {GENDER_LABEL[detail.gender]}
            <GenderIcon gender={detail.gender} className="size-6" />
          </span>
        }
      />
    </div>

    {detail.description && (
      <div className="flex flex-col gap-2">
        <p className={DETAIL_TYPE.sub}>소개글</p>
        <p className={DETAIL_TYPE.prose}>{detail.description}</p>
      </div>
    )}
  </DetailSection>
)

export { AboutSection }
