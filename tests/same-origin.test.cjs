const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const { NextRequest } = require('next/server')

const output = {}
new Function(
  'exports',
  ts.transpileModule(fs.readFileSync('src/shared/lib/server/sameOrigin.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
)(output)
const { isSameOriginRequest } = output

test('bound Next server accepts the real browser host including Android emulator and IPv6', () => {
  for (const host of ['localhost:3000', '127.0.0.1:3000', '10.0.2.2:3000', '[::1]:3000']) {
    assert.equal(
      isSameOriginRequest(
        new NextRequest('http://0.0.0.0:3000/api/auth/review-login', {
          headers: { host, origin: `http://${host}`, 'sec-fetch-site': 'same-origin' },
        }),
      ),
      true,
    )
  }
})

test('production and preview origins match the public Host with its protocol', () => {
  for (const host of ['pawpong.kr', 'dev.pawpong.kr', 'preview-pawpong.vercel.app']) {
    assert.equal(
      isSameOriginRequest(
        new NextRequest('https://internal:3000/api/account-deletion', {
          headers: { host, origin: `https://${host}` },
        }),
      ),
      true,
    )
  }
})

test('different host, port, protocol, null origin, and cross-site metadata remain rejected', () => {
  for (const origin of [
    'https://evil.example',
    'https://pawpong.kr.evil.example',
    'http://pawpong.kr',
    'https://pawpong.kr:444',
    'null',
  ]) {
    assert.equal(
      isSameOriginRequest(
        new NextRequest('https://pawpong.kr/api/account-deletion', {
          headers: { host: 'pawpong.kr', origin },
        }),
      ),
      false,
    )
  }
  assert.equal(
    isSameOriginRequest(
      new NextRequest('https://pawpong.kr/api/account-deletion', {
        headers: {
          host: 'pawpong.kr',
          origin: 'https://pawpong.kr',
          'sec-fetch-site': 'cross-site',
        },
      }),
    ),
    false,
  )
})

test('forwarded host cannot override the real target and malformed Host values fail closed', () => {
  assert.equal(
    isSameOriginRequest(
      new NextRequest('https://pawpong.kr/api/account-deletion', {
        headers: {
          host: 'pawpong.kr',
          'x-forwarded-host': 'evil.example',
          origin: 'https://evil.example',
        },
      }),
    ),
    false,
  )
  for (const host of [
    'evil.example@pawpong.kr',
    'pawpong.kr/path',
    'pawpong.kr,evil.example',
    'pawpong.kr?ignored',
    'pawpong.kr\\evil',
  ]) {
    assert.equal(
      isSameOriginRequest(
        new NextRequest('https://pawpong.kr/api/account-deletion', {
          headers: { host, origin: 'https://pawpong.kr' },
        }),
      ),
      false,
    )
  }
})

test('optional Origin remains compatible while explicit cross-site requests stay blocked', () => {
  assert.equal(
    isSameOriginRequest(new NextRequest('https://pawpong.kr/api/account-deletion')),
    true,
  )
  assert.equal(
    isSameOriginRequest(
      new NextRequest('https://pawpong.kr/api/account-deletion', {
        headers: { 'sec-fetch-site': 'cross-site' },
      }),
    ),
    false,
  )
})
