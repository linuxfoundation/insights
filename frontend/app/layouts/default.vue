<template>
  <main>
    <lfx-navbar />
    <slot />
  </main>
</template>
<script setup lang="ts">
import LfxNavbar from "~/components/shared/layout/navbar.vue";
</script>
