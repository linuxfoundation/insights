<template>
  <lfx-card class="p-4 sm:p-6">
    <h3 class="text-heading-3 font-semibold font-secondary pb-3">
      Industry distribution
    </h3>
    <p class="text-body-2 text-neutral-500">
      It ranks contributors based on the number of code commits, pull requests, issues closed, and other metrics
      representing their relative activity levels and impact on the project.
    </p>
  </lfx-card>
</template>

<script setup lang="ts">
import LfxCard from "~/components/uikit/card/card.vue";
</script>

<script lang="ts">
export default {
  name: 'LfxProjectIndustryDistribution',
}
</script>
