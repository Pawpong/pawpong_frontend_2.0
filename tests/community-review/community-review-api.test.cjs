const { test } = require('node:test')
const assert = require('node:assert/strict')
const {
  load,
  model,
  post,
  sessionFixture,
  entityApi,
} = require('./fixtures/community-review.fixture.cjs')

test('작성과 수정도 공통 mapper로 작성자와 심사 상태를 보존하고 자동 재전송을 막음', async () => {
  const { session } = sessionFixture()
  const calls = []
  const send = async (...args) => {
    calls.push(args)
    return { data: post() }
  }
  const api = load('src/features/community/api/community.api.ts', {
    '@/shared/api': {
      apiClient: { post: send, patch: send },
      API_VERSION: '/api/v2',
      unwrap: (value) => value.data,
    },
    '@/entities/community': entityApi(),
    '../lib/communityWriteSession': session,
  })
  const created = await api.createCommunityPost({ body: '산책', aiReviewConsent: false })
  const updated = await api.updateCommunityPost('synthetic-post', {
    body: '산책 수정',
    aiReviewConsent: true,
  })
  assert.equal(created.authorId, 'synthetic-owner')
  assert.equal(updated.aiReview.state, 'held')
  assert.equal(calls[0][2].skipAuthRefresh, true)
  assert.equal(calls[1][2].skipAuthRefresh, true)
})

test('기존 발행은 인증 갱신을 허용하며 같은 계정의 갱신 응답을 정상 처리함', async () => {
  const { state, session } = sessionFixture()
  const token = (exp) =>
    `synthetic.${Buffer.from(JSON.stringify({ sub: 'synthetic-owner', role: 'adopter', exp })).toString('base64url')}.synthetic`
  state.token = token(1)
  const api = load('src/features/community/api/community.api.ts', {
    '@/shared/api': {
      apiClient: {
        post: async (_url, _body, options) => {
          assert.equal(options.skipAuthRefresh, false)
          state.token = token(2)
          return { data: post() }
        },
      },
      API_VERSION: '/api/v2',
      unwrap: (value) => value.data,
    },
    '@/entities/community': entityApi(),
    '../lib/communityWriteSession': session,
  })
  assert.equal((await api.createCommunityPost({ body: '기존 발행' })).authorId, 'synthetic-owner')
})

test('목록과 상세 조회는 모델을 생성하지 않고 작성자 상태를 mapper로 보존함', async () => {
  const calls = []
  const raw = post()
  const api = entityApi(async (url) => {
    calls.push(url)
    return {
      data: url.includes('?')
        ? { items: [{ ...raw, bodyExcerpt: raw.body }], pagination: {} }
        : raw,
    }
  })
  assert.equal((await api.getCommunityPosts()).items[0].aiReview.state, 'held')
  const detail = await api.getCommunityPostDetail(raw.postId)
  assert.equal(detail.authorId, raw.author.userId)
  assert.equal(detail.aiReview.state, 'held')
  assert.equal(calls.length, 2)
})
test('재심사는 동의 없으면 호출하지 않고 literal true와 취소 신호만 전달함', async () => {
  const calls = []
  const { session } = sessionFixture()
  const api = load('src/features/community/api/communityReview.api.ts', {
    '@/shared/api': {
      apiClient: {
        post: async (...args) => {
          calls.push(args)
          return { data: post() }
        },
      },
      API_VERSION: '/api/v2',
      unwrap: (value) => value.data,
    },
    '@/entities/community': entityApi(),
    '../lib/communityWriteSession': session,
  })
  await assert.rejects(api.requestCommunityPostReview('synthetic-post', false))
  assert.equal(calls.length, 0)
  const controller = new AbortController()
  const result = await api.requestCommunityPostReview('synthetic-post', true, controller.signal)
  assert.equal(result.authorId, 'synthetic-owner')
  assert.deepEqual(calls[0][1], { aiReviewConsent: true })
  assert.equal(calls[0][2].skipAuthRefresh, true)
  assert.equal(calls[0][2].signal, controller.signal)
})
test('계정 변경 후 완료된 재심사 응답은 캐시용 결과로 반환하지 않음', async () => {
  const { state, session } = sessionFixture()
  const api = load('src/features/community/api/communityReview.api.ts', {
    '@/shared/api': {
      apiClient: {
        post: async () => {
          state.generation++
          return { data: post() }
        },
      },
      API_VERSION: '/api/v2',
      unwrap: (value) => value.data,
    },
    '@/entities/community': entityApi(),
    '../lib/communityWriteSession': session,
  })
  await assert.rejects(api.requestCommunityPostReview('synthetic-post', true), /로그인 또는 화면/)
})
test('업로드 중 계정이 바뀌면 게시글 생성으로 이어가지 않음', async () => {
  const { state, session } = sessionFixture()
  let created = 0
  const submit = load('src/features/community/lib/submitCommunityPostForm.ts', {
    '@/shared/api': {
      uploadMultipleFiles: async () => {
        state.token = 'other-synthetic'
        return [{ fileName: 'community/synthetic.jpg' }]
      },
    },
    '../api/communityReviewPhotos.api': {
      uploadCommunityReviewPhotos: async () => {
        state.token = 'other-synthetic'
        return [{ fileName: 'community/review-synthetic.jpg' }]
      },
    },
    '../api/community.api': {
      createCommunityPost: async () => {
        created++
      },
    },
    './communityWriteSession': session,
    './communityPhotoFileName': {
      COMMUNITY_UPLOAD_FOLDER: 'community',
      toCommunityPhotoFileName: (value) => value,
    },
  }).submitCommunityPostForm
  await assert.rejects(
    submit({
      text: '산책',
      files: [{}],
      status: 'published',
      visibility: 'public',
      aiReviewConsent: true,
    }),
  )
  assert.equal(created, 0)
})
test('임시저장과 구 요청에는 심사 입력을 넣지 않고 발행에만 선택한 동의를 보냄', async () => {
  const { session } = sessionFixture()
  const calls = []
  const submit = load('src/features/community/lib/submitCommunityPostForm.ts', {
    '@/shared/api': { uploadMultipleFiles: async () => [] },
    '../api/communityReviewPhotos.api': { uploadCommunityReviewPhotos: async () => [] },
    '../api/community.api': {
      createCommunityPost: async (value) => {
        calls.push(value)
        return post()
      },
    },
    './communityWriteSession': session,
    './communityPhotoFileName': {
      COMMUNITY_UPLOAD_FOLDER: 'community',
      toCommunityPhotoFileName: (value) => value,
    },
  }).submitCommunityPostForm
  const input = {
    text: ' 산책 ',
    files: [],
    status: 'draft',
    visibility: 'private',
    aiReviewConsent: true,
  }
  await submit(input)
  await submit({ ...input, status: 'published', aiReviewConsent: undefined })
  await submit({ ...input, status: 'published', aiReviewConsent: false })
  assert.equal(Object.hasOwn(calls[0], 'aiReviewConsent'), false)
  assert.equal(Object.hasOwn(calls[1], 'aiReviewConsent'), false)
  assert.equal(calls[2].aiReviewConsent, false)
  assert.equal(calls[2].body, '산책')
  assert.equal(model.isCommunityPostHeld({}), false)
})
