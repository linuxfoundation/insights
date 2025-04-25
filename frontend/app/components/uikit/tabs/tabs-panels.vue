<template>
  <section class="p-tabs-panels">
    <lfx-card>
      <slot />
    </lfx-card>
  </section>
</template>

<script setup lang="ts">
import LfxCard from '~/components/uikit/card/card.vue';
</script>

<script lang="ts">
export default {
  name: 'LfxTabsPanels'
};
</script>
