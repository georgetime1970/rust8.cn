<!-- 底部图片区 -->
<script setup lang="ts"></script>

<template>
  <div class="container">
    <img src="/assets/img/1.webp" alt="更易学" />
    <img src="/assets/img/2.webp" alt="更高效" />
    <img src="/assets/img/3.webp" alt="更完整" />
    <img src="/assets/img/4.webp" alt="更逻辑" />
  </div>
</template>

<style scoped>
.container {
  padding: 0 64px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;

  img {
    display: block;
    width: 280px;
    border-radius: 8px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 24px;
    flex-direction: column;
    img {
      width: 100%;
    }
  }
}
</style>
