<template>
  <div
    :class="$style.border"
    :style="styleObject"
    @touchstart="onFrame"
    @mousedown="onFrame"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Manager } from '../lib/Manager'
import { WindowState, Borders, BorderType } from './Declaration'

@Component({
  components: {}
})
export default class Border extends Vue {
  @Prop({ type: Number, default: 8 })
  private size!: number
  @Prop({ type: String, default: '' })
  private borderType!: string
  private styleObject: Partial<CSSStyleDeclaration> = {}
  beforeUpdate() {
    this.update()
  }
  mounted() {
    this.update()
  }
  update() {
    switch (this.borderType) {
      case 'TOP':
        this.styleObject = {
          cursor: 'n-resize',
          left: '0px',
          top: `-${this.size}px`,
          right: '0px',
          height: `${this.size}px`
        }
        break
      case 'RIGHT':
        this.styleObject = {
          cursor: 'e-resize',
          top: '0px',
          right: `-${this.size}px`,
          bottom: '0px',
          width: `${this.size}px`
        }
        break
      case 'BOTTOM':
        this.styleObject = {
          cursor: 's-resize',
          left: '0px',
          right: '0px',
          bottom: `-${this.size}px`,
          height: `${this.size}px`
        }
        break
      case 'LEFT':
        this.styleObject = {
          cursor: 'w-resize',
          top: '0px',
          left: `-${this.size}px`,
          bottom: '0px',
          width: `${this.size}px`
        }
        break
      case 'LEFT-TOP':
        this.styleObject = {
          cursor: 'nw-resize',
          left: `-${this.size}px`,
          top: `-${this.size}px`,
          width: `${this.size}px`,
          height: `${this.size}px`
        }
        break
      case 'RIGHT-TOP':
        this.styleObject = {
          cursor: 'ne-resize',
          right: `-${this.size}px`,
          top: `-${this.size}px`,
          width: `${this.size}px`,
          height: `${this.size}px`
        }
        break
      case 'LEFT-BOTTOM':
        this.styleObject = {
          cursor: 'sw-resize',
          left: `-${this.size}px`,
          bottom: `-${this.size}px`,
          width: `${this.size}px`,
          height: `${this.size}px`
        }
        break
      case 'RIGHT-BOTTOM':
        this.styleObject = {
          cursor: 'se-resize',
          right: `-${this.size}px`,
          bottom: `-${this.size}px`,
          width: `${this.size}px`,
          height: `${this.size}px`
        }
        break
    }
  }
  private onFrame(e: MouseEvent | TouchEvent) {
    if (Manager.frame == null) {
      Manager.frame = this.borderType
    }
  }
}
</script>

<style lang="scss" module>
.border {
  background-color: rgba(0, 0, 0, 0.05);
  position: absolute;
  user-select: none;
  &:active {
    background-color: rgba(0, 0, 0, 0.05);
  }
}
</style>
