import type { CarePlaceKind } from '@/entities/care-place'

export function CareMapGuide({ kind }: { kind: CarePlaceKind }) {
  if (kind === 'cafe')
    return (
      <details className="rounded-2xl border border-secondary-200 bg-point-50 px-4 py-3 text-neutral-850">
        <summary className="cursor-pointer text-sm font-semibold">
          애견동반카페, 방문 전 확인해 주세요
        </summary>
        <div className="mt-3 space-y-2 text-sm leading-6 text-neutral-700">
          <p>
            카카오맵에 ‘애견카페’로 분류된 곳과 한국문화정보원 공공데이터의 반려동물 동반 가능
            카페를 함께 보여드려요. 공공데이터는 대부분 2022년 작성 자료라 지금은 다를 수 있고,
            포퐁이 실제 동반 가능 여부를 확인한 목록은 아니에요.
          </p>
          <p>
            동반 가능한 크기·견종, 실내 동반 여부, 리드줄·매너벨트 같은 조건은 매장마다 달라요. 방문
            전 전화로 확인해 주세요.
          </p>
        </div>
      </details>
    )
  if (kind === 'travel' || kind === 'stay')
    return (
      <details className="rounded-2xl border border-secondary-200 bg-point-50 px-4 py-3 text-neutral-850">
        <summary className="cursor-pointer text-sm font-semibold">
          반려동물과 떠나기 전 확인해 주세요
        </summary>
        <div className="mt-3 space-y-2 text-sm leading-6 text-neutral-700">
          <p>
            한국관광공사 반려동물 동반여행 서비스에 등록된 {kind === 'stay' ? '숙소' : '여행지'}
            예요. 장소를 누르면 동반 유형(전 구역·일부 구역), 동반 가능한 크기, 목줄·입마개 같은
            필수 사항을 볼 수 있어요.
          </p>
          <p>
            일부 구역만 동반 가능한 곳이 많고 조건은 바뀔 수 있어요.
            {kind === 'stay' ? ' 객실 동반 여부와 추가 요금은 예약 전에' : ' 방문 전'} 꼭 확인해
            주세요.
          </p>
        </div>
      </details>
    )
  return (
    <details className="rounded-2xl border border-secondary-200 bg-point-50 px-4 py-3 text-neutral-850">
      <summary className="cursor-pointer text-sm font-semibold">
        {kind === 'hospital'
          ? '1차·2차 동물병원, 어떻게 찾아야 할까요?'
          : '보호소 방문·입양 전 확인해 주세요'}
      </summary>
      <div className="mt-3 space-y-2 text-sm leading-6 text-neutral-700">
        {kind === 'hospital' ? (
          <>
            <p>
              <strong>가까운 병원에서 먼저 상담해요.</strong> 예방접종·건강검진·일반 진료는
              일상적으로 방문하는 병원에서 상담하고, 정밀 검사나 전문 진료가 필요하면 진료 의뢰
              여부를 물어보세요.
            </p>
            <p>
              <strong>2차·의뢰 진료는 병원 안내를 확인해요.</strong> 포퐁은 공식 진료의뢰 안내를
              확인한 일부 병원에만 표시합니다. 병원 규모·이름으로 등급을 정하지 않으며, 표시가 없는
              병원을 1차로 단정하지 않아요.
            </p>
            <p>
              병원별 진료과목과 예약·의뢰서 필요 여부가 달라요. 응급 상황에는 방문 전 수용 가능
              여부를 전화로 확인해 주세요.
            </p>
          </>
        ) : (
          <>
            <p>
              전국 목록은 국가동물보호정보시스템의 보호센터 등록자료예요. 병원이나 협회가 맡은 지정
              보호센터도 포함하며, 여러 지자체가 함께 이용하는 센터는 한 곳으로 보여드려요.
            </p>
            <p>
              ‘내 주변’은 카카오 장소 검색 결과예요. 등록자료의 확인일과 실제 운영 상황은 다를 수
              있어요.
            </p>
            <p>방문 예약, 입양 절차, 봉사 가능 여부는 시설에 먼저 연락해 주세요.</p>
            <a
              href="https://www.animal.go.kr/front/awtis/protection/protectionList.do?menuNo=1000000060"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-semibold underline underline-offset-4"
            >
              국가동물보호정보시스템에서 보호동물 확인 ↗
            </a>
          </>
        )}
      </div>
    </details>
  )
}
