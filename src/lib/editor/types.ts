export type EditorTool =
  | 'select'
  | 'eyedropper'
  | 'brush'
  | 'eraser'
  | 'fill'
  | 'fill-erase'

export interface SelectionRect {
  minRow: number
  minCol: number
  maxRow: number
  maxCol: number
}

export const TOOL_LABELS: Record<EditorTool, string> = {
  select: '选区',
  eyedropper: '吸色',
  brush: '画笔',
  eraser: '橡皮',
  fill: '填充',
  'fill-erase': '删除填充',
}

export const TOOL_CURSORS: Record<EditorTool, string> = {
  select: 'crosshair',
  eyedropper: 'crosshair',
  brush: 'crosshair',
  eraser: 'cell',
  fill: 'crosshair',
  'fill-erase': 'crosshair',
}
