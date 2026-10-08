export interface CommunityPhotoLocation {
  latitude: number
  longitude: number
}

export interface CommunityPhotoLocationOption {
  photoIndex: number
  previewUrl: string
  location?: CommunityPhotoLocation
}
