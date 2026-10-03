import 'server-only'
import { cache } from 'react'
import type {
  ApiResponseFull,
  AdoptionPetDetail,
  CommunityPostDetail,
  AdopterPublicProfile,
  BreederPublicProfile,
  Notice,
} from '@/shared/types'
import { createPageMetadata, summarizeShareText } from '@/shared/lib/metadata'

/** SEO 전용 익명 조회. 사용자 쿠키·토큰을 전달하거나 비공개 응답을 캐시하지 않는다. */
const getPublicData = cache(async <T>(path: string): Promise<T | null> => {
  const origin = process.env.NEXT_PUBLIC_API_BASE_URL
  if (!origin) return null
  try {
    const response = await fetch(`${origin.replace(/\/+$/, '')}/api/v2${path}`, {
      cache: 'no-store',
      credentials: 'omit',
      signal: AbortSignal.timeout(3000),
    })
    if (!response.ok) return null
    const body: ApiResponseFull<T> = await response.json()
    return body.success && body.data ? body.data : null
  } catch {
    return null
  }
})

const unavailable = (path: string) =>
  createPageMetadata({
    title: '콘텐츠를 확인해 주세요',
    description: '삭제되었거나 공개되지 않은 콘텐츠입니다. 포퐁에서 다른 소식을 만나보세요.',
    path,
    noIndex: true,
  })

export const getAdoptionMetadata = async (id: string) => {
  const path = `/adoption/${encodeURIComponent(id)}`
  const pet = await getPublicData<AdoptionPetDetail>(path)
  if (!pet) return unavailable(path)
  return createPageMetadata({
    title: `${pet.name}의 가족을 찾고 있어요`,
    description: pet.description,
    path,
    image: pet.primaryPhotoUrl || pet.photoUrls?.[0],
  })
}

export const getPostMetadata = async (id: string) => {
  const path = `/community/post/${encodeURIComponent(id)}`
  const post = await getPublicData<
    Pick<CommunityPostDetail, 'title' | 'body' | 'photoUrls' | 'visibility' | 'status'>
  >(`/community/posts/${encodeURIComponent(id)}`)
  if (!post || post.visibility !== 'public' || post.status !== 'published') return unavailable(path)
  return createPageMetadata({
    title: post.title || summarizeShareText(post.body, 50) || '커뮤니티 게시글',
    description: post.body,
    path,
    image: post.photoUrls?.[0],
  })
}

export const getProfileMetadata = async (id: string) => {
  const safeId = encodeURIComponent(id)
  const path = `/home/${safeId}`
  const profile =
    (await getPublicData<AdopterPublicProfile>(`/profile/users/${safeId}`)) ??
    (await getPublicData<BreederPublicProfile>(`/profile/breeders/${safeId}`))
  if (!profile) return unavailable(path)
  return createPageMetadata({
    title: `${profile.nickname}님의 홈`,
    description: profile.bio,
    path,
    image: profile.profileImageUrl,
  })
}

export const getNoticeMetadata = async (id: string) => {
  const path = `/notices/${encodeURIComponent(id)}`
  const notice = await getPublicData<Notice>(`/notice/${encodeURIComponent(id)}`)
  if (!notice || notice.status !== 'published') return unavailable(path)
  return createPageMetadata({ title: notice.title, description: notice.content, path })
}
