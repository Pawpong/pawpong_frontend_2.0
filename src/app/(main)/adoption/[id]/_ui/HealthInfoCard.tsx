import { cn } from '@/shared/lib/Cn'
import { Badge } from '@/shared/ui'
import { CheckIcon } from '@/shared/assets/icons'
import type { AdoptionDetailDto } from '@/shared/types'

const CompletionBadge = ({ completed }: { completed: boolean }) => (
  <Badge
    variant="status"
    className={cn(
      'flex items-center justify-center px-[0.625rem] py-[0.25rem] text-[0.75rem] leading-[1.375rem] tab:text-[0.875rem]',
      completed ? 'bg-[#5d5d5d]' : 'bg-[#a4a4a4]',
    )}
  >
    <CheckIcon className="size-[1.25rem] tab:size-[1.5rem]" />
    <span>{completed ? '검사 완료' : '미완료'}</span>
  </Badge>
)

const HealthInfoCard = ({ detail }: { detail: AdoptionDetailDto }) => (
  <div className="overflow-hidden rounded-[1rem] bg-[#f5f5f5] p-[0.875rem] tab:flex-1 tab:p-[1.75rem]">
    <p className="text-[0.75rem] font-medium leading-[1.375rem] text-[#5d5d5d] tab:text-[1.25rem] tab:font-semibold">
      건강 정보
    </p>

    <div className="mt-[1rem] flex flex-col gap-[2.1875rem] tab:mt-[1.5rem] tab:gap-[2rem]">
      {/* 예방 접종 현황 */}
      <div className="flex flex-col gap-[0.6875rem]">
        <div className="flex items-center justify-between">
          <p className="text-[0.875rem] font-semibold leading-[1.375rem] text-[#5d5d5d]">
            예방 접종 현황
          </p>
          <CompletionBadge completed={detail.health.vaccinationCompleted} />
        </div>

        <div className="flex flex-col gap-[0.75rem] text-[0.875rem] leading-[1.375rem] text-[#5d5d5d]">
          <div className="flex items-center border-b border-[#d4d4d4] pb-px font-medium">
            <span className="min-w-0 flex-1">접종명</span>
            <div className="flex w-[10.5rem] items-center justify-end tab:w-[13.75rem]">
              <span className="min-w-0 flex-1">접종일</span>
              <span className="w-[2.85rem] text-right">차수</span>
            </div>
          </div>
          {detail.health.vaccinations.map((v, i) => (
            <div
              key={`${v.name}-${v.dose}-${i}`}
              className="flex items-center border-b border-[#d4d4d4] pb-px font-semibold"
            >
              <span className="min-w-0 flex-1">{v.name}</span>
              <div className="flex w-[10.5rem] items-center justify-end tab:w-[13.75rem]">
                <span className="min-w-0 flex-1">{v.date}</span>
                <span className="w-[2.85rem] text-right">{v.dose}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 유전병 검사 */}
      <div className="flex flex-col gap-[0.75rem]">
        <div className="flex items-center justify-between">
          <p className="text-[0.875rem] font-semibold leading-[1.375rem] text-[#5d5d5d]">
            유전병 검사
          </p>
          <CompletionBadge completed={detail.health.geneticTestCompleted} />
        </div>

        <div className="flex flex-col gap-[0.75rem] text-[0.875rem] font-medium leading-[1.375rem] text-[#5d5d5d]">
          <div className="flex items-center border-b border-[#d4d4d4] pb-px">
            <span className="min-w-0 flex-1">검진일</span>
            <span className="min-w-0 flex-1 text-right">
              {detail.health.geneticTest.date}
            </span>
          </div>
          <div className="flex items-center border-b border-[#d4d4d4] pb-px">
            <span className="min-w-0 flex-1">검사기관</span>
            <span className="min-w-0 flex-1 text-right">
              {detail.health.geneticTest.institution}
            </span>
          </div>
          {detail.health.geneticTest.results.map((r, i) => (
            <div
              key={`${r.disease}-${i}`}
              className="flex items-center border-b border-[#d4d4d4] pb-px"
            >
              <span className="min-w-0 flex-1">{i === 0 ? '결과' : ''}</span>
              <div className="flex min-w-0 flex-1 items-center text-right">
                <span className="min-w-0 flex-1">{r.disease}</span>
                <span className="min-w-0 flex-1">{r.result}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

export { HealthInfoCard }
