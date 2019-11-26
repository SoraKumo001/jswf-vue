<template>
  <div>
    <div>コンポーネントテスト</div>
    <JSWindow title="タイトル1">
      ウインドウ1
    </JSWindow>
    <JSWindow
      title="タイトル2"
      :x="200"
      :y="300"
      :width="200"
      :height="200"
      :titleSize="64"
    >
      ウインドウ2
    </JSWindow>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import JSWindow from '../components/jswf/JSWindow/index.vue'
@Component({
  components: {
    JSWindow
  }
})
export default class Home extends Vue {
  private count: number = 0
  public greetText: string = 'Hello'
}
</script>

<style></style>
