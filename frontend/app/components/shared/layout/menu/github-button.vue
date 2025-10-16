<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="pt-2 lg:block hidden">
    <client-only>
      <a
        class="github-button"
        href="https://github.com/linuxfoundation/insights"
        data-show-count="true"
        aria-label="Star linuxfoundation/insights on GitHub"
        target="_blank"
        rel="noopener noreferrer"
      >Star</a>
    </client-only>
  </div>
  <div class="items-start lg:hidden flex h-9 pt-1">
    <a
      href="https://github.com/linuxfoundation/insights"
      target="_blank"
      rel="noopener noreferrer"
      class="c-menu-button"
    >
      <!-- <img
        src="~/assets/images/github.svg"
        alt="GitHub Logo"
        class="h-[18px] w-[18px]"
      > -->
      <lfx-icon
        name="github"
        type="brands"
      />
      GitHub
    </a>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';

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

<script lang="ts">
  export default {
    name: 'LfxMenuGithubButton'
  }
</script>
