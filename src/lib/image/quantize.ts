/**
 * Median-cut color quantization.
 * Deterministic (no random seed), stable results for the same input.
 *
 * Returns an array of the same length as `pixels`, where each element is the
 * cluster-center (representative) color for that pixel.  Transparent pixels
 * must be filtered out by the caller before passing to this function.
 */
export function quantizeColors(
  pixels: [number, number, number][],
  maxColors: number
): [number, number, number][] {
  const N = pixels.length
  if (N === 0) return []
  const K = Math.max(1, Math.min(maxColors, N))
  if (K >= N) return pixels.slice()

  // Work with index arrays to avoid copying pixel data
  type Bucket = number[]  // indices into `pixels`

  function getChannelRange(bucket: Bucket): [number, 0 | 1 | 2] {
    let rMin = 255, rMax = 0, gMin = 255, gMax = 0, bMin = 255, bMax = 0
    for (const i of bucket) {
      const [r, g, b] = pixels[i]
      if (r < rMin) rMin = r; if (r > rMax) rMax = r
      if (g < gMin) gMin = g; if (g > gMax) gMax = g
      if (b < bMin) bMin = b; if (b > bMax) bMax = b
    }
    const rr = rMax - rMin, gr = gMax - gMin, br = bMax - bMin
    if (rr >= gr && rr >= br) return [rr, 0]
    if (gr >= br) return [gr, 1]
    return [br, 2]
  }

  function avgColor(bucket: Bucket): [number, number, number] {
    let r = 0, g = 0, b = 0
    for (const i of bucket) { r += pixels[i][0]; g += pixels[i][1]; b += pixels[i][2] }
    const n = bucket.length
    return [Math.round(r / n), Math.round(g / n), Math.round(b / n)]
  }

  // Start with all pixels in one bucket
  let buckets: Bucket[] = [pixels.map((_, i) => i)]

  while (buckets.length < K) {
    // Find the bucket with the largest color range
    let largestIdx = 0
    let largestRange = -1
    for (let i = 0; i < buckets.length; i++) {
      if (buckets[i].length <= 1) continue
      const [range] = getChannelRange(buckets[i])
      if (range > largestRange) { largestRange = range; largestIdx = i }
    }
    if (largestRange <= 0) break  // all remaining buckets are single-color

    const bucket = buckets[largestIdx]
    const [_, ch] = getChannelRange(bucket)

    // Sort by the chosen channel and split at median
    bucket.sort((a, b) => pixels[a][ch] - pixels[b][ch])
    const mid = Math.floor(bucket.length / 2)
    buckets.splice(largestIdx, 1, bucket.slice(0, mid), bucket.slice(mid))
  }

  // Compute each bucket's average color and assign to all its pixels
  const result: [number, number, number][] = new Array(N)
  for (const bucket of buckets) {
    const center = avgColor(bucket)
    for (const idx of bucket) result[idx] = center
  }
  return result
}
