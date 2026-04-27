import DefaultTheme from "vitepress/theme";
// @ts-ignore
import "./custom.css";
import MyLayout from "./MyLayout.vue";

// 通过<Layout/> 组件的插槽,在首页不位置中添加自定义组件
// 具体插槽位置请参考：https://vitepress.dev/zh/guide/extending-default-theme#layout-slots

export default {
  extends: DefaultTheme,
  Layout: MyLayout,
};
