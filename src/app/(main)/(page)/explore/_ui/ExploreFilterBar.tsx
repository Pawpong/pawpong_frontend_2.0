'use client'

import { useDistrictOptions } from '@/entities/district'
import { Dropdown } from '@/shared/ui'
import type { AdoptionSortType } from '@/shared/types'
import { ALL_REGIONS, SORT_OPTIONS, STATUS_OPTIONS } from '../_lib/constants'
import type { ExploreStatus } from '../_lib/constants'
import type { ExploreQuery } from '../_lib/useExploreQuery'

interface ExploreFilterBarProps {
  query: ExploreQuery
  onChange: (patch: Partial<ExploreQuery>) => void
}

// 탐색 2차 필터 (Option 3) — 드롭다운 칩. 1차 분류(원형 카테고리)보다 가볍게 테두리 칩으로 둔다.
// 상태는 행을 지우고 정렬은 순서만 바꾸므로 한 그룹에 섞지 않고 칩을 나눈다.
// '전체'는 칩 이름(분양 상태·지역)으로 보여 아무것도 고르지 않은 상태가 곧 전체임을 알린다.
const ExploreFilterBar = ({ query, onChange }: ExploreFilterBarProps) => {
  const isBreeder = query.type === 'breeder'
  // 지역은 브리더 탐색만 거를 수 있다 (입양 목록 API 에 지역 조건이 없다)
  const { cityOptions } = useDistrictOptions('', isBreeder)

  return (
    <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 py-[0.4375rem]">
      <Dropdown
        appearance="chip"
        ariaLabel="분양 상태"
        placeholder="분양 상태"
        options={[...STATUS_OPTIONS[query.type]]}
        // Radix Select 는 빈 값이면 placeholder 를 보여 준다
        value={query.status === 'all' ? '' : query.status}
        onValueChange={(status) => onChange({ status: status as ExploreStatus })}
        active={query.status !== 'all'}
      />
      <Dropdown
        appearance="chip"
        ariaLabel="정렬"
        options={[...SORT_OPTIONS]}
        value={query.sort}
        onValueChange={(sort) => onChange({ sort: sort as AdoptionSortType })}
        active={query.sort !== 'popular'}
      />
      {isBreeder && (
        <Dropdown
          appearance="chip"
          ariaLabel="지역"
          placeholder="지역"
          options={[{ value: ALL_REGIONS, label: '전체' }, ...cityOptions]}
          value={query.region === ALL_REGIONS ? '' : query.region}
          onValueChange={(region) => onChange({ region })}
          active={query.region !== ALL_REGIONS}
        />
      )}
    </div>
  )
}

export { ExploreFilterBar }
