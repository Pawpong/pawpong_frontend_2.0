'use client'

import { useState } from 'react'
import { InfoIcon } from '@/shared/assets/icons'
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'

const AddRowButton = ({ label }: { label: string }) => (
  <button
    type="button"
    className="mx-auto h-7 rounded-[0.375rem] bg-[#a8a8a8] px-[0.625rem] text-sm font-medium text-white tab:h-auto tab:w-[28.75rem] tab:rounded-full tab:p-[0.625rem] tab:text-sm"
  >
    {label}
  </button>
)

const HealthInfoSection = () => {
  const [vaccinationStatus, setVaccinationStatus] = useState<string>('')
  const [geneticTestStatus, setGeneticTestStatus] = useState<string>('')
  const [geneticTestResult, setGeneticTestResult] = useState<string>('')

  const isVaccinationIncomplete = vaccinationStatus === 'in-progress' || vaccinationStatus === 'not-started'

  return (
    <div className="flex flex-col gap-[0.921rem] rounded-2xl bg-[#f5f5f5] p-3.5 tab:gap-[2.188rem] tab:p-[1.875rem]">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium leading-[1.375rem] text-text-primary tab:text-xl tab:font-semibold">
          건강 정보
        </span>
        <span className="text-xs font-medium leading-[1.375rem] text-text-primary tab:text-base tab:leading-[1.5]">
          필수
        </span>
        <InfoIcon className="size-4 text-text-primary" />
      </div>

      {/* 예방 접종 현황 */}
      <div className="flex flex-col gap-3 tab:gap-3">
        <p className="text-sm font-semibold leading-[1.375rem] text-text-primary tab:px-0 tab:text-base">
          예방 접종 현황
        </p>
        <div className="flex flex-col gap-1.5">
          <Select value={vaccinationStatus} onValueChange={setVaccinationStatus}>
            <SelectTrigger>
              <SelectValue placeholder="접종완료" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completed">접종 완료</SelectItem>
              <SelectItem value="in-progress">접종 중</SelectItem>
              <SelectItem value="not-started">미접종</SelectItem>
            </SelectContent>
          </Select>
          {isVaccinationIncomplete ? (
            <Input placeholder="미완료한 이유작성 (예: 태어난지 한달도 안됨)" />
          ) : (
            <>
              <div className="flex gap-1">
                <Input placeholder="접종명" className="flex-1" />
                <Input placeholder="접종일" className="flex-1" />
                <Select>
                  <SelectTrigger className="w-16 tab:w-[4.5rem]">
                    <SelectValue placeholder="차수" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        {i + 1}차
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <AddRowButton label="작성란 추가하기" />
            </>
          )}
        </div>
      </div>

      {/* 유전병 검사 */}
      <div className="flex flex-col gap-3 tab:gap-3">
        <p className="text-sm font-semibold leading-[1.375rem] text-text-primary tab:px-0 tab:text-base">
          유전병 검사
        </p>
        <div className="flex flex-col gap-1.5">
          <Select value={geneticTestStatus} onValueChange={setGeneticTestStatus}>
            <SelectTrigger>
              <SelectValue placeholder="검사완료" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completed">검사 완료</SelectItem>
              <SelectItem value="incomplete">검사 미완료</SelectItem>
              <SelectItem value="not-tested">미검사</SelectItem>
            </SelectContent>
          </Select>
          {geneticTestStatus === 'not-tested' ? (
            <Input placeholder="미완료한 이유작성 (예: 태어난지 한달도 안됨)" />
          ) : geneticTestStatus === 'incomplete' ? (
            <Input placeholder="미완료한 이유작성 (예: 태어난지 한달도 안됨)" />
          ) : (
            <>
              <Input placeholder="검진날짜" />
              <Input placeholder="검사 기관" />
              <div className="flex gap-1.5">
                <Select value={geneticTestResult} onValueChange={setGeneticTestResult}>
                  <SelectTrigger className={geneticTestResult === 'abnormal' ? 'w-24 shrink-0' : ''}>
                    <SelectValue placeholder="검사결과" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">정상</SelectItem>
                    <SelectItem value="abnormal">비정상</SelectItem>
                  </SelectContent>
                </Select>
                {geneticTestResult === 'abnormal' && (
                  <Input placeholder="병명" className="flex-1" />
                )}
              </div>
              <AddRowButton label="작성란 추가하기" />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export { HealthInfoSection }
