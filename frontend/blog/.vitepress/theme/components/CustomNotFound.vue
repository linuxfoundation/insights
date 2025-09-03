<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="VPContent">
    <div class="NotFound">
      <p class="code">
        404
      </p>
      <h1 class="title">
        PAGE NOT FOUND
      </h1>
      <div class="divider" />
      <blockquote class="quote">
        But if you don't change your direction, and if you keep looking, you may end up where you are heading.
      </blockquote>
      <div class="action">
        <a
          class="link"
          href="/blog/introducing-insights"
          aria-label="go to home"
        >
          Take me home
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
.VPContent {
    padding-top: var(--vp-nav-height);
    margin: var(--vp-layout-top-height, 0px) auto 0;
    @apply flex-grow flex-shrink-0 w-full;
}

.NotFound {
    @apply text-center p-16 pb-24;
}

.code {
    @apply text-[64px] leading-[64px] font-semibold;
}

.title {
    @apply text-xl leading-5 font-bold pt-3 tracking-wide;
}
.divider {
    @apply mx-auto mt-6 mb-4 h-0.5 w-16;
    background-color: var(--vp-c-divider);
}
.quote {
    @apply my-0 mx-auto max-w-[256px] font-medium text-sm;
    color: var(--vp-c-text-2);
}
.action {
    @apply pt-5;
}
.link {
    @apply inline-block px-4 py-1 rounded-full text-sm font-medium transition-colors duration-200;
    border: 1px solid var(--vp-c-brand-1);
    color: var(--vp-c-brand-1);
}
</style>