const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
function load(file, dependencies = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const result = {}
  new Function('exports', 'require', code)(result, (name) => dependencies[name] ?? require(name))
  return result
}
const topics = load('src/features/inquiry/model/supportTopics.ts')
const contract = load('src/features/inquiry/model/supportConversation.ts')
const { SupportChatController } = load('src/features/inquiry/model/supportChatController.ts', {
  './supportTopics': topics,
  './supportConversation': contract,
})
const { SupportChatError } = contract
const id = '11111111-1111-4111-8111-111111111111'
const conversation = (changes = {}) => ({
  conversationId: id,
  category: 'usage',
  userType: 'adopter',
  revision: 0,
  messages: [],
  draft: null,
  sources: [],
  needsHumanSupport: false,
  submission: null,
  expiresAt: '2026-10-10',
  completedRequestIds: [],
  pendingRequestId: null,
  ...changes,
})
const completed = (attempt, changes = {}) =>
  conversation({
    revision: attempt.revision + 1,
    completedRequestIds: [attempt.clientRequestId],
    messages: [
      { role: 'user', content: attempt.message, createdAt: 'now' },
      { role: 'assistant', content: '안내', createdAt: 'now' },
    ],
    draft: { title: '문의', summary: attempt.message, conditions: [], additionalInfo: [] },
    ...changes,
  })
function setup(overrides = {}) {
  const calls = { create: [], turn: [], submit: [], forget: [] }
  const api = {
    create: async (...args) => {
      calls.create.push(args)
      return conversation({ category: args[0] })
    },
    turn: async (...args) => {
      calls.turn.push(args)
      return completed(args[1])
    },
    get: async () => conversation(),
    submit: async (...args) => {
      calls.submit.push(args)
      return conversation({ submission: { status: 'accepted', deliveryStatus: 'pending' } })
    },
    forget: async (...args) => {
      calls.forget.push(args)
    },
    ...overrides,
  }
  const app = new SupportChatController(api, 'adopter')
  const state = (topic) => app.getSnapshot()[topic ?? 'usage']
  app.setDraft('usage', '내 문의')
  return { app, state, calls, api }
}

test('no request is sent before storage consent or with an empty message', async () => {
  const { app, calls } = setup()
  await app.send('usage')
  app.setConsent('usage', true)
  app.setDraft('usage', '   ')
  await app.send('usage')
  assert.equal(calls.create.length, 0)
})

test('two immediate send clicks create one conversation and one turn', async () => {
  let resolve
  const { app, state, calls } = setup({
    turn: (id, turn) => {
      calls.turn.push([id, turn])
      return new Promise((done) => {
        resolve = () => done(completed(turn))
      })
    },
  })
  app.setConsent('usage', true)
  const sending = app.send('usage')
  await app.send('usage')
  await Promise.resolve()
  assert.equal(calls.create.length, 1)
  assert.equal(calls.turn.length, 1)
  assert.equal(state().draft, '내 문의')
  resolve()
  await sending
  assert.equal(state().draft, '')
  assert.equal(state().conversation.messages.length, 2)
  assert.equal(calls.submit.length, 0)
})

test('lost response keeps exact request for retry and clears only the confirmed draft', async () => {
  let attempt = 0
  const seen = []
  const { app, state } = setup({
    turn: async (_, turn) => {
      seen.push(structuredClone(turn))
      if (!attempt++) throw new SupportChatError(502)
      return completed(turn)
    },
  })
  app.setConsent('usage', true)
  await app.send('usage')
  assert.equal(state().draft, '내 문의')
  assert.equal(state().error.recovery, 'retry')
  await app.send('usage')
  assert.deepEqual(seen[1], seen[0])
  assert.equal(state().pendingTurn, null)
  assert.equal(state().conversation.messages.length, 2)
  assert.equal(state().draft, '')
})

test('edits made after failure and other-category drafts survive a retry', async () => {
  let count = 0
  const { app, state } = setup({
    turn: async (_, turn) => {
      if (!count++) throw new SupportChatError(0)
      return completed(turn)
    },
  })
  app.setConsent('usage', true)
  await app.send('usage')
  app.setDraft('usage', '다음 질문')
  app.setDraft('feedback', '개선 내용')
  app.setConsent('feedback', true)
  await app.send('usage')
  assert.equal(state().draft, '다음 질문')
  assert.equal(state('feedback').draft, '개선 내용')
  assert.equal(state('feedback').consent, true)
  assert.equal(state('feedback').conversation, null)
})

test('GET recovery recognizes the completed request without duplicating the turn', async () => {
  let saved
  const { app, state } = setup({
    turn: async (_, turn) => {
      saved = completed(turn)
      throw new SupportChatError(502)
    },
    get: async () => saved,
  })
  app.setConsent('usage', true)
  await app.send('usage')
  await app.refresh('usage')
  assert.equal(state().pendingTurn, null)
  assert.equal(state().draft, '')
  assert.equal(state().conversation.messages.length, 2)
})

test('stale revision recovers latest conversation and keeps the unsent draft', async () => {
  const turns = []
  const { app, state } = setup({
    turn: async (_, turn) => {
      turns.push(turn)
      if (turns.length === 1) throw new SupportChatError(409, 'REVISION_CONFLICT')
      return completed(turn)
    },
    get: async () => conversation({ revision: 3 }),
  })
  app.setConsent('usage', true)
  await app.send('usage')
  assert.equal(state().conversation.revision, 3)
  assert.equal(state().draft, '내 문의')
  assert.equal(state().pendingTurn, null)
  await app.send('usage')
  assert.equal(turns[1].revision, 3)
  assert.notEqual(turns[1].clientRequestId, turns[0].clientRequestId)
})

