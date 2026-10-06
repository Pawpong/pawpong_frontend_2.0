import type { CarePlace } from '@/entities/care-place'
import { CareMapIcon } from './CareMapIcon'
import { CareDirectionsDialog } from './CareDirectionsDialog'

export function CarePlaceDetails({ place, onClose }: { place: CarePlace; onClose(): void }) {
  return (
    <section
      aria-label={`${place.name} 상세 정보`}
      className="rounded-2xl border border-secondary-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1 text-xs font-semibold text-primary-500">
            {place.kind === 'hospital'
              ? '동물병원'
              : place.kind === 'cafe'
                ? '애견동반카페'
                : place.kind === 'shelter'
                  ? place.registration
                    ? '등록 동물보호센터'
                    : '보호·입양시설'
                  : place.category}
          </p>
          <h2 className="text-lg font-bold break-keep text-neutral-850">{place.name}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="care-map-icon-button shrink-0"
          aria-label="시설 상세 닫기"
        >
          <CareMapIcon name="close" />
        </button>
      </div>
      <p className="text-sm leading-6 text-neutral-850">
        {place.roadAddress || place.address || '공식 등록 주소 미제공'}
      </p>
      {place.locationStatus === 'address' && (
        <p className="mt-1 text-xs text-neutral-700">
          등록 주소의 위치예요. 방문할 입구는 시설에 확인해 주세요.
        </p>
      )}
      {place.latitude === null && (
        <p className="mt-2 text-xs leading-5 text-primary-700">
          정확한 지도 위치를 확인하지 못했어요. 전화로 주소를 확인하거나 카카오맵에서 찾아보세요.
        </p>
      )}
      <p className="mt-1 text-sm text-neutral-700">{place.phone || '등록된 전화번호가 없어요'}</p>
      {place.referral && (
        <div className="mt-3 rounded-xl bg-secondary-50 p-3 text-xs leading-5 text-primary-700">
          <p className="font-bold">2차·의뢰 진료 안내 확인</p>
          <p>진료과목과 의뢰서·예약 필요 여부는 병원에 먼저 확인해 주세요.</p>
          <a
            href={place.referral.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block underline underline-offset-4"
          >
            병원 공식 안내 ↗
          </a>
          <span className="ml-2 text-neutral-700">{place.referral.checkedAt} 확인</span>
        </div>
      )}
      {!place.referral && place.kind === 'hospital' && (
        <p className="mt-3 text-xs leading-5 text-neutral-700">
          진료 단계·진료과목·진료 시간은 방문 전에 병원에 확인해 주세요.
        </p>
      )}
      {place.kind === 'shelter' && (
        <p className="mt-3 text-xs leading-5 text-neutral-700">
          방문 예약과 보호 중인 동물의 입양 상담은 센터에 먼저 연락해 주세요.
        </p>
      )}
      {place.petPolicy && (
        <div className="mt-3 rounded-xl bg-secondary-50 p-3 text-xs leading-5 text-primary-700">
          <p className="font-bold">반려동물 동반 조건</p>
          <dl className="mt-1 space-y-1">
            {place.petPolicy.details.map((detail) => (
              <div key={detail.label} className="flex gap-2">
                <dt className="shrink-0 font-semibold">{detail.label}</dt>
                <dd className="min-w-0 whitespace-pre-line">{detail.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-1 text-neutral-700">
            {place.petPolicy.source} {place.petPolicy.checkedAt} 기준 자료라 지금과 다를 수 있어요.
          </p>
        </div>
      )}
      {place.kind !== 'hospital' && place.kind !== 'shelter' && (
        <p className="mt-3 text-xs leading-5 text-neutral-700">
          반려동물 동반 가능 여부와 조건은 방문 전에 꼭 확인해 주세요.
        </p>
      )}
      {!!place.registration?.jurisdictions.length && (
        <p className="mt-2 text-xs leading-5 text-neutral-700">
          관할: {place.registration.jurisdictions.join(' · ')}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        {place.phone && (
          <a href={`tel:${place.phone.replace(/[^\d+]/g, '')}`} className="care-map-button flex-1">
            <CareMapIcon name="phone" className="size-4" />
            전화
          </a>
        )}
        <CareDirectionsDialog key={place.id} place={place} />
      </div>
      <a
        href={place.placeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block py-1 text-center text-xs text-neutral-700 underline underline-offset-4"
      >
        {place.latitude === null ? '카카오맵에서 시설 검색 ↗' : '카카오맵에서 상세 정보 보기 ↗'}
      </a>
      {place.kind === 'shelter' && (
        <a
          href="https://www.animal.go.kr/front/awtis/protection/protectionList.do?menuNo=1000000060"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-center text-xs text-primary-700 underline underline-offset-4"
        >
          공식 보호동물 공고 보기 ↗
        </a>
      )}
      {place.registration && (
        <p className="mt-3 text-[11px] text-neutral-700">
          <a
            href={place.registration.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            {place.registration.source}
          </a>{' '}
          · {place.registration.checkedAt} 등록자료 확인
        </p>
      )}
    </section>
  )
}
