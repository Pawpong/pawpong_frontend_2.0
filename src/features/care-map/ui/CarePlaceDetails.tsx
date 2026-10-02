import type { CarePlace } from '@/entities/care-place'
import { CareMapIcon } from './CareMapIcon'

export function CarePlaceDetails({ place, onClose }: { place: CarePlace; onClose(): void }) {
  return (
    <section
      aria-label={`${place.name} 상세 정보`}
      className="rounded-2xl border border-primary-100 bg-white p-5 shadow-sm"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1 text-xs font-semibold text-primary-500">
            {place.kind === 'hospital' ? '동물병원' : '보호·입양시설'}
          </p>
          <h2 className="text-lg font-bold break-keep text-primary-900">{place.name}</h2>
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
      <p className="text-sm leading-6 text-gray-700">{place.roadAddress || place.address}</p>
      <p className="mt-1 text-sm text-gray-600">{place.phone || '등록된 전화번호가 없어요'}</p>
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
          <span className="ml-2 text-gray-600">{place.referral.checkedAt} 확인</span>
        </div>
      )}
      {!place.referral && place.kind === 'hospital' && (
        <p className="mt-3 text-xs leading-5 text-gray-600">
          진료 단계·진료과목·진료 시간은 방문 전에 병원에 확인해 주세요.
        </p>
      )}
      {place.kind === 'shelter' && (
        <p className="mt-3 text-xs leading-5 text-gray-600">
          방문·입양 상담 가능 시간과 지자체 지정 여부를 시설에 먼저 확인해 주세요.
        </p>
      )}
      <div className="mt-4 flex gap-2">
        {place.phone && (
          <a href={`tel:${place.phone.replace(/[^\d+]/g, '')}`} className="care-map-button flex-1">
            <CareMapIcon name="phone" className="size-4" />
            전화
          </a>
        )}
        <a
          href={place.directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="care-map-button care-map-button-primary flex-1"
        >
          <CareMapIcon name="arrow" className="size-4" />
          길찾기
        </a>
      </div>
      <a
        href={place.placeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block py-1 text-center text-xs text-gray-600 underline underline-offset-4"
      >
        카카오맵에서 상세 정보 보기 ↗
      </a>
    </section>
  )
}