test('busy response preserves the original id and revision for retry', async () => {
  const { app, state } = setup({
    turn: async () => {
      throw new SupportChatError(409, 'CONVERSATION_BUSY')
    },
  })
  app.setConsent('usage', true)
  await app.send('usage')
  const attempt = structuredClone(state().pendingTurn)
  await app.send('usage')
  assert.deepEqual(state().pendingTurn, attempt)
  assert.equal(state().draft, '내 문의')
})

test('expired capability restarts with preserved draft and forgets only its own cookie', async () => {
  const { app, state, calls } = setup({
    turn: async () => {
      throw new SupportChatError(410)
    },
  })
  app.setConsent('usage', true)
  await app.send('usage')
  assert.equal(state().error.recovery, 'restart')
  app.restart('usage')
  assert.equal(state().draft, '내 문의')
  assert.equal(state().conversation, null)
  assert.equal(calls.forget[0][0], id)
})

test('reset cannot discard an in-flight turn', async () => {
  let resolve
  const { app, state } = setup({
    turn: async (_, turn) =>
      new Promise((done) => {
        resolve = () => done(completed(turn))
      }),
  })
  app.setConsent('usage', true)
  const sending = app.send('usage')
  await Promise.resolve()
  app.restart('usage')
  assert.equal(state().phase, 'sending')
  resolve()
  await sending
  assert.equal(state().conversation.messages.length, 2)
})

test('only explicit submit forwards a complete draft; unsent edits block submission', async () => {
  const { app, state, calls } = setup()
  app.setConsent('usage', true)
  await app.send('usage')
  assert.equal(calls.submit.length, 0)
  app.setDraft('usage', '수정 중')
  await app.submit('usage')
  assert.equal(calls.submit.length, 0)
  app.setDraft('usage', '')
  await app.submit('usage')
  assert.equal(state().conversation.submission.deliveryStatus, 'pending')
  await app.submit('usage')
  assert.equal(calls.submit.length, 1)
})

test('submission response loss retries the same conversation revision', async () => {
  const attempts = []
  const { app, state } = setup({
    submit: async (...args) => {
      attempts.push(args)
      if (attempts.length === 1) throw new SupportChatError(502)
      return conversation({ submission: { status: 'accepted', deliveryStatus: 'delivered' } })
    },
  })
  app.setConsent('usage', true)
  await app.send('usage')
  await app.submit('usage')
  assert.equal(state().submissionRevision, 1)
  await app.submit('usage')
  assert.deepEqual(attempts[1], attempts[0])
  assert.equal(state().conversation.submission.deliveryStatus, 'delivered')
})

test('delivery status fetch failure never removes an accepted inquiry', async () => {
  const { app, state } = setup({
    get: async () => {
      throw new SupportChatError(502)
    },
  })
  app.setConsent('usage', true)
  await app.send('usage')
  await app.submit('usage')
  await app.refresh('usage')
  assert.equal(state().conversation.submission.status, 'accepted')
  assert.equal(state().conversation.submission.deliveryStatus, 'pending')
  assert.match(state().error.message, /접수 내역은 유지/)
})

test('an unresolved submission blocks new turns until the same submission is recovered', async () => {
  let submissions = 0
  const { app, state, calls } = setup({
    submit: async () => {
      if (!submissions++) throw new SupportChatError(502)
      return conversation({ submission: { status: 'accepted', deliveryStatus: 'pending' } })
    },
  })
  app.setConsent('usage', true)
  await app.send('usage')
  await app.submit('usage')
  const originalError = state().error
  app.setDraft('usage', '접수 확인 전 추가 내용')
  await app.send('usage')
  assert.equal(calls.turn.length, 1)
  assert.equal(state().submissionRevision, 1)
  assert.equal(state().error, originalError)
  assert.equal(state().draft, '접수 확인 전 추가 내용')
  app.setDraft('usage', '')
  await app.submit('usage')
  assert.equal(state().submissionRevision, null)
  assert.equal(state().conversation.submission.status, 'accepted')
})

test('a stale submission refreshes the summary and requires explicit confirmation of its latest revision', async () => {
  const submissions = []
  const latest = conversation({
    revision: 2,
    draft: { title: '갱신된 문의', summary: '정정한 내용', conditions: [], additionalInfo: [] },
  })
  const { app, state } = setup({
    submit: async (id, revision) => {
      submissions.push(revision)
      if (submissions.length === 1) throw new SupportChatError(409, 'DRAFT_REQUIRED')
      return { ...latest, submission: { status: 'accepted', deliveryStatus: 'pending' } }
    },
    get: async () => latest,
  })
  app.setConsent('usage', true)
  await app.send('usage')
  await app.submit('usage')
  assert.equal(state().conversation.draft.summary, '정정한 내용')
  assert.equal(state().submissionRevision, null)
  assert.deepEqual(submissions, [1])
  await app.submit('usage')
  assert.deepEqual(submissions, [1, 2])
  assert.equal(state().conversation.submission.status, 'accepted')
})
