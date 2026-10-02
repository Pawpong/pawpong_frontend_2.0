// 공유 SDK(window.Kakao)와 지도 SDK(window.kakao)는 별개의 SDK다.
export interface MapLatLng {
  getLat(): number
  getLng(): number
}

interface MapBounds {
  extend(position: MapLatLng): void
}

export interface KakaoMapInstance {
  getCenter(): MapLatLng
  getLevel(): number
  setCenter(position: MapLatLng): void
  setLevel(level: number): void
  panTo(position: MapLatLng): void
  setBounds(bounds: MapBounds, top?: number, right?: number, bottom?: number, left?: number): void
  relayout(): void
}

export interface KakaoMaps {
  load(callback: () => void): void
  Map: new (
    container: HTMLElement,
    options: { center: MapLatLng; level: number },
  ) => KakaoMapInstance
  LatLng: new (latitude: number, longitude: number) => MapLatLng
  LatLngBounds: new () => MapBounds
  CustomOverlay: new (options: {
    position: MapLatLng
    content: HTMLElement
    map: KakaoMapInstance
    clickable: boolean
    yAnchor: number
    zIndex: number
  }) => { setMap(map: KakaoMapInstance | null): void }
  event: {
    addListener(target: KakaoMapInstance, event: string, callback: () => void): void
    removeListener(target: KakaoMapInstance, event: string, callback: () => void): void
  }
}

declare global {
  interface Window {
    kakao?: { maps: KakaoMaps }
  }
}

let sdkPromise: Promise<KakaoMaps> | null = null

/** 지도 화면에서만 SDK를 로드한다. 실패/시간 초과 후에는 새 요청으로 다시 시도할 수 있다. */
export function loadKakaoMaps(javascriptKey: string): Promise<KakaoMaps> {
  if (window.kakao?.maps?.Map) return Promise.resolve(window.kakao.maps)
  if (sdkPromise) return sdkPromise
  sdkPromise = new Promise<KakaoMaps>((resolve, reject) => {
    const script = document.createElement('script')
    const fail = () => {
      window.clearTimeout(timeout)
      script.remove()
      sdkPromise = null
      reject(new Error('지도를 불러오지 못했어요. 네트워크를 확인하고 다시 시도해 주세요.'))
    }
    const timeout = window.setTimeout(fail, 12000)
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(javascriptKey)}&autoload=false`
    script.async = true
    script.onerror = fail
    script.onload = () => {
      if (!window.kakao?.maps) return fail()
      window.kakao.maps.load(() => {
        if (!window.kakao?.maps?.Map) return fail()
        window.clearTimeout(timeout)
        resolve(window.kakao.maps)
      })
    }
    document.head.appendChild(script)
  })
  return sdkPromise
}
