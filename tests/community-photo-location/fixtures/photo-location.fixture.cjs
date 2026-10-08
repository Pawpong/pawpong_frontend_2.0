function photoWithGps(jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xd9]), south = false, west = false) {
  const tiff = Buffer.alloc(128)
  tiff.write('II', 0)
  tiff.writeUInt16LE(42, 2)
  tiff.writeUInt32LE(8, 4)
  tiff.writeUInt16LE(1, 8)
  tiff.writeUInt16LE(0x8825, 10)
  tiff.writeUInt16LE(4, 12)
  tiff.writeUInt32LE(1, 14)
  tiff.writeUInt32LE(26, 18)
  tiff.writeUInt16LE(4, 26)
  const entry = (offset, tag, type, count, value) => {
    tiff.writeUInt16LE(tag, offset)
    tiff.writeUInt16LE(type, offset + 2)
    tiff.writeUInt32LE(count, offset + 4)
    tiff.writeUInt32LE(value, offset + 8)
  }
  entry(28, 1, 2, 2, (south ? 'S' : 'N').charCodeAt(0))
  entry(40, 2, 5, 3, 80)
  entry(52, 3, 2, 2, (west ? 'W' : 'E').charCodeAt(0))
  entry(64, 4, 5, 3, 104)
  ;[37, 30, 0, 127, 0, 0].forEach((value, index) => {
    tiff.writeUInt32LE(value, 80 + index * 8)
    tiff.writeUInt32LE(1, 84 + index * 8)
  })
  const payload = Buffer.concat([Buffer.from('Exif\0\0'), tiff])
  const marker = Buffer.from([0xff, 0xe1, 0, 0])
  marker.writeUInt16BE(payload.length + 2, 2)
  return Buffer.concat([jpeg.subarray(0, 2), marker, payload, jpeg.subarray(2)])
}
module.exports = { photoWithGps }
