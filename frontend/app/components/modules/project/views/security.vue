<template>
  <div class="container">
    <div class="flex justify-between pt-12">
      <div class="w-1/4 pr-10 flex-grow">
        <lfx-card class="p-6 w-full">
          <h3 class="text-heading-3 font-semibold font-secondary">
            OSPS Baseline score
          </h3>
        </lfx-card>
      </div>
      <div class="w-2/3">
        <lfx-card class="p-5">
          <h3 class="text-heading-3 font-semibold font-secondary">
            Criteria evaluation
          </h3>
        </lfx-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LfxCard from "~/components/uikit/card/card.vue";
</script>

<script lang="ts">
export default {
  name: 'LfxProjectSecurityView',
}
</script>
