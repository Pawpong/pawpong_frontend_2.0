const { test } = require('node:test')
const assert = require('node:assert/strict')
const { EventEmitter } = require('node:events')
const fs = require('node:fs')
const ts = require('typescript')

function load(path, dependencies = {}) {
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const output = {}
  new Function('exports', 'require', code)(output, (name) => dependencies[name])
  return output
}
const { deliverChatMessage, createClientMessageId } = load(
  'src/features/chat-realtime/model/chatDelivery.ts',
)
const { mergeChatMessages } = load('src/features/chat-realtime/model/mergeChatMessages.ts')
const payload = {
  roomId: 'room',
  content: 'draft',
  messageType: 'text',
  clientMessageId: 'attempt-1',
}
function setup() {
  const socket = new EventEmitter()
  socket.connected = true
  socket.timeout = () => ({
    volatile: {
      emit: (name, data, ack) => {
        socket.outgoing = { name, data, ack }
      },
    },
  })
  const controller = new AbortController()
  const send = () => deliverChatMessage(socket, payload, 'me', controller.signal)
  return { socket, controller, send }
}

test('sending waits for storage ACK, then removes echo/disconnect listeners', async () => {
  const { socket, send } = setup()
  let settled = false
  const result = send().then((value) => {
    settled = true
    return value
  })
  await Promise.resolve()
  assert.equal(settled, false)
  assert.equal(socket.outgoing.data.clientMessageId, 'attempt-1')
  socket.outgoing.ack(null, { success: true, messageId: 'saved' })
  assert.deepEqual(await result, { status: 'sent', messageId: 'saved' })
  assert.equal(socket.listenerCount('new_message'), 0)
  assert.equal(socket.listenerCount('disconnect'), 0)
})

test('old server echo works but unrelated sender, room and attempt cannot confirm', async () => {
  const { socket, send } = setup()
  let settled = false
  const result = send().then((value) => {
    settled = true
    return value
  })
  const echo = { ...payload, senderId: 'me', messageId: 'saved' }
  socket.emit('new_message', { ...echo, senderId: 'counterpart' })
  socket.emit('new_message', { ...echo, roomId: 'another' })
  socket.emit('new_message', { ...echo, clientMessageId: 'another' })
  await Promise.resolve()
  assert.equal(settled, false)
  delete echo.clientMessageId
  socket.emit('new_message', echo)
  assert.equal((await result).status, 'sent')
  socket.outgoing.ack(new Error('old server has no ACK'))
  assert.equal(socket.listenerCount('error'), 0)
})

test('disconnect, timeout, disposal and negative ACK never report a send as successful', async () => {
  for (const fail of [
    ({ socket }) => socket.emit('disconnect'),
    ({ socket }) => socket.outgoing.ack(new Error('timeout')),
    ({ controller }) => controller.abort(),
    ({ socket }) => socket.outgoing.ack(null, { success: false, error: 'room closed' }),
  ]) {
    const app = setup()
    const pending = app.send()
    fail(app)
    assert.notEqual((await pending).status, 'sent')
    assert.equal(app.socket.listenerCount('new_message'), 0)
    assert.equal(app.socket.outgoing.data.content, 'draft')
  }
})

test('retransmission keeps the caller clientMessageId and supports deduplicated ACK', async () => {
  const app = setup()
  const first = app.send()
  app.socket.outgoing.ack(new Error('response lost'))
  assert.equal((await first).status, 'unconfirmed')
  const retry = app.send()
  assert.equal(app.socket.outgoing.data.clientMessageId, 'attempt-1')
  app.socket.outgoing.ack(null, { success: true, messageId: 'original-storage-id' })
  assert.equal((await retry).messageId, 'original-storage-id')
})

test('new drafts with the same text do not reuse a previously confirmed attempt', async () => {
  const stored = []
  const outgoing = []
  const { useChatRoom } = load('src/features/chat-realtime/model/useChatRoom.ts', {
    react: {
      useCallback: (callback) => callback,
      useMemo: (calculate) => calculate(),
      useState: (value) => [value, () => {}],
    },
    '@tanstack/react-query': {
      useQuery: () => ({ data: stored }),
      useQueryClient: () => ({
        getQueryData: () => stored,
        invalidateQueries: () => Promise.resolve(),
      }),
    },
    '@/entities/chat': {
      chatQueries: {
        messages: () => ({ queryKey: ['messages'] }),
        rooms: () => ({ queryKey: ['rooms'] }),
      },
    },
    '@/shared/lib/useAccessToken': { useAccessToken: () => 'test-session' },
    './chatDelivery': { createClientMessageId },
    './mergeChatMessages': { mergeChatMessages },
    './useChatSocket': {
      useChatSocket: () => ({
        isConnected: true,
        sendMessage: async (message) => {
          outgoing.push(message)
          return { status: 'unconfirmed' }
        },
      }),
    },
  })
  const room = useChatRoom('room', 'me')
  assert.equal(await room.sendMessage('same', 'text', 'abandoned-draft'), false)
  stored.push({ clientMessageId: 'abandoned-draft', messageId: 'stored' })
  assert.equal(await room.sendMessage('other', 'text', 'another-draft'), false)
  assert.equal(await room.sendMessage('same', 'text', 'new-draft'), false)
  assert.equal(outgoing.length, 3)
  assert.equal(outgoing[2].clientMessageId, 'new-draft')
  assert.equal(await room.sendMessage('same', 'text', 'abandoned-draft'), true)
  assert.equal(outgoing.length, 3)
})

test('read state does not regress when a stale duplicate echo overlays REST recovery', () => {
  const read = { messageId: 'same', createdAt: '2026-01-01', isRead: true }
  const unread = { ...read, isRead: false }
  assert.deepEqual(mergeChatMessages([read], [unread]), [read])
  assert.deepEqual(mergeChatMessages([unread], [read]), [read])
})

test('generated request IDs are distinct UUIDs accepted by the optional server field', () => {
  const ids = new Set(Array.from({ length: 100 }, createClientMessageId))
  assert.equal(ids.size, 100)
  for (const id of ids)
    assert.match(id, /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/)
})
