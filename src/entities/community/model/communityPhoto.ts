const FILE_NAME = /^review-[a-zA-Z0-9_-]{1,93}\.(?:jpe?g|png|webp)$/i
const POST_ID = /^[a-f\d]{24}$/i
const PHOTO_PREFIX = '/api/community/photos/'

export function parseCommunityPhotoSegments(segments: string[]) {
  if (segments.length === 2 && segments[0] === 'owner' && FILE_NAME.test(segments[1])) {
    return {
      fileName: segments[1],
      backendPath: `/api/v2/community/review/photos/${segments[1]}`,
      ownerOnly: true,
    }
  }
  if (
    segments.length === 3 &&
    segments[0] === 'posts' &&
    POST_ID.test(segments[1]) &&
    FILE_NAME.test(segments[2])
  ) {
    return {
      fileName: segments[2],
      backendPath: `/api/v2/community/posts/${segments[1]}/photos/${segments[2]}`,
      ownerOnly: false,
    }
  }
  return null
}

/** 서버가 보호 조회 주소로 제공한 사진만 변환하며 기존 CDN 계약은 유지한다. */
export function toCommunityPhotoProxyUrl(value: string): string {
  try {
    const url = new URL(value, 'https://dev.pawpong.kr')
    if (url.username || url.password || url.protocol !== 'https:') return value
    let segments: string[] | undefined
    if (url.origin === 'https://dev.pawpong.kr' && url.pathname.startsWith(PHOTO_PREFIX)) {
      segments = url.pathname.slice(PHOTO_PREFIX.length).split('/')
    } else if (
      url.origin === 'https://dev-api.pawpong.kr' ||
      (value.startsWith('/api/v2/') && !value.startsWith('//'))
    ) {
      const owner = url.pathname.match(/^\/api\/v2\/community\/review\/photos\/([^/]+)$/)
      const post = url.pathname.match(/^\/api\/v2\/community\/posts\/([^/]+)\/photos\/([^/]+)$/)
      segments = owner ? ['owner', owner[1]] : post ? ['posts', post[1], post[2]] : undefined
    }
    return segments && parseCommunityPhotoSegments(segments)
      ? `${PHOTO_PREFIX}${segments.join('/')}`
      : value
  } catch {
    return value
  }
}

export function communityProtectedPhotoFileName(value: string): string | null {
  const path = toCommunityPhotoProxyUrl(value)
  if (!path.startsWith(PHOTO_PREFIX)) return null
  const photo = parseCommunityPhotoSegments(path.slice(PHOTO_PREFIX.length).split('/'))
  return photo ? `community/${photo.fileName}` : null
}
