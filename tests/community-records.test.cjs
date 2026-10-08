const { test } = require('node:test')
const assert = require('node:assert/strict')
const { createElement } = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { loadTypescript: load } = require('./helpers/load-typescript.cjs')

const records = load('src/entities/community/model/communityRecords.ts')
const discovery = load('src/entities/community/model/discovery.ts')
const template = (key) => records.COMMUNITY_TEMPLATES.find((item) => item.key === key)
const base = { topics: [], question: false, route: [], publicPlaceConfirmed: false }

test('작성 틀을 켜면 대표 주제와 기록 칸이 열리고 끄면 그 틀이 만든 것만 치운다', () => {
  const walk = records.toggleCommunityTemplate(base, template('walk'), '2026-10-06')
  assert.deepEqual(walk.topics, ['walk'])
  assert.deepEqual(walk.walk, { walkedOn: '2026-10-06' })
  const both = records.toggleCommunityTemplate(
    { ...walk, tags: ['노령견'] },
    template('question'),
    '2026-10-06',
  )
  assert.equal(both.question, true)
  assert.deepEqual(both.topics, ['walk', 'question'])
  const off = records.toggleCommunityTemplate(both, template('walk'), '2026-10-06')
  assert.equal(off.walk, undefined)
  assert.deepEqual(off.topics, ['question'])
  assert.deepEqual(off.tags, ['노령견'])
  assert.equal(off.question, true)
})

test('주제 3개가 찬 뒤에는 작성자가 고른 주제를 지키고 기록 칸만 연다', () => {
  const full = { ...base, topics: ['senior', 'nutrition', 'allergy'] }
  const next = records.toggleCommunityTemplate(full, template('clinic'), '2026-10-06')
  assert.deepEqual(next.topics, ['senior', 'nutrition', 'allergy'])
  assert.equal(next.clinic.visitReason, 'other')
  assert.equal(records.isCommunityTemplateActive(next, template('clinic')), true)
})

test('기록 검증은 서버와 같은 범위를 저장 전에 안내한다', () => {
  const check = records.validateCommunityExperience
  assert.equal(check(base), null)
  assert.match(
    check({ ...base, clinic: { visitedOn: '2026-10-06', clinicName: ' ', visitReason: 'other' } }),
    /병원 이름/,
  )
  assert.match(
    check({
      ...base,
      clinic: {
        visitedOn: '2026-10-06',
        clinicName: '포퐁동물병원',
        visitReason: 'checkup',
        followUpOn: '2026-10-01',
      },
    }),
    /방문한 날짜 이후/,
  )
  assert.match(check({ ...base, walk: { walkedOn: '2026-02-30' } }), /산책한 날짜/)
  assert.match(
    check({ ...base, walk: { walkedOn: '2026-10-06', durationMinutes: 2000 } }),
    /1,440분/,
  )
  assert.match(
    check({ ...base, route: [{ name: '한강공원', latitude: 37.5, longitude: 127 }] }),
    /공개 장소/,
  )
  assert.equal(
    check({
      ...base,
      route: [{ name: '한강공원', latitude: 37.5, longitude: 127 }],
      publicPlaceConfirmed: true,
      walk: { walkedOn: '2026-10-06', durationMinutes: 40, distanceMeters: 2500 },
    }),
    null,
  )
})

test('보내기 전에 빈 선택 값을 빼고 이름 공백을 정리한다', () => {
  const prepared = records.prepareCommunityExperience({
    ...base,
    tags: [],
    publicPlaceConfirmed: true,
    walk: { walkedOn: '2026-10-06', amenities: [] },
    clinic: { visitedOn: '2026-10-06', clinicName: ' 포퐁동물병원 ', visitReason: 'dental' },
    life: { recordedOn: '2026-10-06', activity: 'meal', petName: '  ' },
  })
  assert.equal(Object.hasOwn(prepared, 'tags'), false)
  assert.equal(prepared.publicPlaceConfirmed, false)
  assert.deepEqual(prepared.walk, { walkedOn: '2026-10-06' })
  assert.equal(prepared.clinic.clinicName, '포퐁동물병원')
  assert.deepEqual(prepared.life, { recordedOn: '2026-10-06', activity: 'meal' })
  assert.equal(records.isCommunityExperienceEmpty(base), true)
  assert.equal(records.isCommunityExperienceEmpty({ ...base, tags: ['산책'] }), false)
})

