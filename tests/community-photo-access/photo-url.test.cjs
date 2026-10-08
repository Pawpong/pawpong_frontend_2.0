const { test } = require('node:test')
const assert = require('node:assert/strict')
const { load, model, file, postId } = require('./fixtures/photo-access.fixture.cjs')
const protectedUrl = `https://dev-api.pawpong.kr/api/v2/community/posts/${postId}/photos/${file}`

test('보호 사진의 소유자 및 게시글 조회 주소만 같은 출처로 변환한다', () => {
  for (const prefix of ['https://dev-api.pawpong.kr', '']) {
    assert.equal(
      model.toCommunityPhotoProxyUrl(`${prefix}/api/v2/community/review/photos/${file}`),
      `/api/community/photos/owner/${file}`,
    )
    assert.equal(
      model.toCommunityPhotoProxyUrl(
        `${prefix}/api/v2/community/posts/${postId}/photos/${file}?token=discard`,
      ),
      `/api/community/photos/posts/${postId}/${file}`,
    )
  }
  assert.equal(
    model.toCommunityPhotoProxyUrl(`/api/community/photos/owner/${file}?_session=old`),
    `/api/community/photos/owner/${file}`,
  )
})

test('기존 공개 사진과 외부 주소를 인증 프록시로 변환하지 않는다', () => {
  for (const value of [
    `https://cdn.example/community/${file}`,
    `https://other.example/api/v2/community/review/photos/${file}`,
    `https://dev-api.pawpong.kr.attacker.example/api/v2/community/review/photos/${file}`,
    `https://user@dev-api.pawpong.kr/api/v2/community/review/photos/${file}`,
    '/api/community/photos/owner/not-owned.jpg',
    'blob:synthetic',
    'data:image/png;base64,fixture',
  ])
    assert.equal(model.toCommunityPhotoProxyUrl(value), value)
})

test('글 수정은 보호 사진 주소를 원래 업로드 파일명으로 복원한다', () => {
  const { toCommunityPhotoFileName } = load(
    'src/features/community/lib/communityPhotoFileName.ts',
    {
      '@/entities/community': model,
    },
    { window: { location: { origin: 'https://dev.pawpong.kr' } } },
  )
  for (const value of [
    protectedUrl,
    `/api/community/photos/posts/${postId}/${file}?_session=old`,
    `https://cdn.example/bucket/community/${file}`,
  ]) {
    assert.equal(toCommunityPhotoFileName(value), `community/${file}`)
  }
  assert.equal(toCommunityPhotoFileName('/api/community/photos/owner/not-owned.jpg'), null)
  assert.equal(toCommunityPhotoFileName('https://['), null)
})

test('목록과 상세 및 명예의 전당 사진은 동일한 조회 경계를 사용한다', async () => {
  const { entityApi, post } = require('../community-review/fixtures/community-review.fixture.cjs')
  const raw = { ...post(), photoUrls: [protectedUrl], primaryPhotoUrl: protectedUrl }
  const api = entityApi(async () => ({ data: { items: [raw] } }))
  const path = `/api/community/photos/posts/${postId}/${file}`
  assert.deepEqual(api.mapCommunityPostDetail(raw).photoUrls, [path])
  assert.equal((await api.getCommunityPosts()).items[0].primaryPhotoUrl, path)
  const round = { winners: [{ photoUrl: protectedUrl }, { photoUrl: null }] }
  const hall = entityApi(async () => ({ data: round }))
  assert.deepEqual(
    (await hall.getCurrentCommunityHallOfFame()).winners.map((item) => item.photoUrl),
    [path, null],
  )
  const history = entityApi(async () => ({ data: { items: [round] } }))
  assert.equal((await history.getCommunityHallOfFameHistory()).items[0].winners[0].photoUrl, path)
})
