<template>
  <main>
    <lfx-navbar />
    <slot />
    <lfx-toast theme="dark" />
    <lfx-footer class="px-10 mx-auto max-w-3xl pb-6 pt-6" />
  </main>
</template>
<script setup lang="ts">
import LfxNavbar from '~/components/shared/layout/navbar.vue';
import LfxToast from '~/components/uikit/toast/toast.vue';
import '@linuxfoundation/lfx-ui-core';
</script>
