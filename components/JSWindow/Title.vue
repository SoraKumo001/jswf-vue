<template>
  <div
    :class="$style.title"
    :style="styleObject"
    @touchstart="onFrame"
    @mousedown="onFrame"
  >
    <div :id="$style.text">
      <slot />
    </div>
    <div :id="$style.icons">
      <div :id="$style.min" :style="styleIcons" @click="onIconClick" />
      <div
        v-if="windowState !== 2"
        :id="$style.max"
        :style="styleIcons"
        @click="onIconClick"
      />
      <div
        v-if="windowState === 2"
        :id="$style.normal"
        :style="styleIcons"
        @click="onIconClick"
      />
      <div :id="$style.close" :style="styleIcons" @click="onIconClick" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Manager } from '../lib/Manager'
import { WindowState } from './Declaration'

@Component({
  components: {}
})
export default class Title extends Vue {
  @Prop({ type: Number, default: 32 })
  private size!: number
  @Prop({ type: Number, default: WindowState.NORMAL })
  private windowState!: WindowState
  @Prop({ type: Boolean, default: false })
  private active!: boolean
  private styleIcons: Partial<CSSStyleDeclaration> = {
    width: this.size - 2 + 'px',
    height: this.size - 2 + 'px'
  }
  private styleObject: Partial<CSSStyleDeclaration> = {
    height: this.size + 'px',
    backgroundColor: this.active
      ? 'rgba(50,100,255,0.9)'
      : 'rgba(100,150,255,0.9)',
    color: this.active ? 'white' : '#eeeeee'
  }

  private width: number = 640
  private height: number = 480
  public setActive(flag: boolean) {
    this.styleObject.backgroundColor = flag
      ? 'rgba(50,100,255,0.9)'
      : 'rgba(100,150,255,0.9)'
    this.styleObject.color = flag ? 'white' : '#eeeeee'
  }
  public mounted() {
    this.update()
  }
  public beforeUpdate() {
    this.update()
  }
  public update() {
    this.styleObject = {
      height: this.size + 'px',
      backgroundColor: this.active
        ? 'rgba(50,100,255,0.9)'
        : 'rgba(100,150,255,0.9)',
      color: this.active ? 'white' : '#eeeeee'
    }
    this.styleIcons = {
      width: this.size - 2 + 'px',
      height: this.size - 2 + 'px'
    }
  }
  private onFrame(e: MouseEvent | TouchEvent) {
    if (Manager.frame == null) {
      Manager.frame = 'TITLE'
    }
  }
  private onIconClick(e: MouseEvent) {
    const node = e.target
    if (node instanceof HTMLDivElement) {
      let state: WindowState | undefined
      switch (node.id) {
        case 'min':
          state =
            this.windowState === WindowState.MIN
              ? WindowState.NORMAL
              : WindowState.MIN
          break
        case 'max':
          state = WindowState.MAX
          break
        case 'normal':
          state = WindowState.NORMAL
          break
        case 'close':
          state = WindowState.HIDE
          break
      }
      if (state) {
        this.$emit('set-state', state)
      }
    }
  }
}
</script>

<style lang="scss" module>
.title {
  user-select: none;
  display: flex;
  position: absolute;
  cursor: move;
  overflow: hidden;
  border-left: 0.5px solid rgba(0, 0, 0, 0.4);
  border-right: 0.5px solid rgba(0, 0, 0, 0.4);
  border-top: 0.5px solid rgba(0, 0, 0, 0.4);
  box-sizing: border-box;
  border-radius: 0.8em 0.8em 0 0;

  left: -1px;
  top: -1px;
  right: -1px;

  > #text {
    flex: 1;
    overflow: hidden;
    font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande',
      'Lucida Sans', Arial, sans-serif;
    font-size: 24px;
    padding: 0px 0.5em;
    align-items: center;
    display: flex;
    white-space: nowrap;
  }
  > #icons {
    > div {
      display: inline-block;
      cursor: default;
      margin: 0.1em;
      background-size: 100% 100%;
      &:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
      &#min {
        background-image: url(./images/min.svg);
      }
      &#max {
        background-image: url(./images/max.svg);
      }
      &#normal {
        background-image: url(./images/normal.svg);
      }
      &#close {
        background-image: url(./images/close.svg);
      }
    }
  }
}
</style>
