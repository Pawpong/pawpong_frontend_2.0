const { test } = require('node:test')
const assert = require('node:assert/strict')
const { load, file } = require('./fixtures/photo-access.fixture.cjs')
const source = load('src/shared/lib/sessionImageSource.ts')

function fixture() {
  const state = { scope: 'auth-read-1' }
  const image = load('src/shared/ui/SessionImage.tsx', {
    'next/image': { default: 'synthetic-image' },
    '@/shared/lib/useAuthReadSession': {
      useAuthReadSession: () => (state.scope ? { scope: state.scope } : null),
    },
    '@/shared/lib/sessionImageSource': source,
  })
  return { state, ...image }
}

test('인증 이미지는 최적화와 프리로드 및 별도 원본 주소를 비활성화한다', () => {
  const { SessionImage } = fixture()
  const inner = SessionImage({
    src: `/api/community/photos/owner/${file}`,
    alt: '',
    preload: true,
    unoptimized: false,
    placeholder: 'blur',
    overrideSrc: 'https://other.invalid',
  })
  const image = inner.type(inner.props)
  assert.equal(image.props.unoptimized, true)
  assert.equal(image.props.preload, false)
  assert.equal(image.props.priority, false)
  assert.equal(image.props.placeholder, 'empty')
  assert.equal(image.props.overrideSrc, undefined)
  assert.equal(image.props.loader, undefined)
  assert.match(image.props.src, /_session=auth-read-1$/)
})

test('계정 변경과 로그아웃은 이미지 요소 식별자와 요청 주소를 모두 바꾼다', () => {
  const app = fixture()
  const inner = app.SessionImage({ src: `/api/community/photos/owner/${file}`, alt: '' })
  const first = inner.type(inner.props)
  app.state.scope = 'auth-read-2'
  const second = inner.type(inner.props)
  app.state.scope = null
  const third = inner.type(inner.props)
  assert.notEqual(first.key, second.key)
  assert.notEqual(second.key, third.key)
  assert.notEqual(first.props.src, second.props.src)
  assert.match(third.props.src, /_session=anonymous$/)
})

test('공개 및 로컬 미리보기 이미지는 기존 최적화 속성을 변경하지 않는다', () => {
  const { SessionImage } = fixture()
  for (const src of [
    'https://cdn.example/photo.jpg',
    '/photo.jpg',
    'blob:synthetic',
    { src: '/photo.png', width: 1, height: 1 },
  ]) {
    const image = SessionImage({ src, alt: '사진', preload: true })
    assert.equal(image.props.src, src)
    assert.equal(image.props.preload, true)
    assert.equal(image.props.unoptimized, undefined)
  }
})
