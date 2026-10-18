import {
  MEMORY_CARD_SIZE,
  MEMORY_THEMES,
  formatCardDate,
  normalizeCardText,
  photoCrop,
  type MemoryCardInput,
} from '../model/memoryCard'
export { loadPhotoImage as loadCardImage } from '@/shared/lib/preparePhoto'
function fitText(
  ctx: CanvasRenderingContext2D,
  value: string,
  size: number,
  width: number,
  family: string,
  weight = '700',
) {
  let actual = size
  ctx.font = `${weight} ${actual}px ${family}`
  while (actual > 16 && ctx.measureText(value).width > width) {
    actual -= 1
    ctx.font = `${weight} ${actual}px ${family}`
  }
}
export function drawMemoryCard(
  canvas: HTMLCanvasElement,
  photo: HTMLImageElement | null,
  input: MemoryCardInput,
  logo: HTMLImageElement | null,
  paw: HTMLImageElement | null,
) {
  canvas.width = MEMORY_CARD_SIZE.width
  canvas.height = MEMORY_CARD_SIZE.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('이 브라우저에서 카드를 만들 수 없습니다.')
  const theme = MEMORY_THEMES.find((t) => t.id === input.theme) ?? MEMORY_THEMES[0]
  const fonts = getComputedStyle(canvas)
  const sans = fonts.getPropertyValue('--font-pretendard').trim() || 'sans-serif'
  const display = fonts.getPropertyValue('--font-cafe24proup').trim() || sans
  const width = canvas.width
  ctx.fillStyle = theme.background
  ctx.fillRect(0, 0, width, canvas.height)
  // Native rectangles keep the small pixel details crisp in the exported PNG.
  ctx.fillStyle = theme.soft
  for (const [x, y] of [
    [20, 25],
    [964, 105],
    [960, 1216],
    [8, 1060],
  ]) {
    ctx.fillRect(x + 24, y, 24, 72)
    ctx.fillRect(x, y + 24, 72, 24)
  }
  ctx.fillStyle = theme.accent
  ctx.fillRect(52, 52, 976, 1250)
  ctx.fillStyle = theme.paper
  ctx.fillRect(60, 60, 960, 1234)
  ctx.fillStyle = theme.accent
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `700 22px ${sans}`
  ctx.fillText('함께한 순간을 모아요', 540, 112)
  const name = normalizeCardText(input.name, 20) || '우리 아이'
  fitText(ctx, `${name}의 하루`, 54, 800, display)
  ctx.fillText(`${name}의 하루`, 540, 182)
  const date = formatCardDate(input.date)
  ctx.font = `600 24px ${sans}`
  ctx.fillText(date, 540, 237)
  ctx.fillStyle = theme.soft
  ctx.fillRect(116, 289, 864, 864)
  ctx.fillStyle = theme.accent
  ctx.fillRect(108, 280, 864, 864)
  ctx.fillStyle = theme.background
  ctx.fillRect(116, 288, 848, 848)
  if (photo) {
    const crop = photoCrop(
      photo.naturalWidth,
      photo.naturalHeight,
      input.zoom,
      input.offsetX,
      input.offsetY,
    )
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(photo, crop.x, crop.y, crop.size, crop.size, 120, 292, 840, 840)
  } else {
    if (paw) {
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(paw, 450, 620, 180, 180)
    }
    ctx.fillStyle = theme.accent
    ctx.font = `500 27px ${sans}`
    ctx.fillText('우리 아이의 사진을 골라주세요', 540, 870)
  }
  ctx.fillStyle = theme.accent
  const message = normalizeCardText(input.message, 44) || '너와 함께여서 더 좋은 오늘'
  fitText(ctx, message, 29, 828, sans, '600')
  ctx.fillText(message, 540, 1194)
  if (logo) ctx.drawImage(logo, 473, 1235, 134, (134 * logo.naturalHeight) / logo.naturalWidth)
  else {
    ctx.font = `700 22px ${sans}`
    ctx.fillText('PAWPONG', 540, 1263)
  }
}

export function cardBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error('카드 저장을 준비하지 못했습니다. 다시 시도해 주세요.')),
      'image/png',
    ),
  )
}