test('기록 요약은 작성자가 적은 값만 사람이 읽는 문구로 바꾼다', () => {
  const [walk, clinic, life] = records.summarizeCommunityRecords({
    ...base,
    walk: {
      walkedOn: '2026-10-06',
      durationMinutes: 95,
      distanceMeters: 2500,
      difficulty: 'easy',
      leashRequired: true,
      amenities: ['water', 'waste-bin'],
    },
    clinic: {
      visitedOn: '2026-10-05',
      clinicName: '포퐁동물병원',
      visitReason: 'vaccination',
      waitMinutes: 0,
      costKrw: 55000,
    },
    life: { recordedOn: '2026-10-04', activity: 'grooming', condition: 'watching' },
  })
  assert.equal(walk.date, '2026년 10월 6일')
  assert.deepEqual(
    walk.facts.map((fact) => fact.value),
    ['1시간 35분', '2.5km', '편안해요', '꼭 필요해요', '물 마실 곳 · 배변 봉투함'],
  )
  assert.deepEqual(
    clinic.facts.map((fact) => fact.value),
    ['포퐁동물병원', '예방접종', '바로 진료', '55,000원'],
  )
  assert.deepEqual(
    life.facts.map((fact) => fact.value),
    ['미용·목욕', '지켜보는 중'],
  )
  assert.deepEqual(
    records.summarizeCommunityRecords({ ...base, walk: { walkedOn: '2026-10-06' } })[0].facts,
    [],
  )
  assert.equal(records.formatCommunityDistance(800), '800m')
})

test('본문 글감은 켠 틀을 따른다', () => {
  assert.equal(records.communityWritingPrompt(undefined), null)
  assert.equal(records.communityWritingPrompt(base), null)
  assert.match(
    records.communityWritingPrompt({ ...base, topics: ['question'], question: true }),
    /궁금한가요/,
  )
})

test('주소의 필터는 아는 값만 읽고 같은 주소로 되돌린다', () => {
  const read = (query) => discovery.parseCommunityDiscovery(new URLSearchParams(query))
  const filters = read(
    'topics=walk,clinic,nope,walk&topicMatch=all&tags=%23노령견,WALK&kind=question&media=map&period=week&record=clinic&page=9',
  )
  assert.deepEqual(filters, {
    topics: ['walk', 'clinic'],
    topicMatch: 'all',
    tags: ['노령견', 'walk'],
    kind: 'question',
    media: 'map',
    period: 'week',
    record: 'clinic',
  })
  assert.deepEqual(read(discovery.toCommunityDiscoveryQuery(filters)), filters)
  assert.equal(discovery.countCommunityDiscovery(filters), 8)
  assert.deepEqual(read('record=home&kind=all&topics=walk&topicMatch=all'), { topics: ['walk'] })
  assert.equal(discovery.toCommunityDiscoveryQuery({}), '')
  assert.equal(discovery.toCommunityTag(' #제주 동반여행 '), '제주 동반여행')
  assert.equal(discovery.toCommunityTag('010-1234-5678!'), null)
})

test('기록 필터와 관련 글은 계약한 서버 경로만 호출한다', async () => {
  const calls = []
  const page = { items: [], pagination: {} }
  const api = load('src/entities/community/api/community.api.ts', {
    '@/shared/api': {
      apiClient: {
        get: async (...args) => {
          calls.push(args)
          return { data: page }
        },
      },
      unwrap: (value) => value.data,
      API_VERSION: '/v2',
    },
    '../model/communityReview': { parseCommunityPostReview: () => undefined },
    '../model/communityPhoto': load('src/entities/community/model/communityPhoto.ts'),
  })
  await api.getCommunityPosts({ record: 'walk', tags: ['노령견'] })
  assert.match(calls[0][0], /record=walk/)
  await api.getRelatedCommunityPosts('post-1', 6)
  assert.equal(calls[1][0], '/v2/community/posts/post-1/related?page=1&pageSize=6')
  const { communityQueries } = load('src/entities/community/api/community.queries.ts', {
    '@/shared/api': {
      createInfiniteQuery: (value) => value,
      createQuery: (value) => value,
      STALE_TIME: {},
    },
    './community.api': {},
  })
  const related = communityQueries.related('post-1')
  assert.deepEqual(related.queryKey, ['community', 'related', 'post-1', 6])
  assert.equal(related.retry, false)
  assert.equal(related.throwOnError, false)
  assert.equal(communityQueries.related('').enabled, false)
})

test('자동으로 붙은 태그는 보낸 값과 저장된 값의 차이로만 구한다', () => {
  const storage = new Map()
  const lib = load(
    'src/features/community/lib/communityAutoApplied.ts',
    {},
    {
      sessionStorage: {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
      },
    },
  )
  const applied = lib.diffCommunityAutoApplied(
    { topics: ['walk'], tags: ['한강'] },
    { topics: ['walk', 'park'], tags: ['한강', '노령견'] },
  )
  assert.deepEqual(applied, { topics: ['park'], tags: ['노령견'] })
  assert.deepEqual(lib.diffCommunityAutoApplied(undefined, { topics: ['daily'], tags: ['산책'] }), {
    topics: ['daily'],
    tags: ['산책'],
  })
  lib.rememberCommunityAutoApplied('post-1', applied)
  assert.deepEqual(lib.readCommunityAutoApplied('post-1'), applied)
  assert.equal(lib.readCommunityAutoApplied('post-2'), null)
  lib.rememberCommunityAutoApplied('post-1', { topics: [], tags: [] })
  assert.equal(lib.readCommunityAutoApplied('post-1'), null)
  storage.set('pawpong:community:auto-applied:post-3', '{"topics":[1,"walk"],"tags":"x"}')
  assert.deepEqual(lib.readCommunityAutoApplied('post-3'), { topics: ['walk'], tags: [] })
})

