<!-- 这是自定义布局组件,可以在这里添加自定义的首页布局内容
 https://vitepress.dev/zh/guide/extending-default-theme#layout-slots -->
<script setup>
import DefaultTheme from "vitepress/theme";
// import Features from "../components/Features.vue";
import Title from "../components/Title.vue";

const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <!-- 改为原生 features 增加首页加载速度 -->
    <!-- <template #home-features-before>
      <Features></Features>
    </template> -->
    <template #home-hero-info-before> <Title></Title> </template>
  </Layout>
</template>
