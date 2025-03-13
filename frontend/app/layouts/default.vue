<template>
  <main>
    <lfx-navbar />
    <slot />
    <lfx-toast theme="dark" />
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
