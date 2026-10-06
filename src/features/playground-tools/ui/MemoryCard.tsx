'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Button, buttonVariants } from '@/shared/ui/Button'
import { CameraIcon, ShareIcon, PixelArrowRightIcon } from '@/shared/assets'
import { PHOTO_ACCEPT, preparePhoto } from '@/shared/lib/preparePhoto'
import { subscribeNativeCapabilities } from '@/shared/lib/nativeBridge'
import {
  MEMORY_THEMES,
  memoryFileName,
  todayLocalDate,
  validCardDate,
  memoryCardExportMode,
  type MemoryCardInput,
} from '../model/memoryCard'
import { currentToolOwner, useToolOwner } from '../model/useToolOwner'
import { cardBlob, drawMemoryCard, loadCardImage } from '../lib/drawMemoryCard'
import { ToolPage } from './ToolPage'
import styles from './Tools.module.css'

const inNativeApp = () =>
  Boolean((window as Window & { ReactNativeWebView?: unknown }).ReactNativeWebView)
function canShareFile(file: File) {
  try {
    return navigator.canShare?.({ files: [file] }) === true
  } catch {
    return false
  }
}

function CardMaker({ owner }: { owner: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const alive = useRef(true)
  const sequence = useRef(0)
  const busy = useRef(false)
  const [input, setInput] = useState<MemoryCardInput>(() => ({
    name: '',
    message: '',
    date: todayLocalDate(),
    theme: 'butter',
    zoom: 1,
    offsetX: 50,
    offsetY: 50,
  }))
  const [photo, setPhoto] = useState<{ image: HTMLImageElement; url: string } | null>(null)
  const [assets, setAssets] = useState<{
    logo: HTMLImageElement | null
    paw: HTMLImageElement | null
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [status, setStatus] = useState('')
  const [nativeExportUnavailable, setNativeExportUnavailable] = useState(false)
  const current = () => alive.current && currentToolOwner() === owner
  useEffect(() => {
    const update = () =>
      setNativeExportUnavailable(
        inNativeApp() && !canShareFile(new File(['png'], 'card.png', { type: 'image/png' })),
      )
    update()
    return subscribeNativeCapabilities(update)
  }, [])
  useEffect(() => {
    alive.current = true
    let cancelled = false
    void Promise.all([
      document.fonts.ready,
      loadCardImage('/images/logo/logo.svg').catch(() => null),
      loadCardImage('/images/category/cta-paw.svg').catch(() => null),
    ]).then(([, logo, paw]) => {
      if (!cancelled) setAssets({ logo, paw })
    })
    return () => {
      alive.current = false
      cancelled = true
      sequence.current += 1
    }
  }, [])
  useEffect(
    () => () => {
      if (photo) {
        URL.revokeObjectURL(photo.url)
        photo.image.src = ''
      }
    },
    [photo],
  )
  useEffect(() => {
    if (canvas.current)
      drawMemoryCard(
        canvas.current,
        photo?.image ?? null,
        input,
        assets?.logo ?? null,
        assets?.paw ?? null,
      )
  }, [photo, input, assets])
  const update = <K extends keyof MemoryCardInput>(key: K, value: MemoryCardInput[K]) => {
    setInput((previous) => ({ ...previous, [key]: value }))
    setStatus('')
  }
  async function choosePhoto(file: File | undefined) {
    if (!file) return
    const ticket = ++sequence.current
    setLoading(true)
    setStatus('')
    let url: string | undefined
    try {
      if (file.size > 20 * 1024 * 1024) throw new Error('사진은 20MB 이하로 골라주세요.')
      const prepared = await preparePhoto(file)
      if (!current() || ticket !== sequence.current) return
      url = URL.createObjectURL(prepared)
      const image = await loadCardImage(url)
      if (!current() || ticket !== sequence.current) {
        image.src = ''
        return
      }
      setPhoto({ image, url })
      url = undefined
      setInput((previous) => ({ ...previous, zoom: 1, offsetX: 50, offsetY: 50 }))
      setStatus('사진을 넣었어요. 위치와 문구를 다듬어보세요.')
    } catch (error) {
      if (current() && ticket === sequence.current)
        setStatus(
          error instanceof Error
            ? error.message
            : '사진을 읽지 못했어요. 다른 사진으로 다시 시도해 주세요.',
        )
    } finally {
      if (url) URL.revokeObjectURL(url)
      if (current() && ticket === sequence.current) setLoading(false)
    }
  }
  function removePhoto() {
    sequence.current += 1
    setPhoto(null)
    setLoading(false)
    setStatus('사진을 지웠어요.')
    if (fileInput.current) fileInput.current.value = ''
  }
  async function exportCard(share: boolean) {
    if (!canvas.current || !photo || loading || !assets || busy.current || !current()) return
    if (input.date && !validCardDate(input.date)) {
      setStatus('날짜를 다시 확인해 주세요.')
      return
    }
    busy.current = true
    setExporting(true)
    setStatus('')
    try {
      const blob = await cardBlob(canvas.current)
      if (!current()) return
      const file = new File([blob], memoryFileName(input.date), { type: 'image/png' })
      const mode = memoryCardExportMode(inNativeApp(), canShareFile(file), share)
      if (mode === 'unsupported') {
        setNativeExportUnavailable(true)
        setStatus('이 앱에서는 사진 파일 저장·공유를 지원하지 않아요.')
        return
      }
      if (mode === 'share') {
        await navigator.share({ files: [file], title: '우리 아이의 하루 · 포퐁' })
        if (current()) setStatus('공유를 마쳤어요.')
      } else {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = file.name
        document.body.appendChild(link)
        link.click()
        link.remove()
        // Safari may read the blob after the click returns. Release it after the download starts.
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
        setStatus(
          share
            ? '이 브라우저는 사진 공유를 지원하지 않아 PNG 다운로드를 시작했어요.'
            : 'PNG 다운로드를 시작했어요. 모바일에서는 파일 앱도 확인해 주세요.',
        )
      }
    } catch (error) {
      if (current())
        setStatus(
          error instanceof DOMException && error.name === 'AbortError'
            ? '공유를 취소했어요. 카드는 그대로 있어요.'
            : '저장·공유를 마치지 못했어요. PNG 저장을 다시 눌러주세요.',
        )
    } finally {
      busy.current = false
      if (current()) setExporting(false)
    }
  }
  const ready = !!photo && !!assets && !loading && !exporting && !nativeExportUnavailable
  return (
    <div className={styles.cardMaker}>
      <section className={styles.previewPanel} aria-label="추억 카드 미리보기">
        <div className={styles.previewLabel}>
          <span>오늘의 추억</span>
          <span>1080 × 1350 PNG</span>
        </div>
        <div className={`${styles.actions} ${styles.photoActions}`}>
          <Button
            intent="secondary"
            onClick={() => fileInput.current?.click()}
            disabled={exporting}
          >
            <CameraIcon aria-hidden className="size-5" />
            {loading ? '사진 준비 중…' : photo ? '사진 바꾸기' : '사진 고르기'}
          </Button>
          {(photo || loading) && (
            <button
              type="button"
              className={styles.textButton}
              onClick={removePhoto}
              disabled={exporting}
            >
              사진 지우기
            </button>
          )}
          <input
            ref={fileInput}
            type="file"
            accept={PHOTO_ACCEPT}
            className="sr-only"
            aria-label="추억 카드 사진 선택"
            tabIndex={-1}
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              void choosePhoto(file)
            }}
          />
        </div>
        <p className={styles.hint}>
          JPG·PNG·WEBP·HEIC 등 20MB 이하 · 움직이는 사진은 한 장으로 저장돼요.
        </p>
        {nativeExportUnavailable && (
          <p className={styles.hint}>
            이 앱에서는 사진 파일 저장·공유를 지원하지 않아요. PNG 저장은 브라우저에서 사용할 수
            있어요.
          </p>
        )}
        <canvas
          ref={canvas}
          className={styles.memoryCanvas}
          role="img"
          aria-label={`${input.name || '우리 아이'}의 하루, ${input.date}, ${input.message || '너와 함께여서 더 좋은 오늘'} 카드 미리보기`}
        />
        <p className={styles.storageNote}>
          사진은 이 화면에서만 사용해요.
          <br />
          서버에 올리지 않고, 나가면 사진과 입력 내용이 사라져요.
        </p>
      </section>
      <section className={styles.panel} aria-labelledby="memory-make">
        <span className={styles.eyebrow}>나만의 작은 기념품</span>
        <h2 id="memory-make" className={styles.sectionTitle}>
          우리 아이의 하루를 담아요
        </h2>
        <fieldset disabled={exporting} className={styles.fields}>
          <legend className="sr-only">카드 꾸미기</legend>
          <label htmlFor="memory-name">
            우리 아이 이름
            <input
              id="memory-name"
              value={input.name}
              maxLength={20}
              autoComplete="off"
              placeholder="예: 포미"
              onChange={(e) => update('name', e.target.value)}
            />
          </label>
          <label htmlFor="memory-date">
            기억하고 싶은 날
            <input
              id="memory-date"
              type="date"
              value={input.date}
              min="1900-01-01"
              max="2200-12-31"
              onChange={(e) => update('date', e.target.value)}
            />
          </label>
          <label htmlFor="memory-message">
            오늘의 한 문장
            <input
              id="memory-message"
              value={input.message}
              maxLength={44}
              autoComplete="off"
              placeholder="너와 함께여서 더 좋은 오늘"
              onChange={(e) => update('message', e.target.value)}
            />
            <small>{[...input.message].length}/44자</small>
          </label>
          <div>
            <span className={styles.fieldTitle}>카드 색상</span>
            <div className={styles.themeGrid}>
              {MEMORY_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  aria-pressed={input.theme === theme.id}
                  onClick={() => update('theme', theme.id)}
                  className={styles.theme}
                  style={{ '--theme-color': theme.background } as React.CSSProperties}
                >
                  <span aria-hidden />
                  {theme.name}
                </button>
              ))}
            </div>
          </div>
          {photo && (
            <details className={styles.cropControls}>
              <summary>사진 크기·위치 조절</summary>
              <label htmlFor="memory-zoom">
                확대
                <input
                  id="memory-zoom"
                  type="range"
                  min="1"
                  max="2.5"
                  step="0.05"
                  value={input.zoom}
                  onChange={(e) => update('zoom', Number(e.target.value))}
                />
              </label>
              <label htmlFor="memory-x">
                좌우 위치
                <input
                  id="memory-x"
                  type="range"
                  min="0"
                  max="100"
                  value={input.offsetX}
                  onChange={(e) => update('offsetX', Number(e.target.value))}
                />
              </label>
              <label htmlFor="memory-y">
                위아래 위치
                <input
                  id="memory-y"
                  type="range"
                  min="0"
                  max="100"
                  value={input.offsetY}
                  onChange={(e) => update('offsetY', Number(e.target.value))}
                />
              </label>
            </details>
          )}
        </fieldset>
        <div className={styles.exportActions}>
          <Button onClick={() => void exportCard(false)} disabled={!ready} width="fill">
            {exporting ? '카드 준비 중…' : 'PNG 저장'}
          </Button>
          <Button
            intent="secondary"
            onClick={() => void exportCard(true)}
            disabled={!ready}
            width="fill"
          >
            <ShareIcon aria-hidden className="size-5" />
            사진 공유
          </Button>
        </div>
        <p className={styles.status} role="status">
          {status || (!photo ? '사진을 고르면 카드 저장과 공유가 열려요.' : '')}
        </p>
        <div className={styles.nextStep}>
          <p>저장한 카드를 첨부해 오늘의 이야기를 나눠보세요.</p>
          <Link
            href="/community/write?experience=daily"
            className={buttonVariants({ intent: 'secondary', width: 'full' })}
          >
            저장한 카드로 이야기 쓰기
            <PixelArrowRightIcon aria-hidden className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
export function MemoryCard() {
  const owner = useToolOwner()
  return (
    <ToolPage
      title="오늘의 추억 카드"
      description="좋아하는 사진 한 장을, 오래 간직하고 싶은 한 장으로."
    >
      {owner === null ? (
        <p role="status">카드 꾸미기를 열고 있어요.</p>
      ) : (
        <CardMaker key={owner} owner={owner} />
      )}
    </ToolPage>
  )
}
