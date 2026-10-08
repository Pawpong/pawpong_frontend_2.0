const { loadTypescript: load } = require('../../helpers/load-typescript.cjs')
const model = load('src/entities/community/model/communityReview.ts')
const identity = load('src/shared/lib/authTokenIdentity.ts')
const held = () => ({
  state: 'held',
  reason: 'not_consented',
  message: '동의 후 공개 여부를 확인해 주세요.',
  checkedPhotoCount: 0,
  canRequestReview: true,
})
const post = () => ({
  postId: 'synthetic-post',
  author: { userId: 'synthetic-owner', nickname: '합성 작성자' },
  authorModel: 'Adopter',
  body: '반려견과 산책했어요.',
  photoUrls: [],
  visibility: 'public',
  status: 'published',
  commentPreview: [],
  likeCount: 0,
  commentCount: 0,
  saveCount: 0,
  viewCount: 0,
  isLiked: false,
  isSaved: false,
  createdAt: '2026-10-06T00:00:00Z',
  aiReview: held(),
})
function sessionFixture() {
  const state = { token: 'synthetic-token', generation: 1 }
  const session = load('src/features/community/lib/communityWriteSession.ts', {
    '@/shared/lib/authTokenIdentity': identity,
    '@/shared/api': {
      ApiError: load('src/shared/api/unwrap.ts').ApiError,
      getAccessToken: () => state.token,
    },
    '@/shared/api/token': { getAccessToken: () => state.token },
    '@/shared/lib/authSessionLifecycle': {
      getAuthSessionGeneration: () => state.generation,
      isAuthSessionCurrent: (generation) => generation === state.generation,
    },
  })
  return { state, session }
}
function entityApi(get = async () => ({ data: post() })) {
  return load('src/entities/community/api/community.api.ts', {
    '@/shared/api': { apiClient: { get }, API_VERSION: '/api/v2', unwrap: (value) => value.data },
    '../model/communityReview': model,
    '../model/communityPhoto': load('src/entities/community/model/communityPhoto.ts'),
  })
}
const deferred = () => {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}
module.exports = { load, model, held, post, sessionFixture, entityApi, deferred, identity }
