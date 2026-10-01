/** 원본·EXIF 대신 분류에 필요한 첫 사진의 작은 JPEG만 전송한다. */
export async function categoryThumbnail(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file)
  const image = new Image()
  const canvas = document.createElement('canvas')
  try {
    image.src = url
    await image.decode()
    const ratio = Math.min(1, 768 / Math.max(image.naturalWidth, image.naturalHeight))
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('사진을 확인하지 못했어요.')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size > 1024 * 1024) reject(new Error('사진을 확인하지 못했어요.'))
          else resolve(blob)
        },
        'image/jpeg',
        0.8,
      )
    })
  } finally {
    URL.revokeObjectURL(url)
    image.src = ''
    canvas.width = canvas.height = 0
  }
}
