<template>
  <div
    :class="$style.jsWindow"
    :style="styleObject"
    @mousedown="onMouseDown"
    @touchstart="onMouseDown"
  >
    <Border
      v-for="item in borders"
      :key="item"
      :size="borderSize"
      :border-type="item"
    />
    <Title
      :active="active"
      :size="titleSize"
      :window-state="nowWindowState"
      @set-state="onWindowState"
    >
      {{ title }}
    </Title>
    <Client
      ref="clientRef"
      :titleSize="titleSize"
      :width="windowInfo.clientWidth"
      :height="windowInfo.clientHeight"
    >
      <slot />
    </Client>
  </div>
</template>

<script lang="ts">
import ResizeObserver from 'resize-observer-polyfill'
import { Component, Prop, Vue, Ref } from 'vue-property-decorator'
import { Manager } from '../lib/Manager'
import Title from './Title.vue'
import { Borders, BorderType, WindowInfo, WindowState } from './Declaration'
import Border from './Border.vue'
import Client from './Client.vue'

export interface JWFEvent extends Event {
  params?: unknown
}
interface MoveParams {
  px: number
  py: number
  pwidth: number
  pheight: number
}
export interface Point {
  x: number
  y: number
}
/**
 * サイズ設定用
 */
export interface Size {
  width: number
  height: number
}
export interface MovePoint {
  event: MouseEvent | TouchEvent
  basePoint: Point
  nowPoint: Point
  nodePoint: Point
  nodeSize: Size
  distance?: number
  radian?: number
}
@Component({
  components: { Title, Border, Client }
})
export default class JSWindow extends Vue {
  @Prop({ type: String, default: '' })
  private title!: string
  @Prop({ type: Number, default: null })
  private x!: number | null
  @Prop({ type: Number, default: null })
  private y!: number | null

  @Prop({ type: Number, default: 640 })
  private width!: number
  @Prop({ type: Number, default: 480 })
  private height!: number

  @Prop({ type: Number, default: 32 })
  titleSize!: number

  @Prop({ type: Boolean, default: true })
  overlapped!: boolean

  @Prop({ type: Boolean, default: false })
  moveable!: boolean
  @Prop({ type: Number, default: WindowState.NORMAL })
  windowState!: number
  private $style!: { [key: string]: string }
  private px!: number | null
  private py!: number | null
  private pwidth!: number
  private pheight!: number

  // @Prop({ type: Boolean, default: false })
  active: boolean = false
  titlePrmisson!: number

  borderSize: number = 8

  nowWindowState: number = this.windowState
  oldWindowState: number = WindowState.HIDE
  changeWindowState: number = WindowState.HIDE

  @Ref()
  private clientRef!: Vue
  private windowInfo: WindowInfo = {
    x: this.x,
    y: this.y,
    width: this.width,
    height: this.height,
    moveable: this.moveable,
    borderSize: this.borderSize,
    titleSize: this.titleSize,
    title: this.title,
    active: this.active,
    overlapped: this.overlapped,
    realX: this.x || 0,
    realY: this.y || 0,
    realWidth: this.width,
    realHeight: this.height,
    clientWidth: 0,
    clientHeight: 0,
    windowState: this.windowState,
    windowStyle: 0,
    realWindowState: this.changeWindowState,
    onUpdate: null,
    clientStyle: {}
  }
  private resizeObserver?: ResizeObserver
  private resizeHandle?: number

  private moveHandle?: number
  private moveParams?: MoveParams
  private updateInfoHandle?: number

  private borders = Borders

