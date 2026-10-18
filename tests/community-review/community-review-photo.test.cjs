const { test } = require('node:test')
const assert = require('node:assert/strict')
const { load, sessionFixture, post } = require('./fixtures/community-review.fixture.cjs')
const key = 'community/review-00000000-0000-4000-8000-000000000000.png'

test('인증 사진은 고정 경로로 업로드하며 폴더와 소유자를 클라이언트에서 보내지 않음', async () => {
  const { session } = sessionFixture()
  const calls = []
  const api = load('src/features/community/api/communityReviewPhotos.api.ts', {
    '@/shared/api': {
      apiClient: {
        post: async (...args) => {
          calls.push(args)
          return { data: [{ fileName: key }] }
        },
      },
      API_VERSION: '/api/v2',
      unwrap: (value) => value.data,
      ApiError: load('src/shared/api/unwrap.ts').ApiError,
    },
    '../lib/communityWriteSession': session,
  })
  const controller = new AbortController()
  const result = await api.uploadCommunityReviewPhotos(
    [new File(['photo'], 'source.png')],
    controller.signal,
  )
  assert.equal(result[0].fileName, key)
  assert.equal(calls[0][0], '/api/v2/community/review/photos')
  assert.deepEqual([...calls[0][1].keys()], ['files'])
  assert.equal(calls[0][2].skipAuthRefresh, true)
  assert.equal(calls[0][2].signal, controller.signal)
  assert.equal(calls[0][2].timeout, 60_000)
})

test('계정 전환 후의 업로드와 일부 사진 또는 구 키 응답은 저장에 재사용하지 않음', async () => {
  const { state, session } = sessionFixture()
  let result = [{ fileName: key }]
  let switchAccount = false
  const api = load('src/features/community/api/communityReviewPhotos.api.ts', {
    '@/shared/api': {
      apiClient: {
        post: async () => {
          if (switchAccount) state.generation++
          return { data: result }
        },
      },
      API_VERSION: '/api/v2',
      unwrap: (value) => value.data,
      ApiError: load('src/shared/api/unwrap.ts').ApiError,
    },
    '../lib/communityWriteSession': session,
  })
  const files = [new File(['photo'], 'source.png')]
  for (const value of [[], [{ fileName: 'community/legacy.png' }], null]) {
    result = value
    await assert.rejects(api.uploadCommunityReviewPhotos(files), /업로드 사진/)
  }
  result = [{ fileName: key }]
  switchAccount = true
  await assert.rejects(api.uploadCommunityReviewPhotos(files), /로그인 또는 화면/)
})

test('새 비공개 저장소 사진 키도 기존 응답 계약으로 게시글에 연결한다', async () => {
  const { session } = sessionFixture()
  const privateKey = key.replace('review-', 'review-private-')
  const api = load('src/features/community/api/communityReviewPhotos.api.ts', {
    '@/shared/api': {
      apiClient: { post: async () => ({ data: [{ fileName: privateKey }] }) },
      API_VERSION: '/api/v2',
      unwrap: (value) => value.data,
      ApiError: load('src/shared/api/unwrap.ts').ApiError,
    },
    '../lib/communityWriteSession': session,
  })
  const result = await api.uploadCommunityReviewPhotos([new File(['photo'], 'source.png')])
  assert.equal(result[0].fileName, privateKey)
})

test('개발 심사 발행과 임시저장은 인증 사진을 쓰며 운영 구 요청은 범용 계약을 유지함', async () => {
  const { session } = sessionFixture()
  const uploads = [],
    commands = []
  const submit = load('src/features/community/lib/submitCommunityPostForm.ts', {
    '@/shared/api': {
      uploadMultipleFiles: async (...args) => {
        uploads.push(['legacy', ...args])
        return [{ fileName: 'community/legacy.png' }]
      },
    },
    '../api/communityReviewPhotos.api': {
      uploadCommunityReviewPhotos: async (...args) => {
        uploads.push(['owned', ...args])
        return [{ fileName: key }]
      },
    },
    '../api/community.api': {
      createCommunityPost: async (command) => {
        commands.push(command)
        return post()
      },
    },
    './communityWriteSession': session,
    './communityPhotoFileName': {
      COMMUNITY_UPLOAD_FOLDER: 'community',
      toCommunityPhotoFileName: (value) => value,
    },
  }).submitCommunityPostForm
  const input = { text: '산책 사진', files: [{}], status: 'draft', visibility: 'private' }
  await submit({ ...input, useOwnedPhotoUpload: true })
  await submit({ ...input, status: 'published', aiReviewConsent: false })
  await submit({ ...input, status: 'published' })
  assert.deepEqual(
    uploads.map(([type]) => type),
    ['owned', 'owned', 'legacy'],
  )
  assert.equal(Object.hasOwn(commands[0], 'aiReviewConsent'), false)
  assert.equal(Object.hasOwn(commands[0], 'useOwnedPhotoUpload'), false)
  assert.equal(commands[1].aiReviewConsent, false)
  assert.deepEqual(commands[0].photos, [key])
  assert.deepEqual(commands[2].photos, ['community/legacy.png'])
})

test('작성 화면은 설정이 켜졌을 때만 인증 사진 경로를 선택함', () => {
  const source = require('node:fs').readFileSync(
    'src/app/(main)/community/_ui/CommunityPostEditor.tsx',
    'utf8',
  )
  assert.match(source, /reviewEnabled \? \{ useOwnedPhotoUpload: true \} : \{\}/)
})
