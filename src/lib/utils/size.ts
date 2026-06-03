import { BEAD_SIZE_MM } from '../../types/pattern'

export function calcPhysicalSize(gridCount: number): number {
  return (gridCount * BEAD_SIZE_MM) / 10
}
