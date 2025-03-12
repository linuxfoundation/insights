<template>
  <main>
    <lfx-navbar />
    <slot />
    <lfx-toast theme="dark" />
    <div class="px-10 mx-auto max-w-3xl pb-6 pt-6">
      <div class="copyright-container">
        <p
          class="copyright text-xs text-center"
        >
          Copyright © 2025 The Linux Foundation®. All rights reserved.
          The Linux Foundation has registered trademarks and uses trademarks. For more details, including terms of use,
          <a
            href="https://www.linuxfoundation.org/legal/platform-use-agreement/"
            target="_blank"
            rel="noopener noreferrer"
          >Platform Usage</a>,
          <a
            href="https://www.linuxfoundation.org/legal/privacy-policy?hsLang=en"
            target="_blank"
            rel="noopener noreferrer"
          >Privacy Policy</a>,
          and <a
            href="https://www.linuxfoundation.org/legal/trademark-usage?hsLang=en"
            target="_blank"
            rel="noopener noreferrer"
          >Trademark Usage</a>,
          please see our <a
            href="https://www.linuxfoundation.org/legal/policies"
            target="_blank"
            rel="noopener noreferrer"
          >Policies</a> page.</p>
      </div>
    </div>
  </main>
<!--  <lfx-footer />-->
</template>

<script setup lang="ts">
import LfxNavbar from '~/components/shared/layout/navbar.vue';
import LfxToast from '~/components/uikit/toast/toast.vue';
// import '@linuxfoundation/lfx-ui-core';
</script>

<style lang="scss" scoped>
.copyright {
  color: #808b91;
  a{
    color: #5b6367;

    &:hover{
      @apply underline;
    }
  }
}
</style>
