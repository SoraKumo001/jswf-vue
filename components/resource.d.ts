declare module "*.svg" {
  const content: any;
  export default content;
}
declare module "*.scss" {
  const content: any;
  export default content;
}

declare module "*.vue" {
  import Vue from "vue";
  const _default: Vue;
  export default _default;
}