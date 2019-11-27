<template>
  <div :class="$style.client" :style="styleObject">
    <slot />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { WindowState, Borders, BorderType } from './Declaration'

@Component({
  components: {}
})
export default class Client extends Vue {
  private styleObject: Partial<CSSStyleDeclaration> = {}
  @Prop({ type: Number })
  private titleSize!: number
  @Prop({ type: Number })
  private width!: number
  @Prop({ type: Number })
  private height!: number
  beforeUpdate() {
    this.update()
  }
  mounted() {
    this.update()
  }
  update() {
    this.styleObject = {
      top: this.titleSize + 'px',
      width: this.width + 'px',
      height: this.height + 'px'
    }
  }
}
</script>

<style lang="scss" module>
.client {
  background: whitesmoke;
  position: absolute;
  overflow: hidden;
  right: 0;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  height: 0;
}
</style>
