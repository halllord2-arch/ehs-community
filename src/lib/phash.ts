import { Jimp, intToRGBA } from 'jimp'

const HASH_SIZE = 8
const DUPLICATE_THRESHOLD = 10

export async function computePHash(imageBuffer: Buffer): Promise<string> {
  const image = await Jimp.read(imageBuffer)
  image.resize({ w: HASH_SIZE + 1, h: HASH_SIZE })
  image.greyscale()

  const bits: number[] = []
  for (let y = 0; y < HASH_SIZE; y++) {
    for (let x = 0; x < HASH_SIZE; x++) {
      const left = intToRGBA(image.getPixelColor(x, y)).r
      const right = intToRGBA(image.getPixelColor(x + 1, y)).r
      bits.push(left < right ? 1 : 0)
    }
  }

  const bytes = new Uint8Array(HASH_SIZE * HASH_SIZE / 4)
  for (let i = 0; i < bits.length; i++) {
    if (bits[i]) bytes[Math.floor(i / 4)] |= 1 << (3 - (i % 4))
  }
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function hammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) return Infinity
  let distance = 0
  for (let i = 0; i < hash1.length; i += 2) {
    let xor = parseInt(hash1.slice(i, i + 2), 16) ^ parseInt(hash2.slice(i, i + 2), 16)
    while (xor) { distance += xor & 1; xor >>= 1 }
  }
  return distance
}

export function isDuplicate(hash1: string, hash2: string): boolean {
  return hammingDistance(hash1, hash2) <= DUPLICATE_THRESHOLD
}
