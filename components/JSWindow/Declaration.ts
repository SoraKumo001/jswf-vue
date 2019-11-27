export enum WindowState {
  NORMAL = 1,
  MAX,
  MIN,
  HIDE
}
export enum WindowStyle {
  TITLE = 1,
  MAX = 2,
  MIN = 4,
  CLOSE = 8,
  FRAME = 16,
  RESIZE = 32
}
export interface WindowProps {
  x: number | null
  y: number | null
  width: number
  height: number
  moveable: boolean
  borderSize: number
  titleSize: number
  title: string
  active: boolean
  overlapped: boolean
  windowStyle: number
  windowState: WindowState
  onUpdate: ((status: WindowInfo) => void) | null
  clientStyle: Partial<CSSStyleDeclaration>
}
export interface WindowInfo extends NonNullable<WindowProps> {
  realX: number
  realY: number
  realWidth: number
  realHeight: number
  realWindowState: WindowState
  clientWidth: number
  clientHeight: number
}

export const Borders = [
  'TOP',
  'RIGHT',
  'BOTTOM',
  'LEFT',
  'LEFT-TOP',
  'RIGHT-TOP',
  'LEFT-BOTTOM',
  'RIGHT-BOTTOM'
] as const

export type BorderType = typeof Borders[keyof typeof Borders extends number
  ? keyof typeof Borders
  : never]
