<template>
  <main>
    <lfx-navbar />
    <slot />
    <lfx-toast theme="dark" />
    <client-only>
      <lfx-footer class="px-10 mx-auto max-w-3xl pb-6 pt-6" />
    </client-only>
  </main>
</template>

<script setup lang="ts">
import LfxNavbar from '~/components/shared/layout/navbar.vue';
import LfxToast from '~/components/uikit/toast/toast.vue';
// Only import the UI core library on the client side
if (import.meta.client) {
  await import('@linuxfoundation/lfx-ui-core');
}
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
