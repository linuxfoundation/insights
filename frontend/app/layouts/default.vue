<template>
  <main>
    <lfx-navbar />
    <slot />
    <lfx-toast theme="dark" />
  </main>
</template>
<script setup lang="ts">
import LfxNavbar from '~/components/shared/layout/navbar.vue';
import LfxToast from '~/components/uikit/toast/toast.vue';
</script>
