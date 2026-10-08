export interface CommunityPhotoLocation {
  latitude: number
  longitude: number
}

/** 사진 위치를 지도에 담을 때의 공개 정밀도. area는 동네 정도로 흐린 좌표다. */
export type CommunityPhotoPlacePrecision = 'area' | 'exact'

export interface CommunityPhotoLocationOption {
  photoIndex: number
  previewUrl: string
  location?: CommunityPhotoLocation
  /** 원본 촬영 시각(ms). 기기 안에서 순서를 맞출 때만 쓰고 서버로 보내지 않는다. */
  takenAt?: number
  /** 이미 올린 사진이라 위치 메타데이터를 지운 사본만 남아 있다. */
  saved?: boolean
}