test('피드 카드의 기록·주제·태그 줄은 같은 조건의 필터를 건다', () => {
  const Icon = () => null
  const Meta = load('src/app/(main)/community/_ui/CommunityFeedMeta.tsx', {
    '@/entities/community': {
      CommunityPixelIcon: Icon,
      summarizeCommunityRecords: records.summarizeCommunityRecords,
    },
  }).CommunityFeedMeta
  const html = renderToStaticMarkup(
    createElement(Meta, {
      experience: {
        ...base,
        topics: ['clinic'],
        tags: ['슬개골'],
        clinic: {
          visitedOn: '2026-10-05',
          clinicName: '포퐁동물병원',
          visitReason: 'checkup',
          costKrw: 30000,
        },
      },
      topicLabel: () => '동물병원',
      onFilter: () => {},
    }),
  )
  assert.match(html, /건강검진 · 30,000원/)
  assert.match(html, /aria-label="병원 방문 글만 보기"/)
  assert.match(html, /aria-label="동물병원 주제 글만 보기"/)
  assert.match(html, /#슬개골/)
  assert.doesNotMatch(html, /포퐁동물병원/)
  assert.equal(
    renderToStaticMarkup(
      createElement(Meta, { experience: base, topicLabel: String, onFilter() {} }),
    ),
    '',
  )
})

test('같은 내용의 저장 재시도는 같은 식별자와 이미 올린 사진을 다시 쓴다', async () => {
  const attempts = load(
    'src/features/community/lib/communityCreateAttempt.ts',
    {},
    { crypto: require('node:crypto').webcrypto },
  )
  const file = { name: 'a.jpg', size: 10, lastModified: 1 }
  const signature = attempts.communityCreateSignature(['본문', 'public'], [file])
  const first = attempts.nextCommunityCreateAttempt(null, signature)
  assert.match(
    first.clientRequestId,
    /^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/,
  )
  assert.equal(attempts.nextCommunityCreateAttempt(first, signature), first)
  const changed = attempts.nextCommunityCreateAttempt(
    first,
    attempts.communityCreateSignature(['본문 고침', 'public'], [file]),
  )
  assert.notEqual(changed.clientRequestId, first.clientRequestId)
  assert.equal(changed.uploaded, undefined)

  const calls = { uploads: 0, created: [], updated: [] }
  let failCreate = true
  const { submitCommunityPostForm } = load(
    'src/features/community/lib/submitCommunityPostForm.ts',
    {
      '@/shared/api': { uploadMultipleFiles: async () => [] },
      '../api/community.api': {
        createCommunityPost: async (data) => {
          calls.created.push(data)
          if (failCreate) throw new Error('응답을 받지 못했어요.')
          return { postId: 'post-1' }
        },
        updateCommunityPost: async (_id, data) => {
          calls.updated.push(data)
          return { postId: 'post-1' }
        },
      },
      '../api/communityReviewPhotos.api': {
        uploadCommunityReviewPhotos: async () => {
          calls.uploads += 1
          return [{ fileName: `owned-${calls.uploads}.jpg` }]
        },
      },
      './communityWriteSession': { captureCommunityWriteSession: () => () => {} },
      './communityPhotoFileName': {
        COMMUNITY_UPLOAD_FOLDER: 'community',
        toCommunityPhotoFileName: (value) => value,
      },
    },
  )
  const input = {
    text: '본문',
    files: [file],
    visibility: 'public',
    status: 'published',
    aiReviewConsent: true,
    useOwnedPhotoUpload: true,
    createAttempt: first,
  }
  await assert.rejects(submitCommunityPostForm(input))
  failCreate = false
  await submitCommunityPostForm(input)
  assert.equal(calls.uploads, 1)
  assert.deepEqual(
    calls.created.map((data) => [data.clientRequestId, data.photos]),
    [
      [first.clientRequestId, ['owned-1.jpg']],
      [first.clientRequestId, ['owned-1.jpg']],
    ],
  )
  await submitCommunityPostForm(input, 'post-1')
  assert.equal(Object.hasOwn(calls.updated[0], 'clientRequestId'), false)
  assert.equal(calls.uploads, 2)
})

test('기록 남기기 링크는 새 글의 기록 틀만 열고 수치는 비워 둔다', () => {
  const start = records.initialCommunityExperience
  assert.deepEqual(start('walk', '2026-10-07'), {
    ...base,
    topics: ['walk'],
    walk: { walkedOn: '2026-10-07' },
  })
  const clinic = start('clinic', '2026-10-07')
  assert.deepEqual(clinic.clinic, { visitedOn: '2026-10-07', clinicName: '', visitReason: 'other' })
  // 병원 이름을 적기 전에는 저장할 수 없다.
  assert.match(records.validateCommunityExperience(clinic), /병원 이름/)
  assert.deepEqual(start('daily', '2026-10-07').life, {
    recordedOn: '2026-10-07',
    activity: 'other',
  })
  assert.deepEqual(start('daily', '2026-10-07').topics, ['daily'])
  for (const value of ['life', 'unknown', 'constructor', '', null, undefined])
    assert.equal(start(value), undefined)
})
