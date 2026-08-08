import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { Badge } from '@/shared/ui'
import { CheckIcon } from '@/shared/assets/icons'
import type { AdoptionDetailDto } from '@/shared/types'
import { BaseInfoCard } from './BaseInfoCard'
import { EmptyNote } from './EmptyNote'

const CompletionBadge = ({ completed }: { completed: boolean }) => (
  <Badge variant={completed ? 'primaryOutline' : 'neutralFilled'} size="lg">
    {completed && <CheckIcon className="size-4" />}
    <span>{completed ? '검사 완료' : '미완료'}</span>
  </Badge>
)

// [refactored] 섹션 헤더(제목 + 검사완료 배지) — 2회 반복 제거
const SectionHeader = ({ title, completed }: { title: string; completed: boolean }) => (
  <div className="flex items-center justify-between">
    <p className="text-[0.875rem] leading-[1.375rem] font-semibold text-neutral-700 pc:text-[1rem] pc:leading-[1.5]">
      {title}
    </p>
    <CompletionBadge completed={completed} />
  </div>
)

// [refactored] 피그마 TableLayout 컨테이너 — 반복 className 제거
const Table = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col text-[0.875rem] leading-[1.375rem] font-semibold pc:text-[1rem] pc:leading-[1.5]">
    {children}
  </div>
)

// [refactored] 테이블 행(border #cacaca, gap-8, 기본 py-8) — 7회 반복 제거 (헤더는 className으로 py-4)
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

const HealthInfoCard = ({ detail }: { detail: AdoptionDetailDto }) => (
  <BaseInfoCard title="건강 정보" className="pc:col-start-1 pc:row-start-1">
    <div className="flex flex-col gap-[2.1875rem] pc:gap-[1.25rem]">
      {/* 예방 접종 현황 */}
      <div className="flex flex-col gap-[0.6875rem]">
        {/* [refactored] SectionHeader 사용 */}
        <SectionHeader title="예방 접종 현황" completed={detail.health.vaccinationCompleted} />

        {/* [refactored] Table/TableRow 사용 (3컬럼: 접종명/접종일/차수) */}
        {detail.health.vaccinations.length > 0 ? (
          <Table>
            <TableRow className="py-[0.25rem] font-medium text-neutral-700">
              <span className="min-w-px flex-1">접종명</span>
              <span className="min-w-px flex-1">접종일</span>
              <span className="shrink-0 whitespace-nowrap">차수</span>
            </TableRow>
            {detail.health.vaccinations.map((v, i) => (
              <TableRow key={`${v.name}-${v.dose}-${i}`} className="text-neutral-850">
                <span className="min-w-px flex-1">{v.name}</span>
                <span className="min-w-px flex-1">{v.date}</span>
                <span className="shrink-0 whitespace-nowrap">{v.dose}</span>
              </TableRow>
            ))}
          </Table>
        ) : (
          // 미완료 사유가 있으면 그대로 노출 (분양글 작성 시 브리더가 입력)
          <EmptyNote>
            {detail.health.vaccinationIncompleteReason || '등록된 접종 정보가 없어요.'}
          </EmptyNote>
        )}
      </div>

      {/* 유전병 검사 */}
      <div className="flex flex-col gap-[0.75rem]">
        {/* [refactored] SectionHeader 사용 */}
        <SectionHeader title="유전병 검사" completed={detail.health.geneticTestCompleted} />

        {/* [refactored] Table/TableRow 사용 (접종일 컬럼 없음) */}
        {detail.health.geneticTest.results.length > 0 ? (
          <Table>
            <TableRow>
              <span className="min-w-px flex-1 text-neutral-700">검진일</span>
              <span className="shrink-0 whitespace-nowrap text-neutral-850">
                {detail.health.geneticTest.date}
              </span>
            </TableRow>
            <TableRow>
              <span className="min-w-px flex-1 text-neutral-700">검사기관</span>
              <span className="shrink-0 whitespace-nowrap text-neutral-850">
                {detail.health.geneticTest.institution}
              </span>
            </TableRow>
            {detail.health.geneticTest.results.map((r, i) => (
              <TableRow key={`${r.disease}-${i}`}>
                <span className="min-w-px flex-1 text-neutral-700">{i === 0 ? '결과' : ''}</span>
                <span className="min-w-px flex-1 text-neutral-850">{r.disease}</span>
                <span className="shrink-0 whitespace-nowrap text-neutral-850">{r.result}</span>
              </TableRow>
            ))}
          </Table>
        ) : (
          <EmptyNote>
            {detail.health.geneticTestIncompleteReason || '등록된 유전병 검사 정보가 없어요.'}
          </EmptyNote>
        )}
      </div>
    </div>
  </BaseInfoCard>
)

export { HealthInfoCard }
