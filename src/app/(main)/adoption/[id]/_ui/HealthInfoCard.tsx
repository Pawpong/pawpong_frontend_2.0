import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { Badge, EmptyState } from '@/shared/ui'
import { CheckIcon } from '@/shared/assets'
import type { AdoptionDetailDto } from '@/shared/types'
import { DETAIL_TYPE } from '../_lib/detailTypography'
import { DetailSection } from './DetailSection'
import { EmptyNote } from './EmptyNote'

// 피그마 TableLayout 컨테이너
const Table = ({ children }: { children: ReactNode }) => (
  <div className={cn('flex flex-col', DETAIL_TYPE.body)}>{children}</div>
)

// 테이블 행(border, gap-8, 기본 py-8) — 헤더는 className 으로 py-4
const TableRow = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div
    className={cn(
      'flex items-center gap-[0.5rem] border-b border-neutral-300 py-[0.5rem]',
      className,
    )}
  >
    {children}
  </div>
)

/**
 * [refactored] 접종·유전병 두 블록이 "제목+배지 → 표 | 미완료 사유 | 빈 상태" 3분기를
 * 똑같이 반복하고 있었다. 분기를 여기 한 곳에 두고, 각 블록은 표만 넘긴다.
 * (사유는 데이터가 없을 때만 의미가 있어 표보다 뒤, 기본 빈 상태보다 앞에 온다)
 */
const HealthBlock = ({
  title,
  completed,
  isEmpty,
  incompleteReason,
  emptyText,
  children,
}: {
  title: string
  completed: boolean
  isEmpty: boolean
  /** 미완료 시 브리더가 직접 남긴 사유 — 있으면 기본 문구 대신 그대로 보여준다 */
  incompleteReason?: string
  emptyText: string
  children: ReactNode
}) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center justify-between gap-2">
      <p className={DETAIL_TYPE.sub}>{title}</p>
      <Badge variant={completed ? 'primaryOutline' : 'neutralFilled'} size="lg">
        {completed && <CheckIcon className="size-4" />}
        <span>{completed ? '검사 완료' : '미완료'}</span>
      </Badge>
    </div>

    {!isEmpty ? (
      <Table>{children}</Table>
    ) : incompleteReason ? (
      <EmptyNote>{incompleteReason}</EmptyNote>
    ) : (
      <EmptyState message={emptyText} size="compact" />
    )}
  </div>
)

const HealthInfoCard = ({ detail }: { detail: AdoptionDetailDto }) => (
  <DetailSection title="건강 정보" emphasis>
    <div className="flex flex-col gap-6">
      {/* 예방 접종 — 3컬럼(접종명/접종일/차수) */}
      <HealthBlock
        title="예방 접종 현황"
        completed={detail.health.vaccinationCompleted}
        isEmpty={detail.health.vaccinations.length === 0}
        incompleteReason={detail.health.vaccinationIncompleteReason}
        emptyText="등록된 접종 정보가 없어요."
      >
        <TableRow className={cn('py-[0.25rem]', DETAIL_TYPE.sub)}>
          <span className="min-w-px flex-1">접종명</span>
          <span className="min-w-px flex-1">접종일</span>
          <span className="shrink-0 whitespace-nowrap">차수</span>
        </TableRow>
        {detail.health.vaccinations.map((v, i) => (
          <TableRow key={`${v.name}-${v.dose}-${i}`}>
            <span className="min-w-px flex-1">{v.name}</span>
            <span className="min-w-px flex-1">{v.date}</span>
            <span className="shrink-0 whitespace-nowrap">{v.dose}</span>
          </TableRow>
        ))}
      </HealthBlock>

      {/* 유전병 검사 — 검진일·검사기관 뒤에 결과 행 */}
      <HealthBlock
        title="유전병 검사"
        completed={detail.health.geneticTestCompleted}
        isEmpty={detail.health.geneticTest.results.length === 0}
        incompleteReason={detail.health.geneticTestIncompleteReason}
        emptyText="등록된 유전병 검사 정보가 없어요."
      >
        <TableRow>
          <span className={cn('min-w-px flex-1', DETAIL_TYPE.sub)}>검진일</span>
          <span className="shrink-0 whitespace-nowrap">{detail.health.geneticTest.date}</span>
        </TableRow>
        <TableRow>
          <span className={cn('min-w-px flex-1', DETAIL_TYPE.sub)}>검사기관</span>
          <span className="shrink-0 whitespace-nowrap">
            {detail.health.geneticTest.institution}
          </span>
        </TableRow>
        {detail.health.geneticTest.results.map((r, i) => (
          <TableRow key={`${r.disease}-${i}`}>
            <span className={cn('min-w-px flex-1', DETAIL_TYPE.sub)}>{i === 0 ? '결과' : ''}</span>
            <span className="min-w-px flex-1">{r.disease}</span>
            <span className="shrink-0 whitespace-nowrap">{r.result}</span>
          </TableRow>
        ))}
      </HealthBlock>
    </div>
  </DetailSection>
)

export { HealthInfoCard }
