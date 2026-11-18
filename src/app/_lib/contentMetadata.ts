import 'server-only'
import { adoptionQueries } from '@/entities/adoption'
import { adopterQueries } from '@/entities/adopter'
import { breederQueries } from '@/entities/breeder'
import { noticeQueries } from '@/entities/notice'
import { getPublicCommunityPost } from './publicCommunityPost'
import { fetchForRequest } from './requestQueries'
import { createPageMetadata, summarizeShareText } from '@/shared/lib/metadata'

// 분양·프로필·공지 메타데이터는 화면과 같은 쿼리로 받는다. 같은 요청의 ServerPrefetch 가
// 결과를 같이 써서 백엔드를 한 번만 부른다. 요청마다 새로 만드는 페이지라 캐시되지 않는다.

const unavailable = (path: string) =>
  createPageMetadata({
    title: '콘텐츠를 확인해 주세요',
    description: '삭제되었거나 공개되지 않은 콘텐츠입니다. 포퐁에서 다른 소식을 만나보세요.',
    path,
    noIndex: true,
  })

export const getAdoptionMetadata = async (id: string) => {
  const path = `/adoption/${encodeURIComponent(id)}`
  const pet = await fetchForRequest(adoptionQueries.detail(id))
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
  const post = await getPublicCommunityPost(id)
  if (!post || post.visibility !== 'public' || post.status !== 'published') return unavailable(path)
  return createPageMetadata({
    title: post.title || summarizeShareText(post.body, 50) || '커뮤니티 게시글',
    description: post.body,
    path,
    image: post.photoUrls?.[0],
  })
}

/**
 * 화면(UserHomeRouter)과 같은 순서로 찾는다 — 입양자로 먼저, 아니면(400) 브리더.
 * 메타데이터와 페이지가 같이 불러도 같은 요청 안에서는 백엔드를 한 번씩만 부르고,
 * 찾은 쪽만 캐시에 남아 ServerPrefetch 로 화면에 넘어간다.
 */
export const findHomeProfile = async (id: string) =>
  (await fetchForRequest(adopterQueries.publicProfile(id))) ??
  (await fetchForRequest(breederQueries.publicProfile(id)))

export const getProfileMetadata = async (id: string) => {
  const path = `/home/${encodeURIComponent(id)}`
  const profile = await findHomeProfile(id)
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
  const notice = await fetchForRequest(noticeQueries.detail(id))
  if (!notice || notice.status !== 'published') return unavailable(path)
  return createPageMetadata({ title: notice.title, description: notice.content, path })
}
