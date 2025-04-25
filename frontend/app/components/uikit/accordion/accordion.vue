<template>
  <lfx-card class="p-5">
    <pv-accordion class="p-accordion">
      <slot />
    </pv-accordion>
  </lfx-card>
</template>
<script setup lang="ts">
import LfxCard from '../card/card.vue';
</script>

<script lang="ts">
export default {
  name: 'LfxAccordion'
};
</script>
