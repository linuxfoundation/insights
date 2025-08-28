<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div
    class="container pt-10"
  >
    <lfx-accordion v-model="accordion">
      <lfx-accordion-item
        name="cncf"
        class="bg-white"
      >
        CNCF
      </lfx-accordion-item>
    </lfx-accordion>
  </div>
</template>

<script setup lang="ts">
import LfxAccordion from "~/components/uikit/accordion/accordion.vue";
import LfxAccordionItem from "~/components/uikit/accordion/accordion-item.vue";

const accordion = ref<string>('');
</script>

<script lang="ts">
export default {
  name: 'LfxOsiListCollections'
};
</script>
