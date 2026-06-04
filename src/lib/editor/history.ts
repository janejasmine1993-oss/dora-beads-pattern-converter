import type { PatternCell } from '../../types/pattern'

const MAX_HISTORY = 50

export interface CellHistory {
  stack: PatternCell[][]
  index: number
}

export function historyCreate(initial: PatternCell[]): CellHistory {
  return { stack: [initial], index: 0 }
}

export function historyPush(h: CellHistory, cells: PatternCell[]): CellHistory {
  const newStack = [...h.stack.slice(0, h.index + 1), cells]
  const trimmed = newStack.length > MAX_HISTORY ? newStack.slice(-MAX_HISTORY) : newStack
  return { stack: trimmed, index: trimmed.length - 1 }
}

export function historyUndo(h: CellHistory): [CellHistory, PatternCell[]] {
  const idx = Math.max(0, h.index - 1)
  return [{ ...h, index: idx }, h.stack[idx]]
}

export function historyRedo(h: CellHistory): [CellHistory, PatternCell[]] {
  const idx = Math.min(h.stack.length - 1, h.index + 1)
  return [{ ...h, index: idx }, h.stack[idx]]
}

export const canUndo = (h: CellHistory) => h.index > 0
export const canRedo = (h: CellHistory) => h.index < h.stack.length - 1
