'use client'

import { useEffect, useRef, useState } from 'react'
import type { CareCoordinates, CarePlace } from '@/entities/care-place'
import { loadKakaoMaps, type KakaoMapInstance, type KakaoMaps } from '../lib/kakao-map'

interface Props {
  javascriptKey: string
  places: CarePlace[]
  selectedId: string | null
  centerRequest: CareCoordinates | null
  onSelect(id: string): void
  onCenterChange(center: CareCoordinates): void
}

const INITIAL_CENTER = { latitude: 37.5665, longitude: 126.978 }

function fitPlaces(maps: KakaoMaps, map: KakaoMapInstance, places: CarePlace[]) {
  const bounds = new maps.LatLngBounds()
  places.forEach((place) => bounds.extend(new maps.LatLng(place.latitude, place.longitude)))
  map.setBounds(bounds, 65, 45, 80, 45)
  if (places.length === 1) map.setLevel(5)
}

export default function KakaoMapCanvas({
  javascriptKey,
  places,
  selectedId,
  centerRequest,
  onSelect,
  onCenterChange,
}: Props) {
  const element = useRef<HTMLDivElement>(null)
  const mapRef = useRef<KakaoMapInstance | null>(null)
  const sdkRef = useRef<KakaoMaps | null>(null)
  const selectRef = useRef(onSelect)
  const centerRef = useRef(onCenterChange)
  const viewRef = useRef({ places, selectedId })
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    selectRef.current = onSelect
    centerRef.current = onCenterChange
    viewRef.current = { places, selectedId }
  }, [onSelect, onCenterChange, places, selectedId])

  useEffect(() => {
    let disposed = false
    let cleanup = () => {}
    void loadKakaoMaps(javascriptKey)
      .then((maps) => {
        if (disposed || !element.current) return
        sdkRef.current = maps
        const map = new maps.Map(element.current, {
          center: new maps.LatLng(INITIAL_CENTER.latitude, INITIAL_CENTER.longitude),
          level: 7,
        })
        mapRef.current = map
        let lastCenter = map.getCenter()
        const updateCenter = () => {
          const center = map.getCenter()
          lastCenter = center
          centerRef.current({ latitude: center.getLat(), longitude: center.getLng() })
        }
        maps.event.addListener(map, 'idle', updateCenter)
        const relayout = () => {
          map.relayout()
          // SDK가 크기 변경 중 계산한 중심 대신 선택/검색 좌표로 다시 맞춘다.
          // 화면 회전/반응형 전환 시 이전 컨테이너의 픽셀 좌표를 재사용하지 않는다.
          const current = viewRef.current
          const selected = current.places.find((place) => place.id === current.selectedId)
          if (selected) map.setCenter(new maps.LatLng(selected.latitude, selected.longitude))
          else if (current.places.length) fitPlaces(maps, map, current.places)
          else map.setCenter(lastCenter)
        }
        const observer = new ResizeObserver(relayout)
        observer.observe(element.current)
        window.addEventListener('resize', relayout)
        cleanup = () => {
          observer.disconnect()
          window.removeEventListener('resize', relayout)
          maps.event.removeListener(map, 'idle', updateCenter)
        }
        setReady(true)
      })
      .catch(() => {
        if (!disposed) setError(true)
      })
    return () => {
      disposed = true
      cleanup()
      mapRef.current = null
      sdkRef.current = null
    }
  }, [javascriptKey, attempt])

  useEffect(() => {
    const map = mapRef.current,
      maps = sdkRef.current
    if (!ready || !map || !maps) return
    const overlays = places.map((place, index) => {
      const marker = document.createElement('button')
      marker.type = 'button'
      marker.textContent = String(index + 1)
      marker.title = place.name
      marker.setAttribute('aria-label', `${place.name} 선택`)
      marker.setAttribute('aria-pressed', String(place.id === selectedId))
      marker.className = `care-map-marker ${place.kind === 'shelter' ? 'care-map-marker-shelter' : ''} ${place.id === selectedId ? 'care-map-marker-selected' : ''}`
      marker.onclick = () => selectRef.current(place.id)
      return new maps.CustomOverlay({
        position: new maps.LatLng(place.latitude, place.longitude),
        content: marker,
        map,
        clickable: true,
        yAnchor: 1,
        zIndex: place.id === selectedId ? 5 : 2,
      })
    })
    return () => overlays.forEach((overlay) => overlay.setMap(null))
  }, [places, selectedId, ready])

  useEffect(() => {
    const map = mapRef.current,
      maps = sdkRef.current
    if (!ready || !map || !maps || places.length === 0) return
    fitPlaces(maps, map, places)
  }, [places, ready])

  useEffect(() => {
    const map = mapRef.current,
      maps = sdkRef.current
    if (ready && map && maps && centerRequest) {
      map.setCenter(new maps.LatLng(centerRequest.latitude, centerRequest.longitude))
      map.setLevel(7)
    }
  }, [centerRequest, ready])

  useEffect(() => {
    const map = mapRef.current,
      maps = sdkRef.current
    const place = places.find((item) => item.id === selectedId)
    if (ready && map && maps && place)
      map.setCenter(new maps.LatLng(place.latitude, place.longitude))
  }, [selectedId, places, ready])

  return (
    <>
      <div
        ref={element}
        className="absolute inset-0"
        aria-label="동물병원과 보호시설 카카오 지도"
      />
      {ready && (
        <div
          className="absolute right-4 bottom-20 z-20 flex flex-col overflow-hidden rounded-xl border border-secondary-200 bg-white shadow-sm"
          role="group"
          aria-label="지도 확대 축소"
        >
          <button
            type="button"
            aria-label="지도 확대"
            className="size-10 text-xl font-semibold text-primary-700 hover:bg-point-50"
            onClick={() => {
              const map = mapRef.current
              if (map) map.setLevel(Math.max(1, map.getLevel() - 1))
            }}
          >
            +
          </button>
          <button
            type="button"
            aria-label="지도 축소"
            className="size-10 border-t border-secondary-200 text-xl font-semibold text-primary-700 hover:bg-point-50"
            onClick={() => {
              const map = mapRef.current
              if (map) map.setLevel(Math.min(14, map.getLevel() + 1))
            }}
          >
            −
          </button>
        </div>
      )}
      {!ready && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-secondary-50 px-6 text-center text-primary-700"
          role="status"
        >
          {error ? (
            <>
              <p>지도를 불러오지 못했어요.</p>
              <p className="text-sm">시설 목록은 아래에서 계속 확인할 수 있어요.</p>
              <button
                type="button"
                className="care-map-button"
                onClick={() => {
                  setError(false)
                  setAttempt((value) => value + 1)
                }}
              >
                지도 다시 시도
              </button>
            </>
          ) : (
            <p className="animate-pulse">우리 동네 지도를 펼치는 중이에요…</p>
          )}
        </div>
      )}
    </>
  )
}
