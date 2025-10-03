<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<!-- .vitepress/theme/components/CustomNavbar.vue -->
<template>
  <header class="outline outline-1 outline-neutral-100 bg-white sticky top-0 left-0 z-40 wrapper">
    <div class="mx-auto wrapper-content">
      <div class="h-14 lg:h-17 flex justify-between items-center gap-4 lg:gap-5">
        <div class="flex items-center gap-6 flex-grow min-w-0">
          <a
            href="/blog/introducing-insights"
            target="_parent"
          >
            <img
              src="/images/logo-blog.svg"
              alt="LFX Insights"
              class="h-6 min-w-44 hidden xl:block"
            >
            <img
              src="/images/logo-mobile.svg"
              alt="LFX Insights"
              class="h-6 min-w-29 block xl:hidden"
            >
          </a>
          <VPNavBarSearch />
        </div>

        <div class="flex items-center gap-2">
          <a
            href="/docs/introduction/what-is-insights/"
            target="_parent"
            class="c-menu-button"
          >
            <i
              class="fa-book-open fa-light text-base w-4 h-4"
            />
            Docs
          </a>
          <a
            href="/"
            target="_parent"
            class="c-menu-button"
          >
            <i
              class="fa-arrow-turn-left fa-light text-base w-4 h-4"
            />
            Back to LF Insights
          </a>
        </div>

        <div>
          <div class="pt-2 xl:block lg:hidden block">
            <client-only>
              <a 
                class="github-button" 
                href="https://github.com/linuxfoundation/insights" 
                data-show-count="true" 
                aria-label="Star linuxfoundation/insights on GitHub"
                target="_blank"
              />
            </client-only>
          </div>
          <div class="items-start xl:hidden lg:flex hidden h-9 pt-1">
            <a
              href="https://github.com/linuxfoundation/insights"
              target="_blank"
              class="h-[18px] w-[18px]"
            >
              <img
                src="/images/github.svg"
                alt="GitHub Logo"
                class="w-full"
              >
            </a>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { VPNavBarSearch } from 'vitepress/theme'
import { onMounted } from 'vue';

onMounted(() => {
  const scriptSrc = 'https://buttons.github.io/buttons.js'
  // GitHub buttons script adds the functionality
  // Adding check to prevent adding the script twice that causes the error
  if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
    const script = document.createElement('script')
    script.setAttribute('src', scriptSrc)
    script.setAttribute('async', '')
    script.setAttribute('defer', '')
    document.body.appendChild(script)
  }
})
</script>

<style lang="scss" scoped>
@media (min-width: 768px) {
    .wrapper {
      @apply px-8;
    }
}

.wrapper-content {
  max-width: calc(var(--vp-layout-max-width) - 64px);
}
</style>
