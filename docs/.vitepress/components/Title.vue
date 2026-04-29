<script setup lang="ts"></script>

<template>
  <div class="container1">
    <span class="title">Rust八股文</span>
    <br />
    <span class="text">适合中国人的 Rust 教程</span>
  </div>
</template>

<style scoped>
.container1 {
  span {
    display: inline-block;
    font-weight: bold;
    line-height: 1;
  }

  .title {
    font-size: 3.5rem;
    background: var(--vp-home-hero-name-title-background);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .text {
    font-size: 3.125rem;
    margin-top: 0.625rem;
  }
}

@media (max-width: 768px) {
  .container {
    .title {
      display: none;
      font-size: 2rem;
    }
    .text {
      margin-top: -1rem;
      font-size: 1.5rem;
    }
  }
}
</style>
