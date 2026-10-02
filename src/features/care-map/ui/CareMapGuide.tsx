import type { CarePlaceKind } from '@/entities/care-place'

export function CareMapGuide({ kind }: { kind: CarePlaceKind }) {
  return (
    <details className="rounded-2xl border border-primary-100 bg-secondary-50 px-4 py-3 text-primary-900">
      <summary className="cursor-pointer text-sm font-semibold">
        {kind === 'hospital'
          ? '1차·2차 동물병원, 어떻게 찾아야 할까요?'
          : '보호소 방문·입양 전 확인해 주세요'}
      </summary>
      <div className="mt-3 space-y-2 text-sm leading-6 text-primary-700">
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
              지도에는 카카오에 등록된 보호·입양시설이 표시돼요. 지자체 지정 보호소 전체 목록이나
              현재 보호 중인 동물 목록과는 다를 수 있어요.
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
