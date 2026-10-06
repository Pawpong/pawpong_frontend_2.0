'use client'
import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCareMapConfig } from '@/entities/care-place'
import type { CommunityRoutePoint } from '@/shared/types'
import {
  loadKakaoMaps,
  type KakaoMapInstance,
  type KakaoMaps,
  type MapLatLng,
} from '../lib/kakao-map'

export function SharedRouteMap({
  points,
  onAdd,
}: {
  points: CommunityRoutePoint[]
  onAdd?: (point: CommunityRoutePoint) => void
}) {
  const config = useQuery({
    queryKey: ['care-map', 'config'],
    queryFn: ({ signal }) => getCareMapConfig(signal),
    retry: false,
    staleTime: 300000,
  })
  const container = useRef<HTMLDivElement>(null)
  const addRef = useRef(onAdd)
  const initial = useRef(points[0] ?? { latitude: 37.5665, longitude: 126.978, name: '' })
  const [view, setView] = useState<{ maps: KakaoMaps; map: KakaoMapInstance } | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    addRef.current = onAdd
  }, [onAdd])
  const key = config.data?.javascriptKey
  useEffect(() => {
    if (!key) return
    let disposed = false
    let cleanup = () => {}
    void loadKakaoMaps(key)
      .then((maps) => {
        if (disposed || !container.current) return
        const map = new maps.Map(container.current, {
          center: new maps.LatLng(initial.current.latitude, initial.current.longitude),
          level: 5,
        })
        const click = ({ latLng }: { latLng: MapLatLng }) =>
          addRef.current?.({
            name: '공개 장소',
            latitude: Number(latLng.getLat().toFixed(4)),
            longitude: Number(latLng.getLng().toFixed(4)),
          })
        maps.event.addListener(map, 'click', click)
        const observer = new ResizeObserver(() => map.relayout())
        observer.observe(container.current)
        cleanup = () => {
          observer.disconnect()
          maps.event.removeListener(map, 'click', click)
        }
        setView({ maps, map })
      })
      .catch(() => {
        if (!disposed) setError(true)
      })
    return () => {
      disposed = true
      cleanup()
    }
  }, [key])
  useEffect(() => {
    if (!view) return
    const { maps, map } = view
    const path = points.map((point) => new maps.LatLng(point.latitude, point.longitude))
    const overlays = points.map((point, index) => {
      const label = document.createElement('span')
      label.textContent = String(index + 1)
      label.title = point.name
      label.className =
        'rounded-full border-2 border-white bg-emerald-700 px-2 py-1 text-xs font-bold text-white shadow'
      return new maps.CustomOverlay({
        map,
        position: path[index],
        content: label,
        clickable: false,
        yAnchor: 1,
        zIndex: 2,
      })
    })
    const line =
      path.length > 1
        ? new maps.Polyline({
            map,
            path,
            strokeWeight: 4,
            strokeColor: '#29815b',
            strokeOpacity: 0.8,
            strokeStyle: 'solid',
          })
        : null
    if (!onAdd && path.length) {
      const bounds = new maps.LatLngBounds()
      path.forEach((position) => bounds.extend(position))
      map.setBounds(bounds)
      if (path.length === 1) map.setLevel(5)
    }
    return () => {
      overlays.forEach((overlay) => overlay.setMap(null))
      line?.setMap(null)
    }
  }, [points, view, onAdd])
  const unavailable = error || config.isError || (config.isFetched && !key)
  return (
    <div className="relative h-64 overflow-hidden rounded-xl border border-primary-200">
      <div ref={container} className="absolute inset-0" aria-label="공유 장소 지도" />
      {(!view || unavailable) && (
        <div
          role="status"
          className="absolute inset-0 flex items-center justify-center bg-point-50 p-4 text-center text-sm"
        >
          {unavailable
            ? '지도를 불러오지 못했어요. 장소 목록과 사진은 계속 볼 수 있어요.'
            : '공유할 지도를 펼치고 있어요.'}
        </div>
      )}
    </div>
  )
}