  private styleObject: Partial<CSSStyleDeclaration> = {}
  private onMouseDown(e: MouseEvent | TouchEvent) {
    if (Manager.moveNode == null) {
      this.foreground()
      if (this.moveable || Manager.frame) {
        Manager.moveNode = this.$el as HTMLElement
        const p = Manager.getPos((e as unknown) as MouseEvent | TouchEvent)
        Manager.baseX = p.x
        Manager.baseY = p.y
        Manager.nodeX = this.windowInfo.realX
        Manager.nodeY = this.windowInfo.realY
        Manager.nodeWidth = this.windowInfo.realWidth
        Manager.nodeHeight = this.windowInfo.realHeight
      }
    }
    e.stopPropagation()
  }
  private onFrame(e: MouseEvent | TouchEvent) {
    if (e.currentTarget && Manager.frame == null) {
      Manager.frame = (e.currentTarget as EventTarget & { id: string }).id
    }
  }
  /**
   *ウインドウをフォアグラウンドにする
   *
   * @memberof JswfWindow
   */
  foreground(): void {
    // Activeになるノードを取得
    const activeNodes = new Set<HTMLElement>()
    let node: (HTMLElement & { _symbol?: Symbol }) | null = this
      .$el as HTMLElement
    if (node) {
      let topNode: HTMLElement = node
      do {
        if (node._symbol instanceof JSWindow) {
          activeNodes.add(node)
          topNode = node
        }
      } while ((node = node.parentNode as HTMLElement))
      const parent = topNode.parentNode
      if (parent) {
        const sendActive = (node: HTMLElement & { _symbol?: Symbol }) => {
          if (node._symbol instanceof JSWindow) {
            const act = activeNodes.has(node)
            // if(node._symbol.state.active !== act)
            Manager.callEvent(node, 'active', act)
          }
          Array.prototype.forEach.call(node.childNodes, (node) => {
            sendActive(node as HTMLElement)
          })
        }
        sendActive(parent as HTMLElement)
      }
    }
  }
  mounted() {
    this.px = this.x
    this.py = this.y
    this.pwidth = this.width
    this.pheight = this.height
    this.nowWindowState = this.windowState

    const node: (HTMLElement & { _symbol?: JSWindow }) | null = this
      .$el as HTMLElement
    if (node) {
      node._symbol = this

      if (node.parentNode) {
        this.resizeObserver = new ResizeObserver(() => {
          this.onParentSize()
        })
        this.resizeObserver.observe(node.parentNode as Element)
      }

      node.addEventListener('move', this.onMove.bind(this))
      node.addEventListener('active', this.onActive.bind(this))
    }
    if (this.active!) {
      this.foreground()
    }
    this.update()
  }
  beforeUpdate() {
    this.update()
  }
  private onParentSize() {
    if (this.resizeHandle) {
      return
    }
    this.resizeHandle = window.setTimeout(() => {
      this.$forceUpdate()
      this.resizeHandle = undefined
    }, 10)
  }
  update() {
    const node: (HTMLElement & { _symbol?: JSWindow }) | null = this
      .$el as HTMLElement
    const clientNode: HTMLElement | null = this.clientRef.$el as HTMLElement
    let x: number,
      y: number,
      width: number,
      height: number,
      clientWidth: number,
      clientHeight: number
    if (node && clientNode) {
      node._symbol = this

      // 座標系リミットチェック
      const parent = node.parentNode as HTMLElement
      const parentWidth = this.overlapped
        ? window.innerWidth
        : parent.clientWidth
      const parentHeight = this.overlapped
        ? window.innerHeight
        : parent.clientHeight
      switch (this.changeWindowState) {
        case WindowState.MAX:
          x = 0
          y = 0
          width = parentWidth
          height = parentHeight
          clientWidth = parentWidth
          clientHeight = parentHeight - this.titleSize

          break
        case WindowState.MIN:
          width = this.pwidth
          height = this.titleSize
          if (this.px === null) {
            x = (parentWidth - width) / 2
          } else if (this.px < 0) {
            x = 0
          } else if (this.px + this.pwidth > parentWidth) {
            x = parentWidth - this.pwidth
          } else {
            x = this.px
          }
          if (this.py === null) {
            y = (parentHeight - height) / 2
          } else if (this.py < 0) {
            y = 0
          } else if (this.py + this.titleSize > parentHeight) {
            y = parentHeight - this.titleSize
          } else {
            y = this.py
          }
          clientWidth = this.pwidth
          clientHeight = 0
          break
        default:
          width = this.pwidth
          height = this.pheight
          if (width > parentWidth) {
            width = parentWidth
          }
          if (height > parentHeight) {
            height = parentHeight
          }
          if (this.px === null) {
            x = (parentWidth - width) / 2
          } else if (this.px < 0) {
            x = 0
          } else if (this.px + width > parentWidth) {
            x = parentWidth - width
          } else {
            x = this.px
          }
          if (this.py === null) {
            y = (parentHeight - height) / 2
          } else if (this.py < 0) {
            y = 0
          } else if (this.py + height > parentHeight) {
            y = parentHeight - height
          } else {
            y = this.py
          }
          clientWidth = width
          clientHeight = height - this.titleSize

          break
      }
    } else {
      x = this.px || 0
      y = this.py || 0
      width = this.pwidth
      height = this.pheight
      clientWidth = width
      clientHeight = height - this.titleSize
    }
    this.windowInfo = {
      ...this.windowInfo,
      x: this.px,
      y: this.py,
      width: this.pwidth,
      height: this.pheight,
      realX: x,
      realY: y,
      realWidth: width,
      realHeight: height,
      clientWidth,
      clientHeight,
      windowState: this.nowWindowState
    }

    this.styleObject = {
      width: width + 'px',
      height: height + 'px',
      left: x + 'px',
      top: y + 'px'
    }
    this.changeState()
  }
  private changeState() {
    if (this.oldWindowState === this.nowWindowState) {
      return
    }
    switch (this.nowWindowState) {
      case WindowState.NORMAL:
        this.normal()
        break
      case WindowState.MAX:
        this.max()
        break
      case WindowState.MIN:
        this.min()
        break
      case WindowState.HIDE:
        this.hide()
        break
    }
    this.oldWindowState = this.nowWindowState
  }
  private min() {
    const rootNode: HTMLElement | null = this.$el as HTMLElement
    const clientNode: HTMLElement | null = this.clientRef.$el as HTMLElement
    if (!rootNode || !clientNode) {
      return
    }
    if (this.oldWindowState === WindowState.MIN) {
      clientNode.style.animation = `${this.$style.MinRestoreClient} 0.1s ease 0s 1 alternate forwards`
      rootNode.style.animation = `${this.$style.MinRestoreRoot} 0.5s ease 0s 1 alternate forwards`
      this.changeWindowState = WindowState.NORMAL
      // this.$forceUpdate()
    } else {
      // rootNode.style.animation = "";
      // clientNode.style.animation = "";
      const animationProc = () => {
        this.changeWindowState = WindowState.MIN
        this.$forceUpdate()
        clientNode.removeEventListener('animationend', animationProc)

        setTimeout(() => {
          rootNode.style.animation = ''
          clientNode.style.animation = ''
        }, 1)
      }
      clientNode.addEventListener('animationend', animationProc)
      setTimeout(() => {
        rootNode.style.animation = `${this.$style.MinRoot} 0.5s ease 0s 1 forwards`
        clientNode.style.animation = `${this.$style.MinClient} 0.5s ease 0s 1 alternate forwards`
      }, 1)
    }
  }
  private max() {
    const node: HTMLElement | null = this.$el as HTMLElement
    if (!node) {
      return
    }
    node.style.animation = ''
    setTimeout(() => {
      this.changeWindowState = WindowState.MAX
      this.$forceUpdate()
      node.style.animation = `${this.$style.Max} 0.5s ease 0s 1 forwards`
    }, 1)
  }
  private normal() {
    if (this.oldWindowState === WindowState.MIN) {
      this.min()
    } else if (this.oldWindowState === WindowState.HIDE) {
      const node: HTMLElement | null = this.$el as HTMLElement
      if (!node) {
        return
      }
      const animationEnd = () => {
        node.removeEventListener('animationend', animationEnd)
        node.style.animation = ''
      }
      node.addEventListener('animationend', animationEnd)
      node.style.animation = `${this.$style.Show} 0.5s ease 0s none`
      node.style.visibility = 'visible'
      this.changeWindowState = WindowState.NORMAL
    } else {
      const node: HTMLElement | null = this.$el as HTMLElement
      if (!node) {
        return
      }
      node.style.animation = ''
      setTimeout(() => {
        this.changeWindowState = WindowState.NORMAL
        this.$forceUpdate()
        node.style.animation = `${this.$style.Restore} 0.5s ease 0s forwards`
      }, 1)
    }
  }
  private hide() {
    const node: HTMLElement | null = this.$el as HTMLElement
    if (!node) {
      return
    }
    node.style.animation = ''
    const animation = () => {
      node.removeEventListener('animationend', animation)
      this.changeWindowState = WindowState.HIDE
    }
    setTimeout(() => {
      node.addEventListener('animationend', animation)
      node.style.animation = `${this.$style.Hide} 0.5s ease 0s forwards`
    }, 1)
  }
  private onActive(e: Event & { params?: boolean }) {
    this.active = e.params === true
    const thisNode = this.$el as HTMLElement
    if (this.active) {
      const parent = thisNode.parentNode
      if (parent) {
        thisNode.style.zIndex = '99999'

        Array.prototype.slice
          .call(parent.childNodes, 0)
          .filter((node) => {
            return (
              (node as typeof node & { _symbol?: JSWindow })._symbol instanceof
              JSWindow
            )
          })
          .sort((a, b) => {
            const az = a.style.zIndex ? parseInt(a.style.zIndex) : 0
            const bz = b.style.zIndex ? parseInt(b.style.zIndex) : 0
            return az - bz
          })
          .forEach((node, index) => {
            node.style.zIndex = index.toString()
          })
      }
    }
  }
  private onWindowState(windowState: WindowState) {
    this.nowWindowState = windowState
    this.changeState()
  }
  private onMove(e: JWFEvent): void {
    // if (WindowManager.frame == null) return;
    if (this.nowWindowState === WindowState.MAX) {
      return
    }
    let [px, py, pwidth, pheight] = [
      this.px === null ? this.windowInfo.realX : this.px,
      this.py === null ? this.windowInfo.realY : this.py,
      this.pwidth,
      this.pheight
    ]
    const p = e.params as MovePoint
    if (p.distance) {
      const vx =
        Math.abs(Math.cos(p.radian!) * p.distance) * (p.distance < 0 ? -1 : 1)
      const vy =
        Math.abs(-Math.sin(p.radian!) * p.distance) * (p.distance < 0 ? -1 : 1)

      px = p.nodePoint.x - vx / 2
      py = p.nodePoint.y - vy / 2
      pwidth = Manager.nodeWidth + vx
      pheight = Manager.nodeHeight + vy
    } else {
      // 選択されている場所によって挙動を変える
      const frameIndex = Manager.frame || ''
      switch (frameIndex) {
        case 'TOP':
          py = p.nodePoint.y + p.nowPoint.y - p.basePoint.y
          pheight = Manager.nodeHeight - (p.nowPoint.y - p.basePoint.y)
          break
        case 'RIGHT':
          pwidth = Manager.nodeWidth + (p.nowPoint.x - p.basePoint.x)
          break
        case 'BOTTOM':
          pheight = Manager.nodeHeight + (p.nowPoint.y - p.basePoint.y)
          break
        case 'LEFT':
          px = p.nodePoint.x + p.nowPoint.x - p.basePoint.x
          pwidth = Manager.nodeWidth - (p.nowPoint.x - p.basePoint.x)
          break
        case 'LEFT-TOP':
          px = p.nodePoint.x + p.nowPoint.x - p.basePoint.x
          py = p.nodePoint.y + p.nowPoint.y - p.basePoint.y
          pwidth = Manager.nodeWidth - (p.nowPoint.x - p.basePoint.x)
          pheight = Manager.nodeHeight - (p.nowPoint.y - p.basePoint.y)
          break
        case 'RIGHT-TOP':
          py = p.nodePoint.y + p.nowPoint.y - p.basePoint.y
          pwidth = Manager.nodeWidth + (p.nowPoint.x - p.basePoint.x)
          pheight = Manager.nodeHeight - (p.nowPoint.y - p.basePoint.y)
          break
        case 'LEFT-BOTTOM':
          px = p.nodePoint.x + p.nowPoint.x - p.basePoint.x
          pwidth = Manager.nodeWidth - (p.nowPoint.x - p.basePoint.x)
          pheight = Manager.nodeHeight + (p.nowPoint.y - p.basePoint.y)
          break
        case 'RIGHT-BOTTOM':
          pwidth = Manager.nodeWidth + (p.nowPoint.x - p.basePoint.x)
          pheight = Manager.nodeHeight + (p.nowPoint.y - p.basePoint.y)
          break
        case 'TITLE':
          px = p.nodePoint.x + p.nowPoint.x - p.basePoint.x
          py = p.nodePoint.y + p.nowPoint.y - p.basePoint.y
          break
        default:
          // クライアント領域
          if (this.moveable) {
            px = p.nodePoint.x + p.nowPoint.x - p.basePoint.x
            py = p.nodePoint.y + p.nowPoint.y - p.basePoint.y
          } else {
            return
          }
      }
    }
    this.moveParams = {
      px,
      py,
      pheight,
      pwidth
    }

    if (!this.moveHandle) {
      this.moveHandle = window.setTimeout(() => {
        Object.assign(this, this.moveParams)
        this.$forceUpdate()
        this.moveHandle = undefined
      }, 10)
    }

    try {
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
      }
    } catch (e) {
      //
    }
  }
}
</script>

<style lang="scss" module>
$titleSize: 32px;
.jsWindow {
  position: fixed;
  border: solid 1px rgba(0, 0, 0, 0.4);
  box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.4);
  border-radius: 1em 1em 0 0;
}
@keyframes Show {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
@keyframes Hide {
  100% {
    opacity: 0;
    transform: scale(0);
  }

  0% {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes Max {
  0% {
    transform: scale(0.5);
  }

  100% {
    transform: scale(1);
  }
}
@keyframes Restore {
  0% {
    transform: scale(1.5);
  }

  100% {
    transform: scale(1);
  }
}
@keyframes MinRoot {
  100% {
    height: $titleSize;
  }
}

@keyframes MinClient {
  100% {
    height: 0px;
  }
}
@keyframes MinRestoreClient {
  0% {
    max-height: 0px;
  }
  100% {
    max-height: 100%;
  }
}
@keyframes MinRestoreRoot {
  0% {
    max-height: $titleSize;
  }
  100% {
    max-height: 100%;
  }
}
</style>
