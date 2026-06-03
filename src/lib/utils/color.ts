export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16),
  ]
}

export function rgbDistance(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2)
}

function linearize(c: number): number {
  const v = c / 255
  return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92
}

function labF(t: number): number {
  return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116
}

export function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const rr = linearize(r)
  const gg = linearize(g)
  const bb = linearize(b)

  // sRGB -> XYZ (D65)
  const x = rr * 0.4124564 + gg * 0.3575761 + bb * 0.1804375
  const y = rr * 0.2126729 + gg * 0.7151522 + bb * 0.0721750
  const z = rr * 0.0193339 + gg * 0.1191920 + bb * 0.9503041

  // XYZ -> Lab (D65 white point)
  const fx = labF(x / 0.95047)
  const fy = labF(y / 1.00000)
  const fz = labF(z / 1.08883)

  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

export function deltaE76(lab1: [number, number, number], lab2: [number, number, number]): number {
  return Math.sqrt((lab1[0] - lab2[0]) ** 2 + (lab1[1] - lab2[1]) ** 2 + (lab1[2] - lab2[2]) ** 2)
}

export function getBrightness(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b
}
